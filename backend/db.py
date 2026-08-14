import os
from supabase import Client, create_client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

supabase: Client = create_client(supabase_key=SUPABASE_KEY, supabase_url=SUPABASE_URL)