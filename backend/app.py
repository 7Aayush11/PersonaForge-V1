from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn, os, shutil, tempfile, secrets
from models import EditRequest, DeployRequest
from pdf_extract import get_pdf_text
from image_extract import get_image_text
from parser import get_json
from generate import generate
from update_code import updateHTML
from deploy import is_slug_taken, save_site, clean_slug_input, validate_slug, get_site, delete_site


load_dotenv()

app = FastAPI()

origins = [
    os.getenv("CORS")
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

@app.post("/deploy")
async def deploy_site(request: DeployRequest):
    if not request.html.strip():
        raise HTTPException(
            status_code=400, detail="No HTML found, generate a portfolio first"
        )

    slug = clean_slug_input(request.slug)

    error = validate_slug(slug)
    if error:
        raise HTTPException(status_code=400, detail=error)

    if is_slug_taken(slug):
        raise HTTPException(status_code=409, detail="This name is already taken. Choose another.")
    
    
    delete_token = secrets.token_urlsafe(16)
    save_site(slug, request.html, delete_token)

    backend_url = os.getenv("BACKEND_URL")
    return {"slug": slug, "url": f"{backend_url}/p/{slug}", "delete_token": delete_token}


@app.get("/p/{slug}", response_class=HTMLResponse)
async def serve_site(slug: str):
    html = get_site(slug.lower())
    if html is None:
        raise HTTPException(status_code=404, detail="Page not found")
    return HTMLResponse(content=html)

@app.delete("/p/{slug}")
async def remove_site(slug: str, token: str):
    result = delete_site(slug.lower(), token)
    
    if result == "Not Found":
        raise HTTPException(status_code=404, detail= "Page not found")
    if result == "Invalid token":
        raise HTTPException(status_code=403, detail= "Invalid token, please use correct token")
    
    return {"message": "Portfolio deleted successfully"}
if __name__ == "__main__":
    uvicorn.run(app, port=8000, host="0.0.0.0")