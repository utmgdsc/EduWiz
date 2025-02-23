import aio_pika
import logging
from typing import Optional
import os

logger = logging.getLogger(__name__)

PER_CONTAINER = 10


class RabbitMQConnection:
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
        """Establish connection to RabbitMQ"""
        try:
            if not self._connection or self._connection.is_closed:
                logger.info(f"Connecting to RabbitMQ at {self.url}")
                self._connection = await aio_pika.connect_robust(self.url)

            if not self._channel or self._channel.is_closed:
                self._channel = await self._connection.channel()
                # To enable fair dispatching in round robin
                await self._channel.set_qos(prefetch_count=PER_CONTAINER)
                # Declare the render_jobs queue
                await self._channel.declare_queue("render_jobs", durable=True)
                await self._channel.declare_queue("status_updates")
                logger.info("RabbitMQ channel established")

        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {str(e)}")
            self._connection = None
            self._channel = None
            raise

    async def get_channel(self):
        """Get or create a channel"""
        if not self._channel or self._channel.is_closed:
            await self.connect()
        return self._channel

    async def close(self):
        """Close connection and channel"""
        if self._channel and not self._channel.is_closed:
            await self._channel.close()
        if self._connection and not self._connection.is_closed:
            await self._connection.close()
        self._channel = None
        self._connection = None
