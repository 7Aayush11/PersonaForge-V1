from pydantic import BaseModel

class EditRequest(BaseModel):
    session_id: str
    instruction: str

class DeployRequest(BaseModel):
    slug: str
    html: str
    session_id: str
    
class HealRequest(BaseModel):
    files: dict
    error: str
    implicated_files: list[str] = []    
    
class CreatePortfolioRequest(BaseModel):
    session_id: str

class UpdateDeployStatusRequest(BaseModel):
    portfolio_id: str
    deploy_status: bool
    slug: str | None = None