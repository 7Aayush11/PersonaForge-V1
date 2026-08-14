from pydantic import BaseModel

class EditRequest(BaseModel):
    html: str
    instruction: str

class DeployRequest(BaseModel):
    slug: str
    html: str