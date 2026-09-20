from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, Header
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn, os, shutil, tempfile, secrets, traceback
from models import EditRequest, DeployRequest, HealRequest, CreatePortfolioRequest, UpdateDeployStatusRequest
from pdf_extract import get_pdf_text
from image_extract import get_image_text
from generate import generate
from update_code import update_files
from deploy import is_slug_taken, save_site, clean_slug_input, validate_slug, get_site, delete_site
from parse_files import parse_generated_files
from parser import get_json
from self_heal import heal_files
from vector_store import store_file_embeddings, find_top_matches, get_all_file_path, get_session_files
from auth import get_current_user
from portfolio_store import create_portfolio, get_portfolios_for_user, set_deploy_status, delete_portfolio
from db import supabase


load_dotenv()

app = FastAPI()

origins = [
    os.getenv("CORS")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"]
)

@app.post("/generate")
async def upload(file: UploadFile = File(...), authorization: str = Header(None)):
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
        
        text_json = get_json(text)
                
        try:
            code = generate(text_json)
            files, files_desc = parse_generated_files(code)
            session_id = secrets.token_urlsafe(16)
            store_file_embeddings(session_id, files, files_desc)

            if authorization and authorization.startswith("Bearer "):
                try:
                    user = get_current_user(authorization)
                    create_portfolio(user["user_id"], session_id)
                except Exception as e:
                    print(f"Portfolio record creation skipped (anonymous or auth error): {e}")

        except HTTPException:
            raise  # re-raise FastAPI HTTP exceptions unchanged
        except Exception as e:
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
            
    finally:
        os.remove(temp_path)
    return {"text": text, "code": code, "session_id": session_id, "files": files, "description": files_desc}

@app.post("/edit")
async def edit(request: EditRequest):
    
    if not request.instruction.strip():
        raise HTTPException(
            status_code=400, detail="Please provide a valid instruction"
        )
    
    matches = find_top_matches(request.session_id, request.instruction, top_k=3)
    if not matches:
        raise HTTPException(status_code=400, detail="No files found for this session - generate a portfolio first")

    all_paths = get_all_file_path(request.session_id)
    try:
        updated_files = update_files(request.session_id, matches, all_paths, request.instruction)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Edit failed: {e}")

    return {"updated_files": updated_files}

@app.post("/self-heal")
async def self_heal(request: HealRequest):
    if not request.files:
        return HTTPException(status_code=400, detail="No files were provided")
    
    raw = heal_files(request.files, request.error, request.implicated_files)
    
    try:
        fixed_files = parse_generated_files(raw)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Self heal failed {e}")
    
    return {"files": fixed_files}

@app.get("/portfolio/{session_id}")
async def get_portfolio(session_id: str):
    files = get_session_files(session_id)
    if not files:
        raise HTTPException(status_code=404, detail="No portfolio found for this session")
    return {"session_id": session_id, "files": files}

@app.post("/deploy")
async def deploy_site(request: DeployRequest, user=Depends(get_current_user)):
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
    
    save_site(slug, request.html, request.session_id, user_id=user["user_id"])
    
    supabase.table("deployed_sites").update({"session_id": request.session_id}).eq("slug", slug).execute()
    portfolio = supabase.table("portfolios").select("portfolio_id").eq("session_id", request.session_id).eq("user_id", user["user_id"]).execute()
    if portfolio.data:
        set_deploy_status(portfolio.data[0]["portfolio_id"], user["user_id"], True, slug)

    backend_url = os.getenv("BACKEND_URL")
    
    return {"slug": slug, "url": f"{backend_url}/p/{slug}"}


@app.get("/my-portfolios")
async def my_portfolios(user=Depends(get_current_user)):
    return {"portfolios": get_site(user["user_id"])}

@app.delete("/p/{slug}")
async def remove_site(slug: str, token: str):
    result = delete_site(slug.lower(), token)
    
    if result == "Not Found":
        raise HTTPException(status_code=404, detail= "Page not found")
    if result == "Invalid token":
        raise HTTPException(status_code=403, detail= "Invalid token, please use correct token")
    
    return {"message": "Portfolio deleted successfully"}

@app.post("/portfolios")
async def create_portfolio_route(request: CreatePortfolioRequest, user=Depends(get_current_user)):
    portfolio = create_portfolio(user["user_id"], request.session_id)
    if not portfolio:
        raise HTTPException(status_code=500, detail="Could not create portfolio record")
    return {"portfolio": portfolio}


@app.get("/portfolios")
async def list_portfolios(user=Depends(get_current_user)):
    portfolios = get_portfolios_for_user(user["user_id"])
    return {"portfolios": portfolios}


@app.patch("/portfolios/deploy-status")
async def update_deploy_status(request: UpdateDeployStatusRequest, user=Depends(get_current_user)):
    updated = set_deploy_status(request.portfolio_id, user["user_id"], request.deploy_status, request.slug)
    if not updated:
        raise HTTPException(status_code=404, detail="Portfolio not found or not yours")
    return {"portfolio": updated}


@app.delete("/portfolios/{portfolio_id}")
async def delete_portfolio_route(portfolio_id: str, user=Depends(get_current_user)):
    session_id = delete_portfolio(portfolio_id, user["user_id"])
    if session_id is None:
        raise HTTPException(status_code=404, detail="Portfolio not found or not yours")
    return {"message": "Portfolio and all associated data deleted"}

if __name__ == "__main__":
    uvicorn.run(app, port=8000, host="0.0.0.0")