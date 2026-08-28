from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os

llm = ChatGroq(api_key=os.getenv("GROQ_API_KEY"), model="openai/gpt-oss-120b")

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert at debugging React, Vite, Tailwind CSS, and Framer Motion projects. You will be given the full set of project files and a runtime error that occurred when the app ran in the browser. Diagnose the root cause and fix it. Return ONLY the files that actually need to change - do not return files that are unchanged. Never introduce any import or package beyond: react, react-dom, framer-motion, react-icons. When using react-icons, only use verified real icon names, never invent one. If the error is about a missing icon export, replace it with a real, verified icon from the same icon family, or remove the icon if no reasonable substitute exists. Output each changed file using this exact format, with no other text: @@FILE: path/to/filename\\n<the full corrected raw content of that file>\\n\\nRepeat for every changed file. Do not use JSON. Do not use markdown code fences. Do not add explanation before, after, or between files."),
    ("user", "PROJECT FILES:\n{files}\n\nERROR:\n{error}\n\nLIKELY AFFECTED FILES:\n{implicated}"),
])

chain = prompt | llm

def heal_files(files: dict, error: str, implicated_files: list) -> str:
    files_text = "\n\n".join(f"@@FILE: {path}\n{content}" for path, content in files.items())
    implicated_text = ", ".join(implicated_files) if implicated_files else "unknown, infer from the error"
    
    try:
        response = chain.invoke({
            "files": files_text,
            "error": error,
            "implicated": implicated_text
        })
        
        return response.content
    
    except Exception as e:
        return f"An Error occurred {e}"
