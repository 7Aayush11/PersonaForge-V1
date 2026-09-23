import csv
import os
import json

CSV_PATH = os.path.join(os.path.dirname(__file__), "file_embeddings_rows.csv")

MOCK_SESSION_ID = "J6NP-nnA-3U8iqiE2nQW9A"


def load_mock_data() -> tuple[dict, dict, list]:
    files = {}
    files_desc = {}
    rows = []

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            path = row["file_path"]
            files[path] = row["content"]
            files_desc[path] = row["description"]

            embedding = row["embedding"]
            if isinstance(embedding, str):
                try:
                    embedding = json.loads(embedding)
                except Exception:
                    embedding = []

            rows.append({
                "file_path": path,
                "content": row["content"],
                "description": row["description"],
                "embedding": embedding,
            })

    return files, files_desc, rows