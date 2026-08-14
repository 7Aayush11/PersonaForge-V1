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

def save_site(slug: str, html: str, token: str):
    supabase.table("deployed_sites").insert({
        "slug": slug,
        "html_content": html,
        "delete_token": token,
    }).execute()
    
def get_site(slug: str):
    result = supabase.table("deployed_sites").select("html_content").eq("slug", slug).execute()
    if not result.data:
        return None
    
    return result.data[0]["html_content"]

def delete_site(slug: str, token: str):
    result = supabase.table("deployed_sites").select("delete_token").eq("slug", slug).execute()
    
    if not result.data:
        return "Not Found"
    
    stored_token = result.data[0]["delete_token"]
    
    if not stored_token or stored_token!=token:
        return "Invalid token"
    
    supabase.table("deployed_sites").delete().eq("slug", slug).execute()
    return "Your portfolio is successfully deleted"