import asyncio
import logging
from fastapi import FastAPI
from contextlib import asynccontextmanager
from server.logger import setup_logger
from server.routes import health, video
from server.services.rabbitmq import RabbitMQConnection
from server.services.status import listen_status_updates


setup_logger()
logger = logging.getLogger("eduwiz.server")


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("App ready 🚀")
    rabbit_conn = await RabbitMQConnection.get_instance()
    rabbit_conn = rabbit_conn.connect()
    logger.info("RabbitMQ connection initialized")
    asyncio.create_task(listen_status_updates())
    yield
    rabbit_conn.close()


app = FastAPI(
    lifespan=lifespan,
    title="EduWiz API",
)


app.include_router(health.router)
app.include_router(video.router)
