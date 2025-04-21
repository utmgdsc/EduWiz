import os
import uuid
import pydantic
import aiobotocore
import aiobotocore.session

from typing import Literal
from fastapi import APIRouter, Depends

from server.lib.auth import FirebaseAuthMiddleware
from server.lib.auth.invariant import email_is_verified

router = APIRouter(
    prefix="/s3",
    tags=["s3"],
    dependencies=[Depends(FirebaseAuthMiddleware(email_is_verified))],
)


S3_REGION = os.getenv("AWS_REGION")
S3_PUBLIC_URL = os.getenv("S3_PUBLIC_URL")
S3_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
S3_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

MIN_URL_LIFESPAN, MAX_URL_LIFESPAN = 15, 3600

_boto_session = aiobotocore.session.get_session()


async def get_s3_client():
    async with _boto_session.create_client(
        "s3",
        region_name=S3_REGION,
        aws_secret_access_key=S3_SECRET_ACCESS_KEY,
        aws_access_key=S3_ACCESS_KEY,
    ) as client:
        yield client


class PresignedURLQuery(pydantic.BaseModel):
    bucket: str
    expiry: int
    method: Literal["put_object", "get_object"]
    path: str | None = None


class PresignedURLGeneration(pydantic.BaseModel):
    key: str
    bucket: str
    expiry: int
    upload_url: str
    public_url: str


@router.post("/generate-presigned-url")
async def generate_presigned_url(
    query: PresignedURLQuery, s3=Depends(get_s3_client)
) -> PresignedURLGeneration:
    """
    Generate a presigned URL for S3 operations.

    This endpoint creates a presigned URL that allows temporary access to perform
    S3 operations (put_object or get_object) without requiring AWS credentials.

    Parameters:
    - query: PresignedURLQuery containing:
        - bucket: The S3 bucket name
        - expiry: Desired URL expiration time in seconds (between 15-3600 seconds)
        - method: The S3 operation ("put_object" or "get_object")
        - path: Optional path prefix for the object key

    Returns:
    - PresignedURLGeneration object containing:
        - url: The presigned URL
        - key: The generated object key (UUID with optional path prefix)
        - bucket: The S3 bucket name
        - expiry: The actual expiration time in seconds

    Note: Expiry time is clamped between MIN_URL_LIFESPAN and MAX_URL_LIFESPAN.
    """
    uid = str(uuid.uuid4())
    key = f"{query.path}/{uid}" if query.path is not None else uid
    public_url = f"{S3_PUBLIC_URL}/{query.bucket}/{key}"
    expiry = max(min(query.expiry, MAX_URL_LIFESPAN), MIN_URL_LIFESPAN)

    upload_url = s3.generate_presigned_url(
        method=query.method,
        ExpiresIn=expiry,
        Params=dict(bucket=query.bucket, key=key),
    )

    return PresignedURLGeneration(
        key=key,
        bucket=query.bucket,
        expiry=expiry,
        upload_url=upload_url,
        public_url=public_url,
    )
