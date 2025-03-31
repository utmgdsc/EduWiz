import aio_pika
import os
import logging

logger = logging.getLogger("eduwiz.rabbitmq")

class RabbitMQConnection:
    """
    Singleton class which handles connections to the RabbitMQ server and ensuring that the connection is always alive
    """

    _instance = None
    _connection = None
    _channel = None

    def __init__(self):
        self.url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")

    @classmethod
    async def get_instance(cls):
        if not cls._instance:
            cls._instance = cls()
        return cls._instance

    async def connect(self):
        """Establishes a connection to RabbitMQ and deals with reconnecting when necessary"""
        try:
            if not self._connection or self._connection.is_closed:
                logger.info(f"Connecting to RabbitMQ at {self.url}")
                self._connection = await aio_pika.connect_robust(self.url)

            if not self._channel or self._channel.is_closed:
                self._channel = await self._connection.channel()

                # Enables round-robin dispatching with JOB_LIMIT jobs per container.
                await self._channel.declare_queue("render_jobs", durable=True)
                # Declare the retry queue
                await self._channel.declare_queue("retry_queue", durable=True)
                logger.info("RabbitMQ channel established")
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            self._connection = None
            self._channel = None
            raise

    async def get_channel(self):
        """Return the current channel, reconnecting if necessary."""
        if not self._channel or self._channel.is_closed:
            await self.connect()
        return self._channel

    async def close(self):
        """Gracefully close the channel and connection."""
        if self._channel and not self._channel.is_closed:
            await self._channel.close()
        if self._connection and not self._connection.is_closed:
            await self._connection.close()
        self._channel = None
        self._connection = None