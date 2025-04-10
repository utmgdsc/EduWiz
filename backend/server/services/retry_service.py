import logging
import json
import aio_pika
import asyncio

from server.lib.retry import retry
from server.services.rabbitmq import RabbitMQConnection
from server.services.status import send_status_update

logger = logging.getLogger("eduwiz.services.retry")


class RetryService:
    """
    Service for handling the retry queue and processing failed render jobs.
    """

    _instance = None

    @classmethod
    async def get_instance(cls):
        if not cls._instance:
            cls._instance = cls()
            # Start the retry consumer in the background
            asyncio.create_task(cls._instance.start_retry_consumer())
        return cls._instance

    async def start_retry_consumer(self):
        """
        Start consuming messages from the retry queue to fix and resubmit failed render jobs.
        """
        try:
            logger.info("Starting retry queue consumer")
            rabbitmq = await RabbitMQConnection.get_instance()
            channel = await rabbitmq.get_channel()

            # Declare the queue to make sure it exists
            retry_queue = await channel.declare_queue("retry_queue", durable=True)

            # Set up the message handler
            await retry_queue.consume(self._retry_message_handler)
            logger.info("Retry queue consumer started")

        except Exception as e:
            logger.error(f"Failed to set up retry queue consumer: {e}")
            # Wait a bit and try again
            await asyncio.sleep(5)
            asyncio.create_task(self.start_retry_consumer())

    async def _retry_message_handler(
        self, message: aio_pika.abc.AbstractIncomingMessage
    ):
        """
        Handle incoming retry messages.
        Each message contains a job_id and a list of scenes with errors.
        """
        async with message.process(requeue=False):
            job_id = None
            try:
                data = json.loads(message.body.decode())
                job_id = data["job_id"]
                scenes = data["scenes"]

                logger.info(
                    f"Processing retry for job {job_id} with {len(scenes)} scenes"
                )
                await send_status_update(job_id, "fixing_errors")

                # Process scenes with the retry function from retry.py
                # We're already in an async context, so we can directly await retry()
                fixed_scenes = await retry(scenes)

                # Requeue the job with fixed scenes
                await send_status_update(job_id, "retrying_render")

                # Create a message for the render queue
                retry_message = {
                    "job_id": job_id,
                    "manim_code": fixed_scenes,
                }

                # Get RabbitMQ connection
                rabbitmq = await RabbitMQConnection.get_instance()
                channel = await rabbitmq.get_channel()

                # Publish to render_jobs queue
                await channel.default_exchange.publish(
                    aio_pika.Message(
                        body=json.dumps(retry_message).encode(),
                        content_type="application/json",
                    ),
                    routing_key="render_jobs",
                )

                logger.info(f"Job {job_id} successfully retried and requeued")

            except Exception as e:
                if job_id:
                    logger.error(f"Failed to process retry for job {job_id}: {e}")
                    await send_status_update(job_id, "error")
                else:
                    logger.error(f"Failed to process retry message: {e}")
