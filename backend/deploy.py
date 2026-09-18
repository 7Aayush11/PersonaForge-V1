import re, secrets
from db import supabase

RESERVED_SLUG = ["www", "api", "admin", "generate", "deploy", "mail", "edit", "p", "help", "support", "about", "contact", "test", "staging", "dev", "personaforge"]

SLUG_PATTERN = re.compile(r"^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$")

def clean_slug_input(raw_slug: str) -> str:
    return raw_slug.strip().lower().replace(" ", "-")

def validate_slug(slug: str):
    if not slug or not SLUG_PATTERN.match(slug):
        return "Slug must be 3 to 30 characters: lowercase letters, numbers, hyphens only"
    
    if slug in RESERVED_SLUG:
        return "This name is reserved. Choose another"
    
    return None

def is_slug_taken(slug: str) -> bool:
    result = supabase.table("deployed_sites").select("slug").eq("slug", slug).execute()
    return len(result.data) > 0

def save_site(slug: str, html: str, delete_token: str, user_id: str):
    supabase.table("deployed_sites").insert({
        "slug": slug,
        "html_content": html,
        "delete_token": delete_token,
        "user_id": user_id,
    }).execute()


def get_site(user_id: str):
    result = (
        supabase.table("deployed_sites")
        .select("slug, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


def delete_site(slug: str, user_id: str):
    result = supabase.table("deployed_sites").select("user_id").eq("slug", slug).execute()
    if not result.data:
        return "not_found"
    if result.data[0]["user_id"] != user_id:
        return "forbidden"
    supabase.table("deployed_sites").delete().eq("slug", slug).execute()
    return "deleted"