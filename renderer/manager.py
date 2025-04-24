import asyncio
import json
import os
import re
import shutil
import logging
from pathlib import Path

import aio_pika

from rabbitmq import RabbitMQConnection
from utils import count_total_animations_in_code, JOB_LIMIT

logger = logging.getLogger("eduwiz.manager")


class RenderManager:
    def __init__(self):
        self.output_path = Path(os.getenv("OUTPUT_PATH", "/shared/videos"))
        self.temp_base = Path(os.getenv("TEMP_DIR", "/app/temp"))

        # Create directories if they don't exist
        self.temp_base.mkdir(parents=True, exist_ok=True)
        self.output_path.mkdir(parents=True, exist_ok=True)

        # Verify that permissions are correct for the output and temporary folders
        try:
            test_file = self.temp_base / ".write_test"
            test_file.write_text("test")
            test_file.unlink()
        except PermissionError:
            raise RuntimeError(
                f"No write permission in temporary directory: {self.temp_base}"
            )

        try:
            test_file = self.output_path / ".write_test"
            test_file.write_text("test")
            test_file.unlink()
        except PermissionError:
            raise RuntimeError(
                f"No write permission in output directory: {self.output_path}"
            )

        logger.info("Renderer started successfully")

    async def _render_scene(self, job_id: str, scene_codes: list[str]) -> Path:
        base_temp_dir = self.temp_base / job_id
        base_temp_dir.mkdir(parents=True, exist_ok=True)

        await self.send_status_update(job_id, "started_rendering")
        logger.info(f"Started rendering for job {job_id}")

        # Initialize a list to collect error info for each scene
        scene_errors: list[tuple[str | None, str]] = [
            (None, code) for code in scene_codes
        ]
        has_errors = False

        try:
            # Create individual temp directories for each scene
            scenes_to_render = []
            for idx, scene_code in enumerate(scene_codes):
                scene_dir = base_temp_dir / f"scene_{idx}"
                scene_dir.mkdir(parents=True, exist_ok=True)

                scene_file = scene_dir / "scene.py"
                scene_file.write_text(scene_code)

                media_dir = scene_dir / "media"
                media_dir.mkdir(parents=True, exist_ok=True)

                # Only count animations for the first scene
                total_animations = None
                if idx == 0:
                    total_animations = count_total_animations_in_code(scene_code)

                scenes_to_render.append(
                    {
                        "idx": idx,
                        "scene_file": scene_file,
                        "media_dir": media_dir,
                        "scene_dir": scene_dir,
                        "total_animations": total_animations,
                    }
                )

            # Function to render a single scene
            async def render_single_scene(scene_info):
                idx = scene_info["idx"]
                scene_file = scene_info["scene_file"]
                media_dir = scene_info["media_dir"]
                total_animations = scene_info.get("total_animations")
                error_output = None

                process = await asyncio.create_subprocess_exec(
                    "manim",
                    str(scene_file),
                    "ManimVideo",
                    "-qm",
                    "--media_dir",
                    str(media_dir),
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )

                # Only track progress for the first scene
                if idx == 0 and total_animations:
                    animation_regex = re.compile(r"Animation (\d+) :")
                    last_progress = 0
                    stdout_lines = []

                    while True:
                        line = await process.stdout.readline()
                        if not line:
                            break
                        line_text = line.decode("utf-8").strip()
                        stdout_lines.append(line_text)

                        match = animation_regex.search(line_text)
                        if match:
                            current_animation = int(match.group(1)) + 1
                            progress = min(
                                100, (current_animation / total_animations) * 100
                            )
                            new_progress = min(100, int(progress // 10) * 10)
                            if new_progress > last_progress:
                                await self.send_status_update(job_id, str(new_progress))
                                last_progress = new_progress

                    try:
                        _, stderr = await asyncio.wait_for(
                            process.communicate(), timeout=120
                        )
                        stderr_text = stderr.decode("utf-8").strip()
                    except asyncio.TimeoutError:
                        process.kill()
                        error_output = f"Rendering for scene {idx} timed out"
                        return RuntimeError(error_output)

                    await self.send_status_update(job_id, "merging")
                    logger.info(f"Scene {idx} has finished rendering")

                    if process.returncode != 0:
                        error_output = stderr_text
                        return RuntimeError(error_output)
                else:
                    try:
                        stdout, stderr = await asyncio.wait_for(
                            process.communicate(), timeout=120
                        )
                        stdout_text = stdout.decode("utf-8").strip()
                        stderr_text = stderr.decode("utf-8").strip()
                        logger.info(f"Scene {idx} has finished rendering")

                        if process.returncode != 0:
                            error_output = stderr_text
                            return RuntimeError(error_output)
                    except asyncio.TimeoutError:
                        process.kill()
                        logger.error(
                            f"Scene {idx} rendering timed out after {120} seconds"
                        )
                        error_output = f"Render timed out for scene {idx}"
                        return RuntimeError(error_output)

                # Get the rendered video
                video_file = next(scene_info["scene_dir"].rglob("*.mp4"), None)
                if not video_file:
                    error_output = f"No video file was produced for scene {idx}"
                    return FileNotFoundError(error_output)

                return video_file

            # Render all scenes in parallel
            await self.send_status_update(job_id, "rendering_all_scenes")
            logger.info(
                f"Started rendering all {len(scenes_to_render)} scenes for job {job_id}"
            )
            scene_videos = await asyncio.gather(
                *[render_single_scene(scene_info) for scene_info in scenes_to_render],
                return_exceptions=True,
            )

            logger.info("Finished rendering all scenes")

            await self.send_status_update(job_id, "rendering_complete")

            # Check for exceptions and collect errors
            for i, result in enumerate(scene_videos):
                if isinstance(result, Exception):
                    has_errors = True
                    error_msg = str(result)
                    scene_errors[i] = (error_msg, scene_codes[i])
                    logger.error(f"Scene {i} rendering failed: {error_msg}")

            # If any errors occurred, update status and call error_handling
            if has_errors:
                await self.error_handler(job_id, scene_errors)
                raise RuntimeError(
                    "One or more scenes failed to render, retrying generation"
                )

            # All videos rendered successfully, now merge them
            await self.send_status_update(job_id, "merging_videos")

            # Create a file list for ffmpeg
            file_list_path = base_temp_dir / "file_list.txt"
            with open(file_list_path, "w") as f:
                for video_path in scene_videos:
                    f.write(f"file '{video_path.absolute()}'\n")

            # Final output path
            output_file = self.output_path / f"{job_id}.mp4"

            logger.info(f"Started merging scenes for job {job_id}")

            # Merge videos using ffmpeg
            merge_process = await asyncio.create_subprocess_exec(
                "ffmpeg",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(file_list_path),
                "-c",
                "copy",
                str(output_file),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            await merge_process.wait()

            logger.info(f"Ended merging scenes for job {job_id}")

            if merge_process.returncode != 0:
                stderr = await merge_process.stderr.read()
                error_msg = stderr.decode("utf-8").strip()
                logger.error(f"Video merge error: {error_msg}")
                await self.send_status_update(job_id, "error")
                raise RuntimeError("Failed to merge videos")

            await self.send_status_update(job_id, "completed")

            return output_file

        finally:
            # Clean up the temporary directory
            try:
                if base_temp_dir.exists():
                    shutil.rmtree(base_temp_dir)
            except Exception as e:
                logger.error(
                    f"Failed to clean up temporary directory {base_temp_dir}: {e}"
                )

    async def _message_handler(self, message: aio_pika.abc.AbstractIncomingMessage):
        async with message.process(requeue=False):
            data = json.loads(message.body.decode())
            job_id = data["job_id"]

            try:
                logger.info(f"Started job {job_id}")
                await self._render_scene(job_id, data["manim_code"])
                logger.info(f"Completed job {job_id}")
            except Exception as e:
                logger.exception(f"Failed to render job {job_id} with error: {e}")

    async def run(self):
        rabbit_conn = await RabbitMQConnection.get_instance()
        await rabbit_conn.connect()
        channel = await rabbit_conn.get_channel()

        queue = await channel.declare_queue("render_jobs")

        logger.info(f"Started render manager (job_limit={JOB_LIMIT})")
        logger.info(f"Using temp directory: {self.temp_base}")
        logger.info(f"Using output directory: {self.output_path}")

        await queue.consume(self._message_handler)

        try:
            await asyncio.Future()  # run forever
        except asyncio.CancelledError:
            logger.info("Shutting down render manager")
        finally:
            await rabbit_conn.close()

    async def send_status_update(self, job_id: str, status: str):
        rabbitmq = await RabbitMQConnection.get_instance()
        channel = await rabbitmq.get_channel()

        message = {"job_id": job_id, "status": status}

        # Publish job order to the queue
        await channel.default_exchange.publish(
            aio_pika.Message(
                body=json.dumps(message).encode(),
                content_type="application/json",
            ),
            routing_key="status_updates",
        )

    async def error_handler(self, job_id: str, scenes: list[tuple[str | None, str]]):
        # Send it back to the AI to retry
        # The scenes parameter is a list of ALL scenes, even the scenes without errors. The tuple[0] is the error str or None, tuple[1] is the code for all scenes.
        # The scenes should be in the same order as they arrived

        await self.send_status_update(job_id, "retrying")
        logger.info(f"Sending failed scenes for job {job_id} for retry")

        try:
            rabbitmq = await RabbitMQConnection.get_instance()
            channel = await rabbitmq.get_channel()

            # Create message with job_id and scenes with errors
            message = {"job_id": job_id, "scenes": scenes}

            # Publish to retry endpoint queue
            await channel.default_exchange.publish(
                aio_pika.Message(
                    body=json.dumps(message).encode(),
                    content_type="application/json",
                ),
                routing_key="retry_queue",
            )

            logger.info(f"Job {job_id} sent for retry")
        except Exception as e:
            logger.error(f"Failed to send job {job_id} for retry: {e}")
            await self.send_status_update(job_id, "error")
