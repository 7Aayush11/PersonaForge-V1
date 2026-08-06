from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

llm = ChatGroq(model="openai/gpt-oss-120b")
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert in web development. You are supposed to update the provided code: {html} and modify it to provide updated code as per the user requirements. Make sure to only provide me with the HTML code and no other extra texts. Make sure the code is html and starts with <!DOCTYPE html>. Ensure No extra text, no explanation, no extra code blocks. Only one file with html, css, and vanilla js and updated html code from the given html code"),
    ("user", "{instruction}")
])

def updateHTML(html: str, instruction: str):
    
    try:
        chain = prompt | llm    
        updated_html = chain.invoke({
            "html": html,
            "instruction": instruction
        })
    
    except Exception as e:
        return {f"Internal Server Error {e}"}
        
    
    return updated_html.content