from datetime import datetime
from pydantic import BaseModel, Field, model_validator


class VitalLogCreate(BaseModel):

    heart_rate: float

    systolic_bp: float

    diastolic_bp: float

    spo2: float

    temperature: float

    respiratory_rate: float

    sleep_hours: float

    activity_steps: int


class DoctorBloodPressureCreate(BaseModel):
    """A blood-pressure reading entered by the assigned doctor."""

    systolic_bp: float = Field(gt=0, le=300)
    diastolic_bp: float = Field(gt=0, le=200)

    @model_validator(mode="after")
    def validate_pressure_order(self):
        if self.diastolic_bp >= self.systolic_bp:
            raise ValueError(
                "Diastolic pressure must be lower than systolic pressure."
            )
        return self


class VitalLogResponse(BaseModel):

    heart_rate: float | None = None

    systolic_bp: float | None = None

    diastolic_bp: float | None = None

    spo2: float | None = None

    temperature: float | None = None

    respiratory_rate: float | None = None

    sleep_hours: float | None = None

    activity_steps: int | None = None

    id: int

    patient_id: int

    created_at: datetime

    class Config:

        from_attributes = True
