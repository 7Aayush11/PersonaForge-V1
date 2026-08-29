from google import genai
from google.genai.types import Content, Part
import os

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def embed_one(text: str) -> list[float]:
    
    try:
        response = client.models.embed_content(
            model="gemini-embedding-2",
            contents=text
        )
        
        return response.embeddings[0].values
    
    except Exception as e:
        return f"Internal Server Error: {e}"

def embed_many(texts: str) -> list[list[float]]:
    
    try:
        contents = [Content(parts=[Part(text=t)]) for t in texts]
        response = client.models.embed_content(
            model="gemini-embedding-2",
            contents=contents
        )
        
        if len(response.embeddings)!=len(texts):
            raise ValueError(
                 f"Expected {len(texts)} embeddings, got {len(response.embeddings)} - batch embedding call did not return one vector per input"
            )
            
        return [e.values for e in response.embeddings]
    
    except Exception as e:
        return f"Internal Server Error: {e}"