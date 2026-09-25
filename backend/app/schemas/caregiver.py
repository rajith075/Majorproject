from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class CaregiverInviteRequest(BaseModel):
    invited_email: EmailStr
    relationship: str = Field(min_length=1, max_length=50)
    message: str | None = Field(default=None, max_length=1_000)


class CaregiverInvitationSummary(BaseModel):
    id: int
    invited_email: EmailStr
    relationship: str
    message: str | None
    status: str
    created_at: datetime
    expires_at: datetime


class CaregiverTeamMember(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str
    relationship: str
    status: str
    created_at: datetime


class CareTeamResponse(BaseModel):
    patient_id: int
    doctor_name: str | None = None
    hospital: str | None = None
    doctor_phone: str | None = None
    caregivers: list[CaregiverTeamMember]
    invitations: list[CaregiverInvitationSummary]


class InvitationPreview(BaseModel):
    invited_email: EmailStr
    patient_name: str
    family_name: str
    relationship: str
    message: str | None
    expires_at: datetime
