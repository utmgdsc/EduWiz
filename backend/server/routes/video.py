from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from server.lib import renderer
import os

router = APIRouter(tags=["render"])


@router.post(
    "/render", summary="Render a video with the given prompt and return the video file"
)
async def post_check(request: Request):
    # data = await request.json()
    # prompt = data.get("prompt")

    # if not prompt:
    #     raise HTTPException(status_code=400, detail="Missing 'prompt' in request body")

    # Api calls to turn prompt into code

    # temporary file for testing, located at root of project
    current_file = os.path.dirname(__file__)
    print(current_file)
    example_file = os.path.abspath(os.path.join(current_file, "../../../example.py"))

    with open(example_file, "r") as f:
        code = f.read()

    try:
        video_path = renderer.render_manim_code(code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return FileResponse(video_path, media_type="video/mp4", filename="output.mp4")
