import asyncio
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from server.logger import setup_logger
from server.routes import health, video, vector
from server.services.rabbitmq import RabbitMQConnection
from server.services.status import listen_status_updates
from server.services.retry_service import RetryService
from server.lib.firebase import initialize_firebase


setup_logger()
logger = logging.getLogger("eduwiz.server")


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_firebase()
    rabbit_conn = await RabbitMQConnection.get_instance()
    await rabbit_conn.connect()
    logger.info("RabbitMQ connection initialized")

    # Start status updates listener
    asyncio.create_task(listen_status_updates())

    # Initialize the retry service
    retry_service = await RetryService.get_instance()
    logger.info("Retry service initialized")

    logger.info("App ready 🚀")
    yield
    await rabbit_conn.close()


app = FastAPI(
    lifespan=lifespan,
    title="EduWiz API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with a list of allowed origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(video.router)
app.include_router(vector.router)
