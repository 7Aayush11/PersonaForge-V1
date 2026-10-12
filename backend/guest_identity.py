import hashlib
import os
import secrets
from itsdangerous import URLSafeSerializer, BadSignature
from fastapi import Request, Response, HTTPException


COOKIE_NAME = "pf_guest"
COOKIE_MAX_AGE = 60 * 60 * 24 * 365


def _serializer():
    secret = os.getenv("GUEST_COOKIE_SECRET") or os.getenv("SUPABASE_JWT_SECRET")
    if not secret:
        raise RuntimeError("Set GUEST_COOKIE_SECRET to a long random secret.")
    return URLSafeSerializer(secret, salt="personaforge-guest-v1")


def get_guest_id(request: Request, response: Response) -> str:
    raw = request.cookies.get(COOKIE_NAME)
    serializer = _serializer()
    if raw:
        try:
            guest_id = serializer.loads(raw)
            if isinstance(guest_id, str) and 20 <= len(guest_id) <= 80:
                return guest_id
        except BadSignature:
            pass

    guest_id = secrets.token_urlsafe(32)
    response.set_cookie(
        key=COOKIE_NAME,
        value=serializer.dumps(guest_id),
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        secure=os.getenv("COOKIE_SECURE", "true").lower() == "true",
        samesite=os.getenv("COOKIE_SAMESITE", "none").lower(),
        path="/",
    )
    return guest_id


def hash_guest_id(guest_id: str) -> str:
    secret = os.getenv("GUEST_COOKIE_SECRET") or os.getenv("SUPABASE_JWT_SECRET", "")
    return hashlib.sha256(f"{secret}:{guest_id}".encode()).hexdigest()


def hash_client_ip(request: Request) -> str:
    # Only trust forwarded IP headers when requests come through a trusted proxy.
    ip = request.client.host if request.client else "unknown"
    secret = os.getenv("GUEST_COOKIE_SECRET") or os.getenv("SUPABASE_JWT_SECRET", "")
    return hashlib.sha256(f"{secret}:{ip}".encode()).hexdigest()
