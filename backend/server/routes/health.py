from fastapi import APIRouter

from server.schemas.health import HealthCheck

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    summary="Test if API is working with a simple get request",
)
async def health_check():
    return {"status": "healthy", "message": "API is working as expected"}


@router.post(
    "/health",
    summary="Tests the API with a simple post request which echoes the given data",
)
async def post_check(message: HealthCheck):
    return {"status": "healthy", "received_message": message.message}
