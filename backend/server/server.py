import asyncio
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from server.logger import setup_logger
from server.routes import health, video, vector, s3
from server.services.rabbitmq import RabbitMQConnection
from server.services.status import listen_status_updates
from server.lib.firebase import initialize_firebase


setup_logger()
logger = logging.getLogger("eduwiz.server")


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_firebase()
    rabbit_conn = await RabbitMQConnection.get_instance()
    rabbit_conn = rabbit_conn.connect()
    logger.info("RabbitMQ connection initialized")
    asyncio.create_task(listen_status_updates())
    logger.info("App ready 🚀")
    yield
    rabbit_conn.close()


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
app.include_router(s3.router)
