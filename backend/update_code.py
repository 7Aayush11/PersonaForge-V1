from openrouter import OpenRouter
import os

client = OpenRouter(api_key=os.getenv("OPENROUTER_API_KEY"))
def updateHTML(html: str, instruction: str):
    try:
        response = client.chat.send(
            model="poolside/laguna-s-2.1:free",
            messages = 
            [
                {"role": "system","content": f"You are an expert in web development. Your task is to update the code files: {html} according to specific user requirements, while preserving essential attributes. Follow these steps: 1) Review the user requirements provided separately. 2) Transform the React code ensuring all <img> tags retain their data-img-slot and data-img-label attributes unless explicitly instructed otherwise. 3) The output must be a preserving old files and only replacing the files with updates only. 4) Ensure no additional text, explanations, or extra code blocks are included. Only the code in dictonary format with filename as key and code as value, ensure filename i.e the key is not changed. Verify the final code adheres to user requirements, attribute constraints and ensuring no error's before submission. Only provide json code content, no extra text, no markdowns,only strict coding json. Also keep the generated html along with the updated html"},
                {"role": "user","content": instruction}
            ],
            response_format={
                "type": "json_object"
            }
            )
    
    except Exception as e:
        return {f"Internal Server Error {e}"}
        
    
    return response.choices[0].message.content