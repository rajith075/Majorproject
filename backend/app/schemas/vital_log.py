from datetime import datetime
from pydantic import BaseModel


class VitalLogCreate(BaseModel):

    heart_rate: float

    systolic_bp: float

    diastolic_bp: float

    spo2: float

    temperature: float

    respiratory_rate: float

    sleep_hours: float

    activity_steps: int


class VitalLogResponse(VitalLogCreate):

    id: int

    patient_id: int

    created_at: datetime

    class Config:

        from_attributes = True