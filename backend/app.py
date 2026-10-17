from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, Request, Response
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
from vector_store import store_file_embeddings, find_top_matches, get_all_file_path, get_session_files, get_assembled_html, store_assembled_html
from auth import get_current_user, get_optional_user, verify_token
from portfolio_store import create_portfolio, get_portfolios_for_user, set_deploy_status, delete_portfolio
from db import supabase
from assemble import assemble_html
from image_inject import find_file_containing_slot, inject_image_into_file, validate_image_data_url
from user_plan import (get_user_plan, consume_generation, consume_edit, release_generation, release_edit, record_guest_generation, get_entitlements, get_profile, guest_generation_used)
from guest_identity import get_guest_id, hash_guest_id, hash_client_ip
from billing import router as billing_router


load_dotenv()

app = FastAPI()
app.include_router(billing_router)

raw = os.getenv("CORS")
origins = [o.strip() for o in raw.split(",") if o.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
    expose_headers=["*"]
)

MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"

@app.get("/entitlements")
async def entitlements(request: Request, response: Response, user=Depends(get_optional_user)):
    if user:
        data = get_entitlements(user_id=user["user_id"])
        data["subscription"] = get_profile(user["user_id"])
        return data
    guest_id = get_guest_id(request, response)
    data = get_entitlements(guest=True)
    data["can_generate"] = not guest_generation_used(hash_guest_id(guest_id))
    return data


@app.post("/generate")
async def upload(request: Request, response: Response, file: UploadFile = File(...), user=Depends(get_optional_user)):
    allowed = ["application/pdf", "image/jpeg", "image/png"]

    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Invalid File Type")

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=os.path.splitext(file.filename)[1]
    ) as tmp:
        shutil.copyfileobj(file.file, tmp)
        temp_path = tmp.name

    try:
        
        session_id = secrets.token_urlsafe(16)
        user_generation_reserved = False
        guest_id = None
        if not user:
            guest_id = get_guest_id(request, response)
        plan = get_user_plan(user["user_id"]) if user else "free"
        if MOCK_MODE:
            if user:
                try:
                    consume_generation(user["user_id"], session_id)
                    user_generation_reserved = True
                except Exception:
                    # The RPC may have committed even if its response failed.
                    release_generation(user["user_id"], session_id)
                    raise
            else:
                record_guest_generation(hash_guest_id(guest_id), hash_client_ip(request), session_id)
            from mock_data import load_mock_data, MOCK_SESSION_ID
            from db import supabase

            print("MOCK MODE: loading data from CSV, skipping generation and embedding API")
            files, files_desc, embedding_rows = load_mock_data()
            text = "mock-resume-text"
            code = "mock-raw-output"

            # Insert pre-computed embeddings directly — no API call needed
            rows_to_insert = [
                {
                    "session_id": session_id,
                    "file_path": r["file_path"],
                    "content": r["content"],
                    "description": r["description"],
                    "embedding": r["embedding"],
                }
                for r in embedding_rows
            ]

            try:
                supabase.table("file_embeddings").insert(rows_to_insert).execute()
                print(f"Mock embeddings inserted for session {session_id}")
            except Exception as e:
                print(f"Mock embedding insert failed: {e}")
                traceback.print_exc()
                raise HTTPException(status_code=500, detail=f"Mock setup failed: {e}")

        else:
            if file.content_type == "application/pdf":
                text = get_pdf_text(temp_path)
            else:
                text = get_image_text(temp_path)

            text_json = get_json(text)

            try:
                if user:
                    try:
                        consume_generation(user["user_id"], session_id)
                        user_generation_reserved = True
                    except Exception:
                        # The RPC may have committed even if its response failed.
                        release_generation(user["user_id"], session_id)
                        raise
                else:
                    record_guest_generation(hash_guest_id(guest_id), hash_client_ip(request), session_id)
                code = generate(text_json, plan=plan)
                files, files_desc = parse_generated_files(code)
            except HTTPException:
                raise
            except Exception as e:
                traceback.print_exc()
                raise HTTPException(status_code=500, detail=f"Generation failed: {e}")

        try:
            store_file_embeddings(session_id, files, files_desc)
        except Exception as e:
            print(f"Embedding storage failed: {e}")
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Failed to store embeddings: {e}")

        authorization = request.headers.get("authorization") or request.headers.get("Authorization")
        
        try:
            assembled_html = assemble_html(files)
            store_assembled_html(session_id, assembled_html)
            print(f"Assembled HTML stored for session {session_id}")
        except Exception as e:
            print(f"HTML assembly/storage failed (non-fatal): {e}")
            traceback.print_exc()
        

        if user:
            try:
                portfolio = create_portfolio(user["user_id"], session_id)
                print(f"Portfolio created: {portfolio}")
            except Exception as e:
                print(f"Portfolio record creation failed: {e}")
                traceback.print_exc()

    except Exception:
        # Refund signed-in usage reserved by this request if generation fails.
        # Guest accounting remains unchanged.
        if user and user_generation_reserved:
            refunded = release_generation(user["user_id"], session_id)
            if not refunded:
                print(
                    "WARNING: generation failed but usage refund could not be confirmed "
                    f"(user_id={user['user_id']}, session_id={session_id})"
                )
        raise
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            traceback.print_exc()

    return {
        "text": text,
        "session_id": session_id,
        "files": files,
        "assembled_html": assembled_html,
        "description": files_desc
    }

