import os
import time
from functools import lru_cache
from fastapi import HTTPException
from google import genai
from google.api_core.exceptions import ServiceUnavailable, ResourceExhausted


def normalize_plan(plan: str | None) -> str:
    return "premium" if (plan or "").lower() == "premium" else "free"


@lru_cache(maxsize=2)
def _client_for_plan(plan: str):
    tier = normalize_plan(plan)
    env_name = "GEMINI_PREMIUM_API_KEY" if tier == "premium" else "GEMINI_API_KEY"
    api_key = os.getenv(env_name)
    if not api_key:
        if tier == "premium":
            raise HTTPException(status_code=503, detail="Premium AI is not configured yet.")
        raise HTTPException(status_code=503, detail="AI service is not configured.")
    return genai.Client(api_key=api_key)


def get_ai_client(plan: str = "free"):
    return _client_for_plan(normalize_plan(plan))


def get_model_chain(plan: str = "free") -> list[str]:
    """Primary model first, fallbacks after. Never returns empty."""
    tier = normalize_plan(plan)
    if tier == "premium":
        primary = os.getenv("GEMINI_PREMIUM_MODEL", "gemini-3.8-flash")
        return [primary, "gemini-3.7-flash", "gemini-3.6-flash", "gemini-2.5-flash"]
    else:
        primary = os.getenv("GEMINI_FREE_MODEL", "gemini-3.6-flash")
        return [primary, "gemini-3.8-flash", "gemini-2.5-flash"]


def get_ai_model(plan: str = "free") -> str:
    return get_model_chain(plan)[0]


def generate_content(plan: str, contents, config=None):
    client = get_ai_client(plan)
    models = get_model_chain(plan)
    last_error = None

    for i, model in enumerate(models):
        try:
            return client.models.generate_content(
                model=model,
                contents=contents,
                config=config,
            )
        except Exception as e:
            err_str = str(e).lower()
            # Only fall through on availability/overload errors
            if any(x in err_str for x in ["503", "unavailable", "overloaded", "resource_exhausted", "429"]):
                last_error = e
                if i < len(models) - 1:
                    print(f"Model {model} unavailable (attempt {i+1}), trying fallback...")
                    time.sleep(1)  # Brief pause before fallback
                continue
            # Any other error (auth, invalid request, etc.) — raise immediately
            raise

    # All models failed
    raise HTTPException(
        status_code=503,
        detail="AI generation is temporarily unavailable. Please try again in a moment."
    ) from last_error