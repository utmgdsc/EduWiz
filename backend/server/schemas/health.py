from pydantic import BaseModel, Field


class HealthCheck(BaseModel):
    message: str = Field(
        default="echo", description="Message to be returned", examples=["ping"]
    )
