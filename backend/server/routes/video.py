from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from server.lib import renderer
import os

from server.schemas.render import RenderRequest

router = APIRouter(tags=["render"])


@router.post(
    "/render", summary="Render a video with the given prompt and return the video file"
)
async def render(data: RenderRequest):
    """
    Renders a video based on the provided prompt.

    **Parameters:**
    - **data: RenderRequest**: A JSON object containing:
        - **prompt (str)**: The prompt provided by the user, which will be used to generate the Manim code for the video.

    **Returns:**
    - **FileResponse**: A streaming response containing the rendered video file in MP4 format.
      The response is sent with a media type of "video/mp4" and the file is named "output.mp4".
    """
    # prompt = data.prompt

    # if not prompt:
    #     raise HTTPException(status_code=400, detail="Missing 'prompt' in request body")

    # Api calls to turn prompt into code

    # temporary file for testing, located at root of project
    current_file = os.path.dirname(__file__)
    example_file = os.path.abspath(os.path.join(current_file, "../../../example.py"))

    with open(example_file, "r") as f:
        code = f.read()

    try:
        video_path = renderer.render_manim_code(code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return FileResponse(video_path, media_type="video/mp4", filename="output.mp4")
