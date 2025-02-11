import logging
from ntpath import exists
import os
import subprocess
import tempfile
import shutil
import uuid

logger = logging.getLogger(__name__)


def render_manim_code(code: str) -> str:
    # This solution is temporary as we will probably send the code to something like
    # Google cloud runner instead. This will also improve security as this is currently
    # very vulnerable to malicious code execution

    output_id = str(uuid.uuid4())

    # Create a temporary directory to hold the python code and manim output.
    with tempfile.TemporaryDirectory() as tmpdir:
        manim_file = os.path.join(tmpdir, "scene.py")
        with open(manim_file, "w") as f:
            f.write(code)

        command = [
            "manim",
            "-qm",
            "--format",
            "mp4",
            "--media_dir",
            tmpdir,
            manim_file,
            "-o",
            output_id,
            "MainScene",
        ]

        # Try to generate the video
        try:
            subprocess.run(command, capture_output=True, text=True, check=True)
        except subprocess.CalledProcessError as e:
            message = f"Manim render error: {e.stderr}"
            logging.error(message, exc_info=True)
            raise RuntimeError(message) from e

        video_file = os.path.join(
            tmpdir, "videos", "scene", "720p30", f"{output_id}.mp4"
        )

        if not os.path.exists(video_file):
            message = f"Video file {video_file} not found after rendering"
            logger.error(message)
            raise RuntimeError(message)

        # If the video is found copy it to backend\output\ folder
        output_dir = os.path.dirname("./output/")
        os.makedirs(output_dir, exist_ok=True)

        final_video_path = os.path.join(output_dir, f"{output_id}.mp4")

        try:
            shutil.copy(video_file, final_video_path)
        except Exception as e:
            message = f"Error copying video file: {str(e)}"
            logger.error(message, str(e), exc_info=True)
            raise RuntimeError(message) from e

        logger.info(
            f"Video rendered and copied successfully to {final_video_path}",
        )
        return final_video_path
