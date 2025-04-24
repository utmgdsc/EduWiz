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

async def run_fixer_chain(scene, checker_prompt, checker):
        error, code = scene[0], scene[1]
        if error is not None:
            checkchain = checker_prompt | checker
            result = await checkchain.ainvoke({"error": error, "code": code})
            return result.content
        return code

# retry function
async def retry(scenes):
    # Models
    fixer = ChatOpenAI(model="o3-mini-2025-01-31", openai_api_key=key, reasoning_effort="medium")

    # fixer prompt
    fixer_human_message = HumanMessagePromptTemplate.from_template("The code is: {code} ###END CODE### This code raises the error: {error}")
    fixer_system_message = SystemMessagePromptTemplate.from_template("Fix the code provided to you according to the error message provided. Check the code thoroughly for any repeats of this error. Return nothing but the code")
    fixer_prompt = ChatPromptTemplate([fixer_system_message, fixer_human_message])

    fix_tasks = [run_fixer_chain(scene, fixer_prompt, fixer) for scene in scenes]

    try:
        fixed_scenes = await asyncio.gather(*fix_tasks)
        return [res for res in fixed_scenes]
    except Exception as e:
        raise e
