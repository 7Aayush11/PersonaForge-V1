import numpy as np
from db import supabase
from embeddings import embed_one, embed_many
import json

def store_file_embeddings(session_id: str, files: dict, file_desc: dict):
    
    paths = list(files.keys())
    descriptions = [file_desc.get(p, "") for p in paths]
    
    vectors = embed_many(descriptions)
    print(vectors)
    rows = [{
        "session_id": session_id,
        "file_path": path,
        "content": files[path],
        "description": file_desc[path],
        "embedding": vector
    } for path, vector in zip(paths, vectors)]
    
    supabase.table("file_embeddings").upsert(rows, on_conflict="session_id, file_path").execute()
    
def find_best_match(session_id: str, instruction: str):
    query_vector = np.array(embed_one(instruction))
    print(query_vector)
    result = (supabase.table("file_embeddings").select("file_path, content, embedding").eq("session_id", session_id).execute())
    
    rows = result.data
    if not rows:
        
        return None

    best_row, best_score = None, -1
    for row in rows:
        embedding_list = json.loads(row['embedding'])
        embedding = np.array(embedding_list, dtype=float)
        score = float(np.dot(query_vector, embedding))
        if score > best_score:
            best_score, best_row = score, row
    return {"file_path": best_row["file_path"], "content": best_row["content"], "score": best_score}