from re import S
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
import logging
from dotenv import load_dotenv

# Globals
debug = 0 # Enables debug logging
load_dotenv()
key = os.getenv("OPENAI_API_KEY")
animator_script = []
index = 0


if debug:
    logger = logging.getLogger(__name__)

# Parsing functions
def get_prompt(filepath):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    full_path = os.path.join(base_dir, filepath)
    with open(full_path, "r") as prompt:
        return prompt.read()

def split_scenes(response):
    content = response.content
    anim_type = content[:4]
    content = content[4:].lstrip()
    if content.startswith("###NEWSCENE###"):
        content = content[14:]
    if debug:
        logger.info("Content:")
        logger.info(content)
    scenes = content.split("###NEWSCENE###")
    return (scenes, anim_type)


### Prompting functions
async def run_animator_chain(scene, animator_prompt, animator):
        chain = animator_prompt | animator
        result = await chain.ainvoke({"script": scene})
        return result.content + "\n\n ####END CODE#### The script associated with this is: " + scene

async def run_checker_chain(code, checker_prompt, checker):
        checkchain = checker_prompt | checker
        result = await checkchain.ainvoke({"manim_code": code})
        return result.content


### Animating functions
async def animate_scenes(scenes):
    animator_human_message = HumanMessagePromptTemplate.from_template("{script}")
    animator_system_message = SystemMessagePromptTemplate.from_template(get_prompt("./animator_prompt_scene.txt"))
    animator_prompt = ChatPromptTemplate([animator_system_message, animator_human_message])
    animator = ChatOpenAI(model="o3-mini-2025-01-31", openai_api_key=key)

    checker_human_message = HumanMessagePromptTemplate.from_template("{manim_code}")
    checker_system_message = SystemMessagePromptTemplate.from_template("You are a manim expert. Your job is to make sure that the manim code provided to you is clear, visible and valid. Make sure that none of the code overlaps, and that all of it fits within the bounds of the screen. None of the elements should linger on the screen longer than necessary, and must be faded properly. Make sure you return nothing except the code. The script will be given to you, make sure you omit it in your response.")
    checker_prompt = ChatPromptTemplate([checker_system_message, checker_human_message])
    checker = ChatOpenAI(model="o3-mini-2025-01-31", openai_api_key=key)

    animator_tasks = [run_animator_chain(scene, animator_prompt, animator) for scene in scenes]
    animator_results = await asyncio.gather(*animator_tasks)
    
    if debug:
        for i in animator_results:
            logger.info("Animator_results:")
            logger.info(i)

    checker_tasks = [run_checker_chain(code, checker_prompt, checker) for code in animator_results]
    checker_results = await asyncio.gather(*checker_tasks)
    
    if debug:
        for i in checker_results:
            logger.info("Checker_results:")
            logger.info(i)

    return [res for res in checker_results]

async def animate_text_scenes(scenes):
    animator_human_message = HumanMessagePromptTemplate.from_template("{script}")
    animator_system_message = SystemMessagePromptTemplate.from_template(get_prompt("./text_animator_prompt_scene.txt"))
    animator_prompt = ChatPromptTemplate([animator_system_message, animator_human_message])
    animator = ChatOpenAI(model="gpt-4.1-2025-04-14", openai_api_key=key)

    checker_human_message = HumanMessagePromptTemplate.from_template("{manim_code}")
    checker_system_message = SystemMessagePromptTemplate.from_template(get_prompt("./text_checker_prompt_scene.txt"))
    checker_prompt = ChatPromptTemplate([checker_system_message, checker_human_message])
    checker = ChatOpenAI(model="gpt-4.1-2025-04-14", openai_api_key=key)

    animator_tasks = [run_animator_chain(scene, animator_prompt, animator) for scene in scenes]
    animator_results = await asyncio.gather(*animator_tasks)
    
    if debug:
       for i in animator_results:
            logger.info("Animator_results:")
            logger.info(i)

    checker_tasks = [run_checker_chain(code, checker_prompt, checker) for code in animator_results]
    checker_results = await asyncio.gather(*checker_tasks)

    if debug:
        for i in checker_results:
            logger.info("Checker_results:")
            logger.info(i)
    
    return [res for res in checker_results]

async def generate_scenes(args):
    scenes, anim_type = args
    if anim_type == "anim":
        return await animate_scenes(scenes)
    else:
        return await animate_text_scenes(scenes)

# Prompting function
async def ask(prompt):
    # Models
    mathematician = ChatOpenAI(model="gpt-4.1-2025-04-14", openai_api_key=key)

    # Mathematician prompt
    mathematician_human_message = HumanMessagePromptTemplate.from_template("{prompt}")
    mathematician_system_message = SystemMessagePromptTemplate.from_template(get_prompt("./mathematician_prompt_scene.txt"))
    mathematician_prompt = ChatPromptTemplate([mathematician_system_message, mathematician_human_message])

    # Chaining
    chain = (
        mathematician_prompt
        | mathematician
        | RunnableLambda(split_scenes)
        | RunnableLambda(generate_scenes)
    )
    prompt = {"prompt": prompt}

    try:
        result = await chain.ainvoke(prompt)
        return result
    except Exception as e:
        raise e
