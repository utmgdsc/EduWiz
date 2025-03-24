import logging
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
import os
import uuid
import aio_pika
from pathlib import Path
import json
import asyncio

from server.lib.auth import FirebaseAuthMiddleware
from server.lib.auth.invariant import email_is_verified

from server.schemas.render import RenderRequest
from server.services.rabbitmq import RabbitMQConnection
from server.lib.generator import ask
from server.services.status import (
    check_job_uid,
    send_status_update,
    initialize_job_status,
    delete_job_data,
)

router = APIRouter(
    tags=["render"], dependencies=[Depends(FirebaseAuthMiddleware(email_is_verified))]
)
logger = logging.getLogger("eduwiz.routes.video")

VIDEOS_DIR = Path(os.getenv("OUTPUT_PATH", "/shared/videos"))


@router.post(
    "/render",
    summary="Render a video with the given prompt and return the video file",
)
async def render(
    data: RenderRequest,
    background_tasks: BackgroundTasks,
    decoded_token: dict = Depends(FirebaseAuthMiddleware(email_is_verified)),
):
    """
    Renders a video based on the provided prompt.

    **Parameters:**
    - **data: RenderRequest**: A JSON object containing:
        - **prompt (str)**: The prompt provided by the user, which will be used to generate the Manim code for the video.
        - **Job Id (str)**: The job id for the new render job being requested

    """
    uid = decoded_token.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Unauthorized: missing uid")

    job_id = data.jobid

    prompt = data.prompt

    if not prompt:
        raise HTTPException(status_code=400, detail="Missing 'prompt' in request body")

    if not job_id:
        raise HTTPException(status_code=400, detail="Missing 'jobid' in request body")

    background_tasks.add_task(process_render_job, job_id, prompt)

    try:
        await initialize_job_status(job_id, uid)
    except Exception as e:
        logger.error(f"Failed to initialize job status for job {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize job status")

    return {"job_id": job_id}


async def process_render_job(job_id: str, prompt: str):
    logger.info(f"Received new job {job_id}")

    await send_status_update(job_id, "started_generation")
    try:
        ask_task = asyncio.create_task(ask(prompt))
        code = await ask_task
    except Exception as e:
        logger.error(f"Job {job_id} generation was not successful\n With error: {e}")
        await send_status_update(job_id, "error")
        return

    await send_status_update(job_id, "ended_generation")
    logger.info(f"Generation ended for job_id {job_id}")

    try:
        rabbitmq = await RabbitMQConnection.get_instance()
        channel = await rabbitmq.get_channel()

        message = {
            "job_id": job_id,
            "manim_code": code,
        }

        # Publish job order to the queue
        await channel.default_exchange.publish(
            aio_pika.Message(
                body=json.dumps(message).encode(),
                content_type="application/json",
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,  # Makes it so that message is saved in case of errors
            ),
            routing_key="render_jobs",
        )

        logger.info(f"Job {job_id} queued successfully")

    except Exception as e:
        logger.error(f"Failed to queue job: {e}")
        await send_status_update(job_id, "error")


@router.get("/render/{job_id}/video")
async def get_video(
    job_id: str,
    decoded_token: dict = Depends(FirebaseAuthMiddleware(email_is_verified)),
):
    """
    Retrieve a rendered video by its job ID.

    **Parameters:**
    - **job_id (str)**: The UUID of the render job
    """
    # Validate job_id format
    try:
        uuid.UUID(job_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid job ID format")

    uid = decoded_token.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Unauthorized: missing uid")

    is_owner = await check_job_uid(job_id, uid)
    if not is_owner:
        raise HTTPException(
            status_code=403, detail="Forbidden: You do not own this job"
        )

    video_path = VIDEOS_DIR / f"{job_id}.mp4"

    if not video_path.exists():
        logger.info(f"Video not found for job {job_id}")
        raise HTTPException(status_code=404, detail="Video not found")

    try:
        return FileResponse(
            str(video_path), media_type="video/mp4", filename=f"{job_id}.mp4"
        )
    except Exception as e:
        logger.error(f"Failed to serve video {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to serve video file")


@router.delete("/render/{job_id}")
async def delete_job(
    job_id: str,
    decoded_token: dict = Depends(FirebaseAuthMiddleware(email_is_verified)),
):
    """
    Delete a render job by its ID, including the video file and database entry.

    This endpoint checks that the requesting user is the owner of the job before deletion.

    **Parameters:**
    - **job_id (str)**: The UUID of the render job to delete
    """
    try:
        uuid.UUID(job_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid job ID format")

    uid = decoded_token.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Unauthorized: missing uid")

    is_owner = await check_job_uid(job_id, uid)
    if not is_owner:
        raise HTTPException(
            status_code=403, detail="Forbidden: You do not own this job"
        )

    video_path = VIDEOS_DIR / f"{job_id}.mp4"
    file_deleted = False

    if video_path.exists():
        try:
            video_path.unlink()
            file_deleted = True
            logger.info(f"Deleted video file for job {job_id}")
        except Exception as e:
            logger.error(f"Failed to delete video file for job {job_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete video file")

    db_deleted = await delete_job_data(job_id)

    if not db_deleted:
        if file_deleted:
            raise HTTPException(
                status_code=500,
                detail="Deleted video file but failed to delete database entry",
            )
        raise HTTPException(status_code=500, detail="Failed to delete job data")

    return {"message": "Job deleted successfully", "job_id": job_id}
