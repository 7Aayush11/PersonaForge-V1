from google.genai import types
from google import genai
import os, re, traceback
from db import supabase
from embeddings import embed_one

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

FILE_PATTERN = re.compile(r"@@FILE:\s*(.+?)\s*\n(.*?)\n@@DESC:\s*(.+?)(?=\n@@FILE:|\Z)", re.DOTALL)


def updateHTML(session_id: str, code: str, instruction: str) -> dict:
    system_instruction = (
        "You are an expert in web development. Update the given code according to the "
        "user's instruction, preserving essential attributes. Follw the stack React + Vite + Tailwind CSS + Framer Motion + Lucide React. Use JavaScript, not TypeScript. Use Vite <= 4.2.x, @vitejs/plugin-react 4.2.0, React 18, Tailwind CSS 3.x, and compatible Framer Motion/Lucide React versions. Do not use React Router, Next.js, Bootstrap, Material UI, shadcn/ui, Redux, Three.js, GSAP, or unnecessary dependencies. Every <img> tag must retain its "
        "data-img-slot and data-img-label attributes unless explicitly instructed otherwise. "
        "Only return files that actually changed - do not return unchanged files. "
        "Output each changed file using this exact format, with no other text: "
        "@@FILE: path/to/filename\\n<the full corrected raw content of that file>\\n"
        "@@DESC: <a one-line description of what this file does, not what changed>\\n\\n"
        "Repeat for every changed file. Do not use JSON. Do not use markdown code fences. "
        "Do not add explanation before, after, or between files.\\n\\n"
        f"CODE TO UPDATE:\\n{code}"
    )

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=instruction,
            config=types.GenerateContentConfig(system_instruction=system_instruction),
        )
    except Exception as e:
        print("UPDATE_HTML FAILED:")
        traceback.print_exc()
        raise

    updated_code = response.text.strip()
    matches = FILE_PATTERN.findall(updated_code)

    if not matches:
        raise ValueError("No files found in model output - check it's using the @@FILE: / @@DESC: format")

    files = {}
    for path, content, description in matches:
        path = path.strip()
        content = content.strip()
        description = description.strip()
        files[path] = content

        embedding = embed_one(description)

        existing = (
            supabase.table("file_embeddings")
            .select("id")
            .eq("session_id", session_id)
            .eq("file_path", path)
            .execute()
        )

        if existing.data:
            supabase.table("file_embeddings").update({
                "content": content,
                "description": description,
                "embedding": embedding,
            }).eq("session_id", session_id).eq("file_path", path).execute()
        else:
            supabase.table("file_embeddings").upsert({
                "session_id": session_id,
                "file_path": path,
                "content": content,
                "description": description,
                "embedding": embedding,
            }, on_conflict="session_id,file_path").execute()

    return files