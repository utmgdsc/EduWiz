from langchain_core.messages import HumanMessage
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
