from datetime import date, time, datetime
from typing import Optional

from pydantic import BaseModel, Field


# ==========================================================
# CREATE CONSULTATION
# ==========================================================

class ConsultationCreate(BaseModel):
    patient_id: int

    scheduled_date: date

    scheduled_time: time

    reason: Optional[str] = Field(
        default=None,
        max_length=1000,
    )


# ==========================================================
# FAMILY - BOOK CONSULTATION
# ==========================================================

class FamilyConsultationCreate(BaseModel):
    patient_id: int
    doctor_id: int

    scheduled_date: date
    scheduled_time: time

    reason: Optional[str] = Field(
        default=None,
        max_length=1000,
    )


# ==========================================================
# UPDATE CONSULTATION STATUS
# ==========================================================

class ConsultationStatusUpdate(BaseModel):
    status: str


# ==========================================================
# UPDATE CONSULTATION NOTES
# ==========================================================

class ConsultationNotesUpdate(BaseModel):
    consultation_notes: Optional[str] = None


# ==========================================================
# CONSULTATION RESPONSE
# ==========================================================

class ConsultationResponse(BaseModel):
    id: int

    patient_id: int

    doctor_id: int

    reason: Optional[str] = None

    scheduled_date: date

    scheduled_time: time

    status: str

    consultation_notes: Optional[str] = None

    requested_at: datetime

    started_at: Optional[datetime] = None

    completed_at: Optional[datetime] = None

    created_at: datetime

    updated_at: datetime

    class Config:
        from_attributes = True