import logging
from fastapi import APIRouter
from server.schemas.health import HealthCheck

router = APIRouter(tags=["health"])
logger = logging.getLogger("eduwiz.routes.health")


@router.get(
    "/health",
    summary="Test if API is working with a simple get request",
)
async def health_check():
    logger.debug("Health check GET request received")
    return {"status": "healthy", "message": "API is working as expected"}


@router.post(
    "/health",
    summary="Tests the API with a simple post request which echoes the given data",
)
async def post_check(message: HealthCheck):
    logger.debug(f"Health check POST request received with message: {message.message}")
    return {"status": "healthy", "received_message": message.message}
