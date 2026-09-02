from pydantic import BaseModel, EmailStr, Field


class DoctorRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    password: str = Field(..., min_length=6)


class DoctorRegistrationResponse(BaseModel):
    message: str
    doctor_id: int
    verification_status: str