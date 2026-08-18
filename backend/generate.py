from openrouter import  OpenRouter
import os

client = OpenRouter(api_key=os.getenv("OPENROUTER_API_KEY"))

def generate(text: str):
    
    try:
        response = client.chat.send(
            model="poolside/laguna-s-2.1:free",
            messages=[
                {"role": "system", "content": "You are a web developer with expertise in building exceptional personal portfolios. Your task is to generate a multifile code using the tech stack React, Tailwind, Vite, and Framer Motion. The files should be package.json, vite.config.js, tailwind.config.js, postcss.config.js, index.html, src/main.jsx and a sensible component split (e.g. Header.jsx, Hero.jsx, Projects.jsx, Footer.jsx etc.) rather than one giant file. Code to be generated in structured json format with file name as key and code as the value. Each file should have proper name's i.e if it lies in root directory than package.json, or src/main.jsx i.e childdirectory/filename. User provides with the text which is to be used as data to build the final code, ensure code doesnt have any error, a proper design and looks good. No markdowns, No text, No errors. Strict JSON content and proper name convention."},
                {"role": "user","content": text}
            ],
            response_format={
                "type": "json_object"
            }
        )
    
        return response.choices[0].message.content
    
    except Exception as e:
            return (f"An error occurred {e}")