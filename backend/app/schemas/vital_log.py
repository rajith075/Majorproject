from datetime import datetime
from typing import Optional

from pydantic import BaseModel


# ==========================================================
# Create Vital Log
# ==========================================================

class VitalLogCreate(BaseModel):

    patient_id: int

    heart_rate: float

    systolic_bp: float

    diastolic_bp: float

    spo2: float

    temperature: float

    respiratory_rate: float

    sleep_hours: Optional[float] = None

    activity_steps: Optional[int] = None


# ==========================================================
# Response
# ==========================================================

class VitalLogResponse(VitalLogCreate):

    id: int

    created_at: datetime

    class Config:
        from_attributes = True