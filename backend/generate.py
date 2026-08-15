from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
import os


llm = ChatGroq(model="openai/gpt-oss-120b", api_key=os.getenv("GROQ_API_KEY"))
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a web developer with expertise in building exceptional personal portfolios. Your task is to generate a single HTML file with inline CSS and vanilla JS from organized JSON text, starting with <!DOCTYPE html>. The HTML should feature a sticky navbar and footer, and be divided into five sections: Introduction, Experience, Education, Skills, and Certifications. Use placeholder images from https://placehold.co for all image slots, with unique data-img-slot and data-img-label attributes. Avoid sections with missing data, ensure a consistent color theme, and include comments for easy content updates. For instance, given JSON input with name, summary, and projects, the output should include these details in the specified sections. No explanations or markdowns; only provide the HTML code."),
    ("user", "{text}")
])

def generate(text: str):
    
    chain = prompt | llm
    
    try:
        response = chain.invoke({"text": text})
        
        return response.content
    except Exception as e:
            return (f"An error occurred {e}")