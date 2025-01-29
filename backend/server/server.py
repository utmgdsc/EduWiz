import logging

from fastapi import FastAPI
from contextlib import asynccontextmanager

logging.basicConfig(
    format="%(name)s - %(levelname)s - %(asctime)s - %(message)s",
    level=logging.DEBUG,
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("App ready 🚀")
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/")
def index():
    return "Hello World"
