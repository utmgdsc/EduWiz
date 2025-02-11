from pydantic import BaseModel, Field


class RenderRequest(BaseModel):
    prompt: str = Field(
        ...,
        title="Render Prompt",
        description="The prompt given by the user for the requested video, will be used to generate the Manim code",
    )
