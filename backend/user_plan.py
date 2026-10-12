from datetime import datetime, timezone, timedelta
from fastapi import HTTPException
from db import supabase

FREE_GENERATION_LIMIT = 1
FREE_WEEKLY_EDIT_LIMIT = 3


def get_user_plan(user_id: str) -> str:
    """Return premium only for an active, verified premium subscription; otherwise free."""
    try:
        result = (
            supabase.table("profiles")
            .select("plan, subscription_status")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        data = result.data or {}
        plan = (data.get("plan") or "free").lower()
        status = (data.get("subscription_status") or "").lower()
        if plan == "premium" and status in {"active", "authenticated"}:
            return "premium"
        # Backwards compatibility for existing profiles only if subscription_status
        # column has not yet been migrated: migration must be applied before rollout.
        return "free"
    except Exception:
        return "free"


def get_entitlements(user_id: str | None = None, guest: bool = False) -> dict:
    if guest or not user_id:
        return {
            "tier": "guest",
            "can_generate": True,
            "can_edit": False,
            "can_deploy": False,
            "weekly_edits_limit": 0,
            "weekly_edits_used": 0,
            "generation_limit": 1,
        }

    tier = get_user_plan(user_id)
    generation_used = get_generation_count(user_id)
    edit_used = get_weekly_edit_count(user_id)
    premium = tier == "premium"
    return {
        "tier": tier,
        "can_generate": premium or generation_used < FREE_GENERATION_LIMIT,
        "can_edit": premium or edit_used < FREE_WEEKLY_EDIT_LIMIT,
        "can_deploy": True,
        "weekly_edits_limit": None if premium else FREE_WEEKLY_EDIT_LIMIT,
        "weekly_edits_used": edit_used,
        "generation_limit": None if premium else FREE_GENERATION_LIMIT,
        "generations_used": generation_used,
    }


def get_generation_count(user_id: str) -> int:
    try:
        result = (
            supabase.table("usage_events")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("action", "generation")
            .execute()
        )
        return int(result.count or 0)
    except Exception:
        # Fail closed: do not grant extra usage if the usage table is missing.
        raise HTTPException(status_code=503, detail="Usage tracking is temporarily unavailable.")


def get_weekly_edit_count(user_id: str) -> int:
    cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    try:
        result = (
            supabase.table("edit_quota")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .gte("created_at", cutoff)
            .execute()
        )
        return int(result.count or 0)
    except Exception:
        raise HTTPException(status_code=503, detail="Usage tracking is temporarily unavailable.")


def _record_event(user_id: str, action: str, session_id: str | None = None):
    supabase.table("usage_events").insert({
        "user_id": user_id,
        "action": action,
        "session_id": session_id,
    }).execute()


def consume_generation(user_id: str, session_id: str):
    tier = get_user_plan(user_id)
    try:
        result = supabase.rpc("consume_user_generation", {
            "p_user_id": user_id,
            "p_session_id": session_id,
            "p_is_premium": tier == "premium",
        }).execute()
        data = result.data
        allowed = data is True or data == [{"allowed": True}] or (
            isinstance(data, dict) and data.get("allowed") is True
        )
        if not allowed:
            raise HTTPException(
                status_code=403,
                detail={"code": "GENERATION_LIMIT_REACHED", "message": "Free accounts can generate one portfolio. Upgrade to Premium to create more."},
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=503, detail="Usage tracking is temporarily unavailable.")


def consume_edit(user_id: str, session_id: str):
    tier = get_user_plan(user_id)
    try:
        result = supabase.rpc("consume_user_edit", {
            "p_user_id": user_id,
            "p_session_id": session_id,
            "p_is_premium": tier == "premium",
        }).execute()
        data = result.data
        allowed = data is True or data == [{"allowed": True}] or (
            isinstance(data, dict) and data.get("allowed") is True
        )
        if not allowed:
            raise HTTPException(
                status_code=403,
                detail={"code": "EDIT_LIMIT_REACHED", "message": "You have used your 3 free edits in the last 7 days. Upgrade to Premium for premium editing access."},
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=503, detail="Usage tracking is temporarily unavailable.")


def record_guest_generation(guest_id_hash: str, ip_hash: str, session_id: str):
    """Call the SQL RPC so guest limit checks and records are atomic."""
    try:
        result = supabase.rpc(
            "consume_guest_generation",
            {
                "p_guest_hash": guest_id_hash,
                "p_ip_hash": ip_hash,
                "p_session_id": session_id,
            },
        ).execute()
        
        data = result.data
        allowed = data is True or data == [{"allowed": True}] or (
            isinstance(data, dict) and data.get("allowed") is True
        )
        if not allowed:
            raise HTTPException(
                status_code=403,
                detail={"code": "GUEST_GENERATION_LIMIT_REACHED", "message": "This guest session has already generated a portfolio. Sign in to continue."},
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=503, detail="Guest usage tracking is unavailable. Please try again later.")


def guest_generation_used(guest_id_hash: str) -> bool:
    try:
        result = (
            supabase.table("guest_usage")
            .select("guest_id")
            .eq("guest_id", guest_id_hash)
            .limit(1)
            .execute()
        )
        return bool(result.data)
    except Exception:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=503, detail="Guest usage tracking is temporarily unavailable.")


def get_profile(user_id: str):
    try:
        result = (
            supabase.table("profiles")
            .select("plan, subscription_status, razorpay_subscription_id, current_period_end")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        data = result.data or {}
        return {
            "tier": get_user_plan(user_id),
            "subscription_status": data.get("subscription_status", "inactive"),
            "current_period_end": data.get("current_period_end"),
        }
    except Exception:
        return {"tier": "free", "subscription_status": "inactive", "current_period_end": None}
