from pydantic import BaseModel, EmailStr, Field


# ==========================================================
# Register Request
# ==========================================================

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str = Field(min_length=8, max_length=128)

    # family | caregiver | doctor
    role: str = "family"
    # Set only when a caregiver is creating an account from an invitation URL.
    # The token is consumed atomically with account creation.
    invitation_token: str | None = None


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
