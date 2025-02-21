import logging
from fastapi import FastAPI
from contextlib import asynccontextmanager
from server.logger import setup_logger
from server.routes import health, video
from server.services.rabbitmq import RabbitMQConnection


setup_logger()
logger = logging.getLogger("eduwiz.server")


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("App ready 🚀")
    yield


app = FastAPI(
    lifespan=lifespan,
    title="EduWiz API",
)


@app.on_event("startup")
async def startup_event():
    # Initialize RabbitMQ connection
    await RabbitMQConnection.get_instance()
    logger.info("RabbitMQ connection initialized")


app.include_router(health.router)
app.include_router(video.router)
