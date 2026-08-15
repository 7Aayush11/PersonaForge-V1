from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

llm = ChatGroq(model="openai/gpt-oss-120b")
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert in web development. Your task is to update the given HTML code: {html} according to specific user requirements, while preserving essential attributes. Follow these steps: 1) Review the user requirements provided separately. 2) Transform the HTML code ensuring all <img> tags retain their data-img-slot and data-img-label attributes unless explicitly instructed otherwise. 3) The output must be a single HTML document, starting with <!DOCTYPE html> and including CSS and vanilla JS as needed. 4) Ensure no additional text, explanations, or extra code blocks are included. Here is an example of a transformation: [Input Example] -> [Expected Output Example]. Verify the final code adheres to user requirements and attribute constraints before submission."),
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