import asyncio
from pathlib import Path
import aio_pika
import json
import tempfile
import shutil
import logging
import os

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


class RenderManager:
    def __init__(self):
        self.rabbitmq_url = os.getenv(
            "RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"
        )
        self.output_path = Path(os.getenv("OUTPUT_PATH", "/shared/videos"))
        self.temp_base = Path(os.getenv("TEMP_DIR", "/app/temp"))

        self.temp_base.mkdir(parents=True, exist_ok=True)
        self.output_path.mkdir(parents=True, exist_ok=True)

        # verify write permissions
        try:
            test_file = self.temp_base / ".write_test"
            test_file.touch()
            test_file.unlink()
        except PermissionError:
            raise RuntimeError(
                f"No write permission in temporary directory: {self.temp_base}"
            )

        try:
            test_file = self.output_path / ".write_test"
            test_file.touch()
            test_file.unlink()
        except PermissionError:
            raise RuntimeError(
                f"No write permission in output directory: {self.output_path}"
            )

    async def _render_scene(
        self, job_id: str, scene_code: str, scene_name: str
    ) -> Path:
        temp_dir = self.temp_base / job_id
        temp_dir.mkdir(parents=True, exist_ok=True)

        try:
            scene_file = temp_dir / "scene.py"
            # Write manim code to file for manim cli
            scene_file.write_text(scene_code)

            # create media directory for new job
            media_dir = temp_dir / "media"
            media_dir.mkdir(parents=True, exist_ok=True)

            # run manim
            process = await asyncio.create_subprocess_exec(
                "manim",
                str(scene_file),
                scene_name,
                "-qm",
                "--media_dir",
                str(media_dir),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                raise RuntimeError(f"Render failed: {stderr.decode()}")

            # Find output file
            video_file = next(temp_dir.rglob("*.mp4"), None)
            if not video_file:
                raise FileNotFoundError("No video file was produced")

            # Move to output directory using copy then delete
            output_file = self.output_path / f"{job_id}.mp4"
            shutil.copy2(str(video_file), str(output_file))

            return output_file

        finally:
            # Clean up temporary directory
            try:
                if temp_dir.exists():
                    shutil.rmtree(temp_dir)
            except Exception as e:
                logger.error(f"Failed to clean up temporary directory {temp_dir}: {e}")

    async def _message_handler(self, message: aio_pika.abc.AbstractIncomingMessage):
        async with message.process():
            data = json.loads(message.body.decode())
            job_id = data["job_id"]

            try:
                logger.info(f"Started job {job_id}")
                await self._render_scene(job_id, data["manim_code"], data["scene_name"])
                logger.info(f"Completed job {job_id}")
            except Exception as e:
                logger.exception(f"Failed to render job {job_id} with error {e}")
                await message.reject(
                    requeue=False
                )  # We will not requeue failed jobs for now

    async def run(self, job_limit: int):
        # Verify directories are accessible before starting
        if not self.output_path.is_dir():
            raise RuntimeError(f"Output directory not accessible: {self.output_path}")
        if not self.temp_base.is_dir():
            raise RuntimeError(f"Temporary directory not accessible: {self.temp_base}")

        connection = await aio_pika.connect_robust(self.rabbitmq_url)
        async with connection:
            channel = await connection.channel()
            await channel.set_qos(prefetch_count=job_limit)
            queue = await channel.declare_queue("render_jobs", durable=True)

            logger.info(f"Started render manager (job_limit={job_limit})")
            logger.info(f"Using temp directory: {self.temp_base}")
            logger.info(f"Using output directory: {self.output_path}")

            await queue.consume(self._message_handler)

            try:
                await asyncio.Future()  # run forever
            except asyncio.CancelledError:
                logger.info("Shutting down render manager")


if __name__ == "__main__":
    manager = RenderManager()
    asyncio.run(manager.run(job_limit=2))
