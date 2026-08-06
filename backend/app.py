from fastapi import FastAPI, UploadFile, File, HTTPException
from dotenv import load_dotenv
import uvicorn, os, shutil, tempfile
from pdf_extract import get_pdf_text
from image_extract import get_image_text
from parser import get_json
from generate import generate
from models import EditRequest
from update_code import updateHTML
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

origins = [
    os.getenv("HOST")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_headers="*",
    allow_methods="*"
)

@app.post("/edit")
async def edit(request: EditRequest):
    if not request.html.strip():
        raise HTTPException(
            status_code=400, detail="No HTML found, generate a portfolio first"
        )
    
    if not request.instruction.strip():
        raise HTTPException(
            status_code=400, detail="Please provide a valid instruction"
        )
    
    updated_html = updateHTML(request.html, request.instruction)
    
    if not updated_html.strip().startswith("<!DOCTYPE html>"):
                raise HTTPException(
                    status_code=500, detail="Portfolio Generation failed - Invalid html"
                )
                
    return {"html": updated_html}

@app.post("/generate")
async def upload(file: UploadFile = File(...)):
    allowed = ["application/pdf", "image/jpeg", "image/png"]
    
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=400, detail="Invalid File Type"
        )
    
    with tempfile.NamedTemporaryFile(
        delete=False, 
        suffix=os.path.splitext(file.filename)[1]
    ) as tmp:
        shutil.copyfileobj(file.file, tmp)
        temp_path = tmp.name
    
    try:
        if file.content_type=="application/pdf":
            text = get_pdf_text(temp_path)
        else:
            text = get_image_text(temp_path)
        
        
        json_text = get_json(text)
        if type(json_text)!=dict:
            raise HTTPException(
                status_code=500, detail="Could not parse text - Please try again later"
            )
        
        html = generate(json_text)
        
        if not html.strip().startswith("<!DOCTYPE html>"):
            raise HTTPException(
                status_code=500, detail="Portfolio Generation failed - Invalid html"
            )
        
    finally:
        os.remove(temp_path)
        
            
    return {"text": text, "json_text": json_text, "html": html}


if __name__ == "__main__":
    uvicorn.run(app, port=8000, host="0.0.0.0")