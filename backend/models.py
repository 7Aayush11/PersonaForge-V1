from pydantic import BaseModel

class EditRequest(BaseModel):
    html: str
    instruction: str