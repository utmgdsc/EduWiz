from langchain_core.runnables import RunnableLambda
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
import os
from dotenv import load_dotenv


load_dotenv()
key = os.getenv("OPENAI_API_KEY")

animator_script = ""
# Parsing functions
#
def unwrapCode(code):
    return code.content

def animator_prompter(response):
    global animator_script
    animator_script = response.content
    return {"script": response.content}

def codeCleaner(response):
    final_response = response.content + "\n==================SCRIPT STARTS HERE==================\n" + animator_script
    return {"manim_code": final_response}

def get_prompt(filepath):
    with open(filepath, "r") as prompt:
        return prompt.read()

# Prompting function
def ask(prompt):
    # Models
    mathematician = ChatOpenAI(model="o3-mini-2025-01-31", openai_api_key=key)
    animator = ChatOpenAI(model="o3-mini-2025-01-31", openai_api_key=key)
    checker = ChatOpenAI(model="o3-mini-2025-01-31", openai_api_key=key)

    # Mathematician prompt
    mathematician_human_message = HumanMessagePromptTemplate.from_template("{prompt}")
    mathematician_system_message = SystemMessagePromptTemplate.from_template(get_prompt("mathematician_prompt.txt"))
    mathematician_prompt = ChatPromptTemplate([mathematician_system_message, mathematician_human_message])

    # Animator prompt
    animator_human_message = HumanMessagePromptTemplate.from_template("{script}")
    animator_system_message = SystemMessagePromptTemplate.from_template(get_prompt("animator_prompt.txt"))
    animator_prompt = ChatPromptTemplate([animator_system_message, animator_human_message])
    
    # Checker prompt
    checker_human_message = HumanMessagePromptTemplate.from_template("{manim_code}")
    checker_system_message = SystemMessagePromptTemplate.from_template("You are a manim expert. Your job is to make sure that the manim code provided to you is clear, visible and valid. Make sure that none of the code overlaps, and that all of it fits within the bounds of the screen. Ensure all the Tex is valid, and all math mode elements are in MathTex OR enclosed in $. None of the elements should linger on the screen longer than necessary, and must be faded properly. The script will be given to you, make sure you omit it in your response. Make sure you return nothing except the code.")
    checker_prompt = ChatPromptTemplate([checker_system_message, checker_human_message])
    
    # Chaining
    chain = mathematician_prompt | mathematician | RunnableLambda(animator_prompter) | animator_prompt | animator | RunnableLambda(codeCleaner) | checker_prompt | checker | RunnableLambda(unwrapCode)
    result = chain.invoke(prompt)
    return result

if __name__ == "__main__":
    print(ask("does pushing or pulling a box use less force"))
