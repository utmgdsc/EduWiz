from langchain_core.runnables import RunnableLambda
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
import os
from dotenv import load_dotenv


load_dotenv()
key = os.getenv("GOOGLE_API_KEY")

# Parsing functions

def unwrapCode(code):
    lines = code.content.splitlines()
    code = lines[1:]
    for i in code:
        if i == "```":
            code.remove(i)

    return "\n".join(code)

def animatorPrompter(response):
    return {"script": response.content}

def codeCleaner(response):
    return {"manim_code": unwrapCode(response)}

# Prompting function

def ask(prompt):
    # Models
    writer = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=key)
    animator = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=key)
    checker = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=key)

    # Writer prompt
    writer_human_message = HumanMessagePromptTemplate.from_template("{prompt}")
    writer_system_message = SystemMessagePromptTemplate.from_template("You will be provided a question, your job is to write a script for a video that will explain the answer to that question. The video will be coded via manim, so describe video elements as well. Describe each step clearly. Specify the animation order (e.g., first draw the triangle, then label the sides, then show the theorem). Avoid overlapping elements by specifying where each object should appear. Mention the type of animations (e.g., FadeIn, Write, Transform). Keep it concise and suitable for automatic conversion into Python code.")
    writer_prompt = ChatPromptTemplate([writer_system_message, writer_human_message])

    # Animator prompt
    animator_human_message = HumanMessagePromptTemplate.from_template("{script}")
    animator_system_message = SystemMessagePromptTemplate.from_template("You will be provided a script for a video. Write a manim script to animate this. Make sure that you STRICTLY use ascii characters in the code. Make sure that it renders properly and none of the elements of the video overlap. Make sure that the code runs and does not cause any errors. Use Write() for text, Create() for shapes, and Transform() for smooth transitions. Follow the script's order carefully to ensure proper animations. Use .next_to(), .move_to(), and .align_to() to position elements correctly. Avoid overlapping elements. The output should be a valid and runnable Python script using Manim.")
    animator_prompt = ChatPromptTemplate([animator_system_message, animator_human_message])
    
    # Checker prompt
    checker_human_message = HumanMessagePromptTemplate.from_template("{manim_code}")
    checker_system_message = SystemMessagePromptTemplate.from_template("You are a manim expert. Your job is to check the following code for any errors and return the verified code. Make sure you return nothing except the code.")
    checker_prompt = ChatPromptTemplate([checker_system_message, checker_human_message])
    
    # Chaining
    chain = writer_prompt | writer | RunnableLambda(animatorPrompter) | animator_prompt | animator | RunnableLambda(codeCleaner) | checker_prompt | checker | RunnableLambda(unwrapCode)
    result = chain.invoke(prompt)
    return result
