import google.generativeai as genai
from PIL import Image
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def get_image_text(file_path: str):
    model = genai.GenerativeModel("gemini-2.5-flash")
    image = Image.open(file_path)
    response = model.generate_content([
        "Extract all the raw text from the given resume image, Return only raw text, No formatting", image
    ])
    
    return response.text.strip()