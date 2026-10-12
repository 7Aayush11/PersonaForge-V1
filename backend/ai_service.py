import os
from functools import lru_cache
from fastapi import HTTPException
from google import genai


def normalize_plan(plan: str | None) -> str:
    return "premium" if (plan or "").lower() == "premium" else "free"


@lru_cache(maxsize=2)
def _client_for_plan(plan: str):
    tier = normalize_plan(plan)
    env_name = "GEMINI_PREMIUM_API_KEY" if tier == "premium" else "GEMINI_API_KEY"
    api_key = os.getenv(env_name)
    if not api_key:
        if tier == "premium":
            raise HTTPException(
                status_code=503,
                detail="Premium AI is not configured yet. Please try again later."
            )
        raise HTTPException(status_code=503, detail="AI service is not configured.")

    return genai.Client(api_key=api_key)


def get_ai_client(plan: str = "free"):
    return _client_for_plan(normalize_plan(plan))


def get_ai_model(plan: str = "free") -> str:
    tier = normalize_plan(plan)
    default_model = os.getenv("GEMINI_PREMIUM_MODEL" if tier == "premium" else "GEMINI_FREE_MODEL")
    return default_model or ("gemini-2.5-flash" if tier == "free" else "gemini-2.5-pro")


def generate_content(plan: str, contents, config=None):
    client = get_ai_client(plan)
    return client.models.generate_content(
        model=get_ai_model(plan),
        contents=contents,
        config=config,
    )
