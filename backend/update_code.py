from google.genai import types
from google import genai
import os, re, traceback
from db import supabase
from embeddings import embed_one
from vector_store import get_session_files

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

FILE_PATTERN = re.compile(r"@@FILE:\s*(.+?)\s*\n(.*?)\n@@DESC:\s*(.+?)(?=\n@@FILE:|\Z)", re.DOTALL)


def update_files(session_id: str, matches: list, all_paths: list, instruction: str) -> dict:
    matched_files_text = "\n\n".join(f"@@FILE: {m['file_path']}\n{m['content']}" for m in matches)
    manifest_text = "\n".join(f"- {p}" for p in all_paths)
    
    system_instruction = ("""
        You are an expert frontend developer and UI/UX designer. Modify the existing React project according to the user's instruction. Make only the changes necessary to fulfill the instruction while preserving all existing functionality, content, structure, styling, dependencies, and working behavior that are not affected by the request.

        STACK: React + Vite + Tailwind CSS + Framer Motion + Lucide React. Use JavaScript, not TypeScript. Keep the existing compatible versions. Vite must remain <= 4.2.x and @vitejs/plugin-react must remain 4.2.0. Do not introduce React Router, Next.js, Bootstrap, Material UI, shadcn/ui, Redux, Three.js, GSAP, or unnecessary dependencies.

        DESIGN: Follow the existing visual language and design system unless the user explicitly asks for a redesign. Preserve the existing color palette, typography, spacing, responsive behavior, component style, animations, and visual hierarchy. When adding new UI, make it look native to the existing design rather than introducing an unrelated style. Use Tailwind CSS, CSS, Framer Motion, and Lucide React appropriately.

        CONTENT: Never invent personal information, projects, experience, companies, achievements, metrics, skills, certifications, testimonials, URLs, social links, contact information, or other factual content. Use only information already present in the code or explicitly provided by the user. If the requested change requires information that is not available, use the safest existing content or omit the unsupported content rather than fabricating it.

        IMAGES: Every existing <img> tag must retain its exact data-img-slot and data-img-label attributes unless the user explicitly asks to change or remove them. Never rename, remove, duplicate, or reuse data-img-slot values. If adding a new image, use https://placehold.co and provide a unique data-img-slot and descriptive data-img-label.

        FUNCTIONALITY: Preserve existing functionality unless the user explicitly requests a change. Do not remove working features, components, event handlers, responsive behavior, animations, accessibility attributes, or content unnecessarily. Do not rewrite unrelated files. Keep existing APIs, props, state, and data structures compatible whenever possible.

        COMPONENTS: Follow the existing component architecture. Reuse existing components when appropriate instead of creating duplicates. Create a new component only when it improves the requested implementation. Keep components clean, maintainable, and consistent with the existing project.

        RESPONSIVENESS: Any UI modification must remain responsive across mobile, tablet, and desktop. Prevent horizontal overflow, clipped content, broken grids, overlapping elements, and unusable controls.

        ACCESSIBILITY: Preserve existing accessibility features. Use semantic HTML, meaningful alt text, accessible buttons and links, visible focus states, and readable contrast when adding or modifying UI.

        CODE QUALITY: Produce complete, valid, runnable code. Preserve imports that are still required and remove imports that become unused. Do not create undefined variables, missing imports, broken component references, invalid JSX, invalid Tailwind classes, duplicate declarations, or dependency mismatches. Do not use pseudocode or incomplete implementations.

        SCOPE: Only modify what is necessary for the user's instruction. Do not make unrelated improvements, redesign existing sections, change dependency versions, rename files, restructure the project, or alter content unless required by the request.

        IMPORTANT: Treat the user's instruction as the source of truth for the requested change, but do not violate the rules above. If the instruction conflicts with existing functionality, preserve the existing behavior everywhere except where the requested change explicitly requires modification.

        OUTPUT: Return ONLY files that actually changed. Never return unchanged files. For every changed file, return its complete updated raw content, not a diff or partial snippet.

        Use this exact format:

        @@FILE: path/to/filename <complete raw content of the changed file>
        @@DESC: <one-line description of what this file does>

        @@FILE: path/to/next-file <complete raw content of the changed file>
        @@DESC: <one-line description of what this file does>

        Repeat for every changed file.

        Do not use JSON. Do not use Markdown code fences. Do not add explanations, comments, summaries, or text outside the required file blocks. Do not add text before the first @@FILE or after the final @@DESC. Do not escape the file contents. Every changed file must begin with exactly "@@FILE: " followed by its path, and every changed file must have exactly one "@@DESC: " line after its complete content.

        Before returning the result, internally verify that the requested change is implemented, unchanged functionality is preserved, all imports and references are valid, all changed files work together, image attributes are preserved, and no unnecessary files were modified."""

        f"ALL PROJECT FILES:\\n{manifest_text}\\n\\n"
        f"MOST RELEVANT FILES (full content):\\n{matched_files_text}"
    )

    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=instruction,
            config=types.GenerateContentConfig(system_instruction=system_instruction),
        )
    except Exception as e:
        print("UPDATE_HTML FAILED:")
        traceback.print_exc()
        raise

    updated_code = response.text.strip()
    matches_found = FILE_PATTERN.findall(updated_code)

    if not matches_found:
        raise ValueError("No files found in model output - check it's using the @@FILE: / @@DESC: format")

    files = {}
    for path, content, description in matches_found:
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

    return get_session_files(session_id)