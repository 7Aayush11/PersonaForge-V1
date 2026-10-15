import hashlib
import hmac
import json
import os
import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
import razorpay
from db import supabase
from auth import get_current_user

router = APIRouter(prefix="/billing", tags=["billing"])


def _razorpay_client():
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        raise HTTPException(status_code=503, detail="Payments are not configured yet.")
    return razorpay.Client(auth=(key_id, key_secret))


def _plans():
    return {
        "monthly": {"plan_id": os.getenv("RAZORPAY_PLAN_MONTHLY"), "amount": 9900, "label": "Monthly"},
        "quarterly": {"plan_id": os.getenv("RAZORPAY_PLAN_QUARTERLY"), "amount": 24900, "label": "3 months"},
    }


class CreateSubscriptionRequest(BaseModel):
    plan: str = Field(pattern="^(monthly|quarterly)$")


class VerifySubscriptionRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_subscription_id: str
    razorpay_signature: str


def _save_subscription(user_id: str, subscription_id: str, status: str, plan: str = "premium", period_end=None):
    payload = {
        "user_id": user_id,
        "plan": plan,
        "subscription_status": status,
        "razorpay_subscription_id": subscription_id,
        "current_period_end": period_end,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        supabase.table("profiles").upsert(payload, on_conflict="user_id").execute()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Could not update subscription status.") from exc


@router.get("/plans")
def list_plans():
    return {
        "currency": "INR",
        "plans": [
            {"id": key, "label": value["label"], "amount_paise": value["amount"]}
            for key, value in _plans().items()
        ],
    }


@router.get("/status")
def billing_status(user=Depends(get_current_user)):
    result = (
        supabase.table("profiles")
        .select("plan, subscription_status, current_period_end")
        .eq("user_id", user["user_id"])
        .maybe_single()
        .execute()
    )
    data = result.data or {}
    return {
        "tier": "premium" if data.get("plan") == "premium" and data.get("subscription_status") in {"active", "authenticated"} else "free",
        "subscription_status": data.get("subscription_status", "inactive"),
        "current_period_end": data.get("current_period_end"),
    }


@router.post("/create-subscription")
def create_subscription(request: CreateSubscriptionRequest, user=Depends(get_current_user)):
    existing = (
        supabase.table("profiles")
        .select("plan, subscription_status")
        .eq("user_id", user["user_id"])
        .maybe_single()
        .execute()
    )
    existing_data = existing.data or {}
    if existing_data.get("plan") == "premium" and existing_data.get("subscription_status") in {"active", "authenticated"}:
        raise HTTPException(status_code=409, detail="Your account already has an active Premium subscription.")

    plan = _plans()[request.plan]
    if not plan["plan_id"]:
        raise HTTPException(
            status_code=503,
            detail=f"Razorpay plan is not configured for {request.plan}. Create it in the Razorpay Dashboard and set the matching environment variable.",
        )

    client = _razorpay_client()
    try:
        subscription = client.subscription.create({
            "plan_id": plan["plan_id"],
            "total_count": 120 if request.plan == "monthly" else (40 if request.plan == "quarterly" else 10),
            "quantity": 1,
            "customer_notify": 1,
            "notes": {
                "user_id": user["user_id"],
                "selected_plan": request.plan,
            },
        })
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Razorpay could not create the subscription.") from exc

    # Save pending status; premium is NOT activated until verified payment/webhook.
    try:
        supabase.table("profiles").upsert({
            "user_id": user["user_id"],
            "plan": "free",
            "subscription_status": "created",
            "razorpay_subscription_id": subscription["id"],
            "selected_billing_plan": request.plan,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }, on_conflict="user_id").execute()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Subscription created but local status could not be saved.") from exc

    return {
        "key_id": os.getenv("RAZORPAY_KEY_ID"),
        "subscription_id": subscription["id"],
        "plan": request.plan,
        "amount_paise": plan["amount"],
        "currency": "INR",
        "name": "PersonaForge Premium",
        "description": f"PersonaForge Premium — {plan['label']}",
        "prefill": {"email": user.get("email") or ""},
    }


@router.post("/verify")
def verify_subscription(request: VerifySubscriptionRequest, user=Depends(get_current_user)):
    secret = os.getenv("RAZORPAY_KEY_SECRET")
    if not secret:
        raise HTTPException(status_code=503, detail="Payments are not configured yet.")

    # Razorpay subscription checkout signature: HMAC_SHA256(payment_id|subscription_id).
    message = f"{request.razorpay_payment_id}|{request.razorpay_subscription_id}"
    expected = hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, request.razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment signature verification failed.")

    try:
        subscription = _razorpay_client().subscription.fetch(request.razorpay_subscription_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Could not verify subscription with Razorpay.") from exc

    notes = subscription.get("notes") or {}
    if notes.get("user_id") and notes["user_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="This subscription belongs to another account.")

    status = subscription.get("status", "created")
    # Checkout callback alone is not enough: only activate when Razorpay confirms active/authenticated.
    if status in {"active", "authenticated"}:
        _save_subscription(user["user_id"], request.razorpay_subscription_id, status)
    else:
        _save_subscription(user["user_id"], request.razorpay_subscription_id, status, plan="free")

    return {"verified": True, "tier": "premium" if status in {"active", "authenticated"} else "free", "subscription_status": status}


@router.post("/webhook")
async def razorpay_webhook(request: Request):
    webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")
    if not webhook_secret:
        raise HTTPException(status_code=503, detail="Razorpay webhook is not configured.")

    body = await request.body()
    supplied = request.headers.get("X-Razorpay-Signature", "")
    expected = hmac.new(webhook_secret.encode(), body, hashlib.sha256).hexdigest()
    if not supplied or not hmac.compare_digest(expected, supplied):
        raise HTTPException(status_code=400, detail="Invalid webhook signature.")

    event_id = request.headers.get("X-Razorpay-Event-Id")
    event = json.loads(body.decode("utf-8"))
    event_type = event.get("event", "")
    entity = (
        event.get("payload", {}).get("subscription", {}).get("entity")
        or event.get("payload", {}).get("payment", {}).get("entity")
        or {}
    )
    subscription_id = entity.get("id") if entity.get("entity") == "subscription" else entity.get("subscription_id")
    if not subscription_id:
        return {"received": True, "ignored": True}

    # Resolve the owner from the stored subscription ID, never from user-supplied webhook notes.
    profile = (
        supabase.table("profiles")
        .select("user_id")
        .eq("razorpay_subscription_id", subscription_id)
        .limit(1)
        .execute()
    )
    if not profile.data:
        return {"received": True, "unmatched": True}

    user_id = profile.data[0]["user_id"]
    active_events = {"subscription.activated", "subscription.authenticated", "subscription.charged"}
    inactive_events = {"subscription.cancelled", "subscription.halted", "subscription.paused", "subscription.completed"}
    if event_type in active_events:
        # A subscription.charged webhook may contain a payment entity whose status
        # is "captured"; that is a successful subscription charge, not a subscription status.
        status = "active" if event_type == "subscription.charged" else (entity.get("status") or "active")
        _save_subscription(user_id, subscription_id, status, "premium" if status in {"active", "authenticated"} else "free")
    elif event_type in inactive_events:
        status = entity.get("status") or event_type.split(".", 1)[1]
        _save_subscription(user_id, subscription_id, status, "free")

    if event_id:
        try:
            supabase.table("billing_events").upsert({
                "event_id": event_id,
                "event_type": event_type,
                "subscription_id": subscription_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }, on_conflict="event_id").execute()
        except Exception:
            # Subscription state update is still authoritative; webhook retries are safe.
            pass

    return {"received": True}

@router.post("/cancel-subscription")
async def cancel_subscription(user=Depends(get_current_user)):
    
    # Get user's subscription_id and current_period_end
    profile = supabase.table("profiles").select(
        "razorpay_subscription_id, plan, current_period_end"
    ).eq("user_id", user["user_id"]).single().execute()
    
    if not profile.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    p = profile.data
    if p.get("plan") != "premium":
        raise HTTPException(status_code=400, detail="No active premium subscription")
    
    sub_id = p.get("razorpay_subscription_id")
    if not sub_id:
        raise HTTPException(status_code=400, detail="No subscription ID found")
    
    import razorpay
    client = razorpay.Client(
        auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET"))
    )
    
    try:
        # Cancel at period end — user keeps premium until current_period_end
        client.subscription.cancel(sub_id, {"cancel_at_cycle_end": 1})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Razorpay cancel failed: {e}")
    
    # Fetch subscription to get current_period_end if it's null
    try:
        sub = client.subscription.fetch(sub_id)
        period_end = sub.get("current_end") or sub.get("charge_at")
    except Exception:
        period_end = None
    
    # Mark as cancelling in profiles — premium stays until period ends
    supabase.table("profiles").update({
        "cancel_at_period_end": True,
        "current_period_end": period_end,
    }).eq("user_id", user["user_id"]).execute()
    
    return {
        "message": "Subscription cancelled. Premium access remains until end of billing period.",
        "current_period_end": period_end,
    }