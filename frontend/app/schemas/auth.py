from pydantic import BaseModel, EmailStr


# ==========================================================
# Register Request
# ==========================================================

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str

    # family | caregiver | doctor
    role: str = "family"


# ==========================================================
# Login Request
# ==========================================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ==========================================================
# Token Response
# ==========================================================

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ==========================================================
# User Response
# ==========================================================

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str
    role: str

    class Config:
        from_attributes = True