from openrouter import  OpenRouter
import os

client = OpenRouter(api_key=os.getenv("OPENROUTER_API_KEY"))

def generate(text: str):
    
    try:
        response = client.chat.send(
            model="poolside/laguna-s-2.1:free",
            messages=[
                {"role": "system", "content": "You are a web developer with expertise in building exceptional personal portfolios. Your task is to generate a multifile code using the tech stack React-vite with vitejs/plugin-react as ^4.2.0 version, Tailwind, and Framer Motion. The files should be package.json, vite.config.js, tailwind.config.js, postcss.config.js, index.html, src/main.jsx and a sensible component split (e.g. Header.jsx, Hero.jsx, Projects.jsx, Footer.jsx etc.) rather than one giant file. Use placeholder images from https://placehold.co for all image slots, with unique data-img-slot and data-img-label attributes. This is going to be a single page application to avoid using react-router. Avoid sections with missing data, ensure a consistent color theme, and include comments for easy content updates. Output each file using this exact format, with no other text before, after, or between files:\n\n@@FILE: path/to/filename\n<the full raw content of that file, exactly as it should appear, with no escaping>\n\n@@FILE: path/to/nextfile\n<content>\n\nRepeat for every file. Do not use JSON. Do not use markdown code fences. Do not add any explanation before the first @@FILE or after the last file's content. Every file must start with a line beginning exactly with '@@FILE: ' followed by its path. Ensure Vite version is 4.2 or less"},
                {"role": "user","content": text}
            ],
             
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
            return (f"An error occurred {e}")