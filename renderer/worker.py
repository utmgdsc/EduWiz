from typing import AsyncIterable
import aio_pika
import asyncio
import logging
import os
import json
import shutil
import re
from pathlib import Path

logger = logging.getLogger(__name__)
JOB_LIMIT = 10


class RabbitMQConnection:
    """
    Singleton class which handles connections to the RabbitMQ server and ensuring that the connection is always alive
    """

    _instance = None
    _connection = None
    _channel = None

    def __init__(self):
        self.url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")

    @classmethod
    async def get_instance(cls):
        if not cls._instance:
            cls._instance = cls()
        return cls._instance

    async def connect(self):
        """Establishes a connection to RabbitMQ and deals with reconnecting when necessary"""
        try:
            if not self._connection or self._connection.is_closed:
                logger.info(f"Connecting to RabbitMQ at {self.url}")
                self._connection = await aio_pika.connect_robust(self.url)

            if not self._channel or self._channel.is_closed:
                self._channel = await self._connection.channel()

                # Enables round-robin dispatching with JOB_LIMIT jobs per container.
                await self._channel.declare_queue("render_jobs", durable=True)
                logger.info("RabbitMQ channel established")
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            self._connection = None
            self._channel = None
            raise

    async def get_channel(self):
        """Return the current channel, reconnecting if necessary."""
        if not self._channel or self._channel.is_closed:
            await self.connect()
        return self._channel

    async def close(self):
        """Gracefully close the channel and connection."""
        if self._channel and not self._channel.is_closed:
            await self._channel.close()
        if self._connection and not self._connection.is_closed:
            await self._connection.close()
        self._channel = None
        self._connection = None


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

    def count_total_animations_in_code(self, code: str) -> int:
        play_count = len(re.findall(r"self\.play\(", code))
        wait_count = len(re.findall(r"self\.wait\(", code))
        total = play_count + wait_count
        return total

    async def _render_scene(self, job_id: str, scene_code: str) -> Path:
        temp_dir = self.temp_base / job_id
        temp_dir.mkdir(parents=True, exist_ok=True)

        await self.send_status_update(job_id, "started_rendering")

        try:
            scene_file = temp_dir / "scene.py"
            # write the Manim code to a file so that the CLI can use it
            scene_file.write_text(scene_code)

            total_animations = self.count_total_animations_in_code(scene_code)

            # Create a media directory for this job for use in --media_dir
            media_dir = temp_dir / "media"
            media_dir.mkdir(parents=True, exist_ok=True)

            # Run Manim using the CLI
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

            animation_regex = re.compile(r"Animation (\d+) :")

            # Read every line that manim outputs, matching for the current animation
            # so that we can know the current progress
            last_progress = 0
            while True:
                line = await process.stdout.readline()
                if not line:
                    break
                line = line.decode("utf-8").strip()
                match = animation_regex.search(line)
                if match:
                    current_animation = int(match.group(1)) + 1
                    progress = (current_animation / total_animations) * 100
                    new_progress = int(progress // 10) * 10
                    if new_progress > last_progress:
                        await self.send_status_update(job_id, str(new_progress))
                        last_progress = new_progress

            await process.wait()

            if process.returncode != 0:
                await self.send_status_update(job_id, "error")
                raise RuntimeError("Render failed")

            # Get the final rendered video in the temporary directory
            video_file = next(temp_dir.rglob("*.mp4"), None)
            if not video_file:
                await self.send_status_update(job_id, "error")
                raise FileNotFoundError("No video file was produced")

            await self.send_status_update(job_id, "rendering_complete")

            # Copy the video to the output directory
            output_file = self.output_path / f"{job_id}.mp4"
            shutil.copy2(str(video_file), str(output_file))

            await self.send_status_update(job_id, "completed")

            return output_file

        finally:
            # Clean up the temporary directory
            try:
                if temp_dir.exists():
                    shutil.rmtree(temp_dir)
            except Exception as e:
                logger.error(f"Failed to clean up temporary directory {temp_dir}: {e}")

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

        queue = await channel.declare_queue("render_jobs", durable=True)

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
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,  # Makes it so that message is saved in case of errors
            ),
            routing_key="status_updates",
        )


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    manager = RenderManager()
    asyncio.run(manager.run())
