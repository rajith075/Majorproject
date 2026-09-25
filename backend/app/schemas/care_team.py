from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CaregiverInvitationCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=100)
    phone: str = Field(min_length=5, max_length=20)
    email: Optional[str] = None
    relationship_role: str = Field(default="Primary caregiver", min_length=1, max_length=50)


class CaregiverInvitationResponse(BaseModel):
    id: int
    patient_id: int
    caregiver_id: Optional[int] = None
    caregiver_name: str
    caregiver_phone: str
    caregiver_email: Optional[str] = None
    relationship_role: str
    status: str
    created_at: datetime
    responded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CareTeamResponse(BaseModel):
    patient_id: int
    doctor_name: Optional[str] = None
    hospital: Optional[str] = None
    doctor_phone: Optional[str] = None
    caregivers: list[CaregiverInvitationResponse]
