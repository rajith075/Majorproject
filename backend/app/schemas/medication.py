from datetime import datetime, time
from typing import Optional

from pydantic import BaseModel


# ==========================================================
# Create Medication
# ==========================================================

class MedicationCreate(BaseModel):
    medicine_name: str
    dosage: Optional[str] = None
    reminder_time: Optional[time] = None

    before_food: bool = False

    morning: bool = False
    afternoon: bool = False
    evening: bool = False
    night: bool = False


# ==========================================================
# Medication Response
# ==========================================================

class MedicationResponse(BaseModel):
    id: int
    patient_id: int
    medicine_name: str
    dosage: Optional[str] = None
    reminder_time: Optional[time] = None

    before_food: bool

    morning: bool
    afternoon: bool
    evening: bool
    night: bool

    active: bool

    class Config:
        from_attributes = True


# ==========================================================
# Medication Status Response
# Used by Family + Caregiver Dashboards
# ==========================================================

class MedicationStatusResponse(BaseModel):
    id: int
    patient_id: int
    medicine_name: str
    dosage: Optional[str] = None
    reminder_time: Optional[time] = None

    before_food: bool

    morning: bool
    afternoon: bool
    evening: bool
    night: bool

    active: bool

    # Today's medication status
    status: str

    # Medication log information
    given_by: Optional[str] = None
    given_at: Optional[datetime] = None

    class Config:
        from_attributes = True