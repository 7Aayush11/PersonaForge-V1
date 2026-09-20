import numpy as np
from db import supabase
from embeddings import embed_one, embed_many
import json

def store_file_embeddings(session_id: str, files: dict, file_desc: dict):
    
    paths = list(files.keys())
    descriptions = [file_desc.get(p, "") for p in paths]
    
    vectors = embed_many(descriptions)
    rows = [{
        "session_id": session_id,
        "file_path": path,
        "content": files[path],
        "description": file_desc.get(path, ""),
        "embedding": vector
    } for path, vector in zip(paths, vectors)]
    
    supabase.table("file_embeddings").upsert(rows, on_conflict="session_id,file_path").execute()
    
def find_top_matches(session_id: str, instruction: str, top_k: int=3):
    query_vector = np.array(embed_one(instruction))
    result = (supabase.table("file_embeddings").select("file_path, content, embedding").eq("session_id", session_id).execute())
    
    rows = result.data
    if not rows:
        return []
    
    scored = []
    for row in rows:
        embedding_list = json.loads(row['embedding'])
        embedding = np.array(embedding_list, dtype=float)
        score = float(np.dot(query_vector, embedding))
        scored.append({"file_path": row["file_path"], "content": row["content"], "score": score})
    
    scored.sort(key=lambda r:r["score"], reverse=True)
    return scored[:top_k]

def get_all_file_path(session_id: str) -> list[str]:
    result = (
        supabase.table("file_embeddings")
        .select("file_path, content")
        .eq("session_id", session_id)
        .execute()
    )
    return [row["file_path"] for row in result.data]

def get_session_files(session_id: str) -> dict:
    result = (
            supabase.table("file_embeddings")
            .select("file_path, content")
            .eq("session_id", session_id)
            .execute()
        )
    return {row["file_path"]: row["content"] for row in result.data}