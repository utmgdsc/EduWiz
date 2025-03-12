import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import os
import uuid
import aio_pika
from pathlib import Path
import json
import asyncio

from server.schemas.render import RenderRequest
from server.services.rabbitmq import RabbitMQConnection
from server.lib.generator import ask
from server.services.status import send_status_update

router = APIRouter(tags=["render"])
logger = logging.getLogger("eduwiz.routes.video")

VIDEOS_DIR = Path(os.getenv("OUTPUT_PATH", "/shared/videos"))


@router.post(
    "/render", summary="Render a video with the given prompt and return the video file"
)
async def render(data: RenderRequest, background_tasks: BackgroundTasks):
    """
    Renders a video based on the provided prompt.

    **Parameters:**
    - **data: RenderRequest**: A JSON object containing:
        - **prompt (str)**: The prompt provided by the user, which will be used to generate the Manim code for the video.
        - **Job Id (str)**: The job id for the new render job being requested

    """
    job_id = data.jobid

    prompt = data.prompt

    if not prompt:
        raise HTTPException(status_code=400, detail="Missing 'prompt' in request body")

    if not job_id:
        raise HTTPException(status_code=400, detail="Missing 'jobid' in request body")

    background_tasks.add_task(process_render_job, job_id, prompt)

    return {"job_id": job_id}


async def process_render_job(job_id: str, prompt: str):
    # Try to generate code the given prompt

    await send_status_update(job_id, "started_generation")
    try:
        ask_task = asyncio.create_task(ask(prompt))
        code = await ask_task
    except Exception as e:
        logger.error(f"Job {job_id} generation was not successful\n With error: {e}")
        await send_status_update(job_id, "error")
        return

    await send_status_update(job_id, "ended_generation")

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


## Temporary to be replaced with the firebase realtime db TODO
@router.get("/render/{job_id}/video")
async def get_video(job_id: str):
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