@app.post("/edit")
async def edit(request: EditRequest, user=Depends(get_current_user)):
    if not request.instruction.strip():
        raise HTTPException(status_code=400, detail="Please provide a valid instruction")

    plan = get_user_plan(user["user_id"])
    matches = find_top_matches(request.session_id, request.instruction, top_k=3)
    if not matches:
        raise HTTPException(status_code=400, detail="No files found for this session")

    # Reserve an edit only after input/session validation.
    # If the RPC commits but its response fails, release the event as well.
    try:
        consume_edit(user["user_id"], request.session_id)
    except Exception:
        release_edit(user["user_id"], request.session_id)
        raise

    try:
        all_paths = get_all_file_path(request.session_id)
        updated_files = update_files(
            request.session_id,
            matches,
            all_paths,
            request.instruction,
            plan=plan,
        )

        # Persisting assembled HTML is part of the edit's success path.
        assembled_html = assemble_html(updated_files)
        store_assembled_html(request.session_id, assembled_html)

        return {"updated_files": updated_files}

    except Exception as e:
        # A failed edit must not consume the user's weekly allowance.
        refunded = release_edit(user["user_id"], request.session_id)
        if not refunded:
            print(
                "WARNING: edit failed but usage refund could not be confirmed "
                f"(user_id={user['user_id']}, session_id={request.session_id})"
            )

        if isinstance(e, HTTPException):
            raise
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Edit failed: {e}") from e

@app.post("/upload-image")
async def upload_image(request: Request):
    body = await request.json()

    session_id = body.get("session_id")
    slot_id = body.get("slot_id")
    data_url = body.get("data_url")

    if not session_id or not slot_id or not data_url:
        raise HTTPException(status_code=400, detail="session_id, slot_id, and data_url are required")

    if not validate_image_data_url(data_url):
        raise HTTPException(status_code=400, detail="Invalid image data URL")

    # Load all files for this session
    files = get_session_files(session_id)
    if not files:
        raise HTTPException(status_code=404, detail="No portfolio found for this session")

    # Find which file contains this slot
    target_path = find_file_containing_slot(files, slot_id)
    if not target_path:
        raise HTTPException(status_code=404, detail=f"No image slot '{slot_id}' found in this portfolio")

    # Inject the data URL into that file's source
    updated_content = inject_image_into_file(files[target_path], slot_id, data_url)

    if updated_content == files[target_path]:
        # Injection didn't change anything — slot found but src replacement failed
        raise HTTPException(status_code=500, detail=f"Found slot '{slot_id}' but could not replace its src attribute")

    # Save updated file back to file_embeddings
    try:
        supabase.table("file_embeddings").update({
            "content": updated_content
        }).eq("session_id", session_id).eq("file_path", target_path).execute()
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to save updated file: {e}")

    # Re-assemble HTML with the new image embedded
    updated_files = {**files, target_path: updated_content}
    try:
        assembled = assemble_html(updated_files)
        store_assembled_html(session_id, assembled)
    except Exception as e:
        print(f"Re-assembly after image upload failed (non-fatal): {e}")
        traceback.print_exc()

    return {
        "slot_id": slot_id,
        "file_path": target_path,
        "updated_files": updated_files,
        "assembled_html": assembled
    }

@app.post("/self-heal")
async def self_heal(request: HealRequest, user=Depends(get_current_user)):
    if not request.files:
        return HTTPException(status_code=400, detail="No files were provided")
    
    plan = get_user_plan(user["user_id"])
    consume_edit(user["user_id"], "self-heal")
    raw = heal_files(request.files, request.error, request.implicated_files, plan=plan)
    
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
    assembled_html = get_assembled_html(session_id)
    return {"session_id": session_id, "files": files, "assembled_html": assembled_html}

@app.post("/deploy")
async def deploy_site(request: DeployRequest, user=Depends(get_current_user)):
    slug = clean_slug_input(request.slug)

    error = validate_slug(slug)
    if error:
        raise HTTPException(status_code=400, detail=error)

    if is_slug_taken(slug):
        raise HTTPException(status_code=409, detail="This name is already taken. Choose another.")

    # Pull the pre-assembled HTML from the database instead of from the frontend
    html = get_assembled_html(request.session_id)
    if not html:
        raise HTTPException(status_code=400, detail="No assembled HTML found for this session. Generate a portfolio first.")

    save_site(slug, html, request.session_id, user_id=user["user_id"])

    portfolio = supabase.table("portfolios").select("portfolio_id").eq("session_id", request.session_id).eq("user_id", user["user_id"]).execute()
    if portfolio.data:
        set_deploy_status(portfolio.data[0]["portfolio_id"], user["user_id"], True, slug)

    backend_url = os.getenv("BACKEND_URL")
    return {"slug": slug, "url": f"{backend_url}/p/{slug}"}


@app.get("/my-portfolios")
async def my_portfolios(user=Depends(get_current_user)):
    return {"portfolios": get_portfolios_for_user(user["user_id"])}

@app.get("/p/{slug}", response_class=HTMLResponse)
async def serve_site(slug: str):
    result = supabase.table("deployed_sites").select("html_content").eq("slug", slug.lower()).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Page not found")
    return HTMLResponse(content=result.data[0]["html_content"])

@app.delete("/p/{slug}")
async def remove_site(slug: str, user=Depends(get_current_user)):
    result = delete_site(slug.lower(), user["user_id"])
    if result == "not_found":
        raise HTTPException(status_code=404, detail="Page not found")
    if result == "forbidden":
        raise HTTPException(status_code=403, detail="You don't own this portfolio")
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