import pydantic
import pathlib

from typing import Literal
from fastapi import APIRouter, Depends

from langchain_openai import ChatOpenAI

from langchain_core.language_models.chat_models import BaseChatModel

from server.lib.auth import FirebaseAuthMiddleware
from server.lib.auth.invariant import email_is_verified

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    dependencies=[Depends(FirebaseAuthMiddleware(email_is_verified))],
)


def get_system_prompt() -> str:
    with open(pathlib.Path(__file__).parent.parent / "lib" / "chat_system.txt") as f:
        return f.read()


async def get_llm() -> BaseChatModel:
    """Chosen language Model gpt-4o-mini for testing purposes"""
    return ChatOpenAI(model="gpt-4o-mini-2024-07-18")


class Message(pydantic.BaseModel):
    type: Literal["system", "user", "assistant"]
    content: str


class VideoChatContext(pydantic.BaseModel):
    prompt: str
    initial_prompt: str
    video_context: str
    messages: list[Message]


@router.post("/message_video", response_model=Message)
async def message_video(
    chat_history: VideoChatContext,
    llm: BaseChatModel = Depends(get_llm),
):
    """Respond to the user with chat context"""
    system_prompt = get_system_prompt()

    system_message = Message(
        type="system",
        content=system_prompt.format(
            initial_prompt=chat_history.initial_prompt,
            context=chat_history.video_context,
        ),
    )

    messages = list(
        map(Message.model_dump, [system_message] + chat_history.messages[:30])
    )

    result = await llm.ainvoke(messages)

    return Message(
        type="assistant",
        content=result.content,
    )
