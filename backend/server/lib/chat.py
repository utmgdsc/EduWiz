from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import asyncio
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_core.chat_history import BaseChatMessageHistory, InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
import os
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("OPENAI_API_KEY")
llm = ChatOpenAI(model="o3-mini-2025-01-31", openai_api_key=key)

store = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

with_message_history = RunnableWithMessageHistory(llm, get_session_history)

def chat(message: str, session_id: str) -> str:
    config = {"configurable": {"session_id": session_id}}
    response = with_message_history.invoke([HumanMessage(content = message)], config = config)
    return response.content

def systemchat(message: str, script: str, session_id: str) -> str:
    config = {"configurable": {"session_id": session_id}}
    response = with_message_history.invoke([SystemMessage(content = script), HumanMessage(content = message)], config = config)
    return response.content

router = APIRouter(tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    script: Optional[str]
    session_id: str

@router.post("/chat", summary="Chat application")
async def chat_endpoint(request: ChatRequest):
    if get_session_history(request.session_id).messages == []:
        try:
            res = await asyncio.to_thread(systemchat, request.message, request.script, request.session_id)
            return {"response": res}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        try:
            res = await asyncio.to_thread(chat, request.message, request.session_id)
            return {"response": res}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
