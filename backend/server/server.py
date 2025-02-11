import logging
from fastapi import FastAPI
from contextlib import asynccontextmanager
from server.logger import setup_logger
from .routes import health, video


setup_logger()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("App ready 🚀")
    yield


app = FastAPI(
    lifespan=lifespan,
    title="EduWiz API",
)
app.include_router(health.router)
app.include_router(video.router)


@app.get("/")
def index():
    return "Hello World"
