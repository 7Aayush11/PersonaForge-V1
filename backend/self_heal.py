from google.genai import types
import traceback
from ai_service import generate_content


def heal_files(files: dict, error: str, implicated_files: list, plan: str = "free") -> str:
    files_text = "\n\n".join(f"@@FILE: {path}\n{content}" for path, content in files.items())
    implicated_text = ", ".join(implicated_files) if implicated_files else "unknown, infer from the error"

    user_content = f"PROJECT FILES:\n{files_text}\n\nERROR:\n{error}\n\nLIKELY AFFECTED FILES:\n{implicated_text}"

    try:
        response = generate_content(
            plan=plan,
            contents=user_content,
            config={
                "system_instruction": """You are an expert at debugging React, Vite, Tailwind CSS, and Framer Motion projects. You will be given the full set of project files and a runtime error that occurred when the app ran in the browser. Diagnose the root cause and fix it. Return ONLY the files that actually need to change - do not return files that are unchanged. Never introduce any import or package beyond: react, react-dom, framer-motion, react-icons. When using react-icons, only use verified real icon names, never invent one. If the error is about a missing icon export, replace it with a real, verified icon from the same icon family, or remove the icon if no reasonable substitute exists. Output each changed file using this exact format, with no other text: @@FILE: path/to/filename\n<the full corrected raw content of that file>\n\nRepeat for every changed file. Do not use JSON. Do not use markdown code fences. Do not add explanation before, after, or between files."""
            }
        )

        return response.text

    except Exception as e:
        traceback.print_exc()
        for attr in ("response", "status_code", "body", "message", "args"):
            if hasattr(e, attr):
                print(f"  {attr}: {getattr(e, attr)}")
        raise