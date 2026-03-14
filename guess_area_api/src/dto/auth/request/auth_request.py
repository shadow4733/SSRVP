from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=6, description="Password")

class LoginRequest(BaseModel):
    username: str = Field(..., description="Username")
    password: str = Field(..., description="Password")