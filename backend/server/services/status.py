import json
import logging
import aio_pika
from firebase_admin import db
from server.services.rabbitmq import RabbitMQConnection

logger = logging.getLogger(__name__)


async def listen_status_updates():
    """Listener for status updates, starts listening to the queue and calls process_status_update on any message"""
    rabbitmq = await RabbitMQConnection.get_instance()
    channel = await rabbitmq.get_channel()
    queue = await channel.declare_queue("status_updates", durable=False)

    logger.info("Status updates listener has started")

    # Setup listener for status updates
    await queue.consume(process_status_update)


async def process_status_update(message: aio_pika.abc.AbstractIncomingMessage):
    """Will handle the incoming message, using the status to update the job_id object in the database"""
    try:
        data = json.loads(message.body.decode())
        job_id = data["job_id"]
        status = data["status"]

        ref = db.reference(f"jobs/{job_id}")
        ref.update(
            {
                "status": status,
                "timestamp": {".sv": "timestamp"},  # Server timestamp
            }
        )

        await message.ack()

        logger.info(f"Updated status for job {job_id} in database")
    except Exception as e:
        logger.error(f"Error processing status update: {e}")
        # Not requeing messages for now
        await message.reject(requeue=False)


async def send_status_update(job_id: str, status: str):
    """Enqueues a new message with job_id and status to the status_updates queue"""
    rabbitmq = await RabbitMQConnection.get_instance()
    channel = await rabbitmq.get_channel()

    message = {"job_id": job_id, "status": status}

    # Publish job order to the queue
    await channel.default_exchange.publish(
        aio_pika.Message(
            body=json.dumps(message).encode(),
            content_type="application/json",
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,  # Makes it so that message is saved in case of errors
        ),
        routing_key="status_updates",
    )
