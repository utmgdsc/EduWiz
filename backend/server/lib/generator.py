from starlette.types import HTTPExceptionHandler
from langchain_core.runnables import RunnableLambda
import asyncio
from langchain_openai import ChatOpenAI
from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
import os
from dotenv import load_dotenv

# Globals
load_dotenv()
key = os.getenv("OPENAI_API_KEY")
animator_script = ""


# Parsing functions
def animator_prompter(response):
    global animator_script
    animator_script = response.content
    return {"script": response.content}

def get_prompt(filepath):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    full_path = os.path.join(base_dir, filepath)
    with open(full_path, "r") as prompt:
        return prompt.read()

def split_scenes(response):
    content = response.content
    scenes = content.split("###NEWSCENE###")
    return scenes

async def animate_scenes(scenes):
    animator_human_message = HumanMessagePromptTemplate.from_template("{script}")
    animator_system_message = SystemMessagePromptTemplate.from_template(get_prompt("./animator_prompt_scene.txt"))
    animator_prompt = ChatPromptTemplate([animator_system_message, animator_human_message])
    animator = ChatOpenAI(model="o3-mini-2025-01-31", openai_api_key=key, reasoning_effort="low")

    chain = animator_prompt | animator
    tasks = [chain.ainvoke({"script": scene}) for scene in scenes]
    results = await asyncio.gather(*tasks)

    return [res.content for res in results]

# Prompting function
async def ask(prompt):
    # Models
    mathematician = ChatOpenAI(model="o3-mini-2025-01-31", openai_api_key=key, reasoning_effort="low")

    # Mathematician prompt
    mathematician_human_message = HumanMessagePromptTemplate.from_template("{prompt}")
    mathematician_system_message = SystemMessagePromptTemplate.from_template(get_prompt("./mathematician_prompt_scene.txt"))
    mathematician_prompt = ChatPromptTemplate([mathematician_system_message, mathematician_human_message])

    # Chaining
    chain = (
        mathematician_prompt
        | mathematician
        | RunnableLambda(split_scenes)
        | RunnableLambda(animate_scenes)
    )
    prompt = {"prompt": prompt}

    try:
        result = await chain.ainvoke(prompt)
        return result
    except Exception as e:
        raise e
