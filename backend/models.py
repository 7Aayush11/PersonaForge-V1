from pydantic import BaseModel

class EditRequest(BaseModel):
    instruction: str

class DeployRequest(BaseModel):
    slug: str
    html: str
    
class HealRequest(BaseModel):
    files: dict
    error: str
    implicated_files: list[str] = []    