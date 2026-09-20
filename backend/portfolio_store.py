from db import supabase


def create_portfolio(user_id: str, session_id: str) -> dict:
    result = supabase.table("portfolios").insert({
        "user_id": user_id,
        "session_id": session_id,
        "deploy_status": False,
    }).execute()
    return result.data[0] if result.data else {}


def get_portfolios_for_user(user_id: str) -> list:
    result = (
        supabase.table("portfolios")
        .select("portfolio_id, session_id, deploy_status, created_at, updated_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    portfolios = result.data or []


    for p in portfolios:
        if p["deploy_status"]:
            site = (
                supabase.table("deployed_sites")
                .select("slug")
                .eq("session_id", p["session_id"])
                .limit(1)
                .execute()
            )
            p["slug"] = site.data[0]["slug"] if site.data else None
        else:
            p["slug"] = None

    return portfolios


def set_deploy_status(portfolio_id: str, user_id: str, status: bool, slug: str = None) -> dict:
    result = (
        supabase.table("portfolios")
        .update({"deploy_status": status})
        .eq("portfolio_id", portfolio_id)
        .eq("user_id", user_id)
        .execute()
    )
    return result.data[0] if result.data else {}


def delete_portfolio(portfolio_id: str, user_id: str):
    
    p = (
        supabase.table("portfolios")
        .select("session_id")
        .eq("portfolio_id", portfolio_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not p.data:
        return None

    session_id = p.data["session_id"]

    supabase.table("deployed_sites").delete().eq("session_id", session_id).execute()
    
    
    supabase.table("file_embeddings").delete().eq("session_id", session_id).execute()
    
    
    supabase.table("portfolios").delete().eq("portfolio_id", portfolio_id).execute()
    return session_id