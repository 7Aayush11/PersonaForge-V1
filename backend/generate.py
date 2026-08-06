from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

llm = ChatGroq(model="openai/gpt-oss-120b")
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a web developer, you have expertise in building exceptional personal portfolios and your role is to build a personal portfolio from organized json text. Provide user with a single html, inline css, and vanilla js code. Only text should be a HTML file and no other text. Make sure the response starts with <!DOCTYPE html>. No explanation, No markdowns, No code blocks. Only single HTML File. Follow the basic design with a navbar at top to redirect at different sections and all the contact details in footer, both should be sticky. Sections to divide in 5 first Introduction include name, summary if any in resume or make one, picture with random pictures in every necessary section i.e about, each project, each experience, each education, second Experience same format name with image and description, third education same as above, fourth skills which has every skill in a badge, fifth certifications. If some data is missing then avoid those sections. Ensure no section is has a different card, and a proper background using one kind of color theme. Ensure the nabar redirects to every single section and works properly. Also put comments near every placeholder to help change the content easily"),
    ("user", "{text}")
])

def generate(text: str):
    
    chain = prompt | llm
    
    try:
        response = chain.invoke({"text": text})
        
        return response.content
    except Exception as e:
            return (f"An error occurred {e}")