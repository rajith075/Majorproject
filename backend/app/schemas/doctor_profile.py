from typing import Optional

from pydantic import BaseModel, Field


class DoctorProfileCreate(BaseModel):
    specialization: Optional[str] = Field(default=None, max_length=150)
    clinic_name: Optional[str] = Field(default=None, max_length=200)
    clinic_address: Optional[str] = None
    experience_years: Optional[int] = Field(default=None, ge=0)
    bio: Optional[str] = None


class DoctorProfileResponse(BaseModel):
    doctor_id: int
    full_name: str
    email: str

    phone: Optional[str] = None

    specialization: Optional[str] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None

    verification_status: str

    class Config:
        from_attributes = True