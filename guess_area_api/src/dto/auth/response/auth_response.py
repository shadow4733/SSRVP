from pydantic import BaseModel

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class UserInfoResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True