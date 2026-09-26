from datetime import datetime
from pydantic import BaseModel, Field, model_validator


class VitalLogCreate(BaseModel):

    # Hardware capabilities vary. Device readings must not invent values for
    # sensors that are not physically present (for example, a cuff-less UNO
    # setup cannot measure blood pressure).
    heart_rate: float | None = Field(default=None, gt=0, le=300)

    systolic_bp: float | None = Field(default=None, gt=0, le=300)

    diastolic_bp: float | None = Field(default=None, gt=0, le=200)

    spo2: float | None = Field(default=None, gt=0, le=100)

    temperature: float | None = Field(default=None, gt=20, le=50)

    respiratory_rate: float | None = Field(default=None, gt=0, le=100)

    sleep_hours: float | None = Field(default=None, ge=0, le=24)

    activity_steps: int | None = Field(default=None, ge=0, le=200_000)

    @model_validator(mode="after")
    def require_at_least_one_measurement(self):
        if all(
            value is None
            for value in (
                self.heart_rate,
                self.systolic_bp,
                self.diastolic_bp,
                self.spo2,
                self.temperature,
                self.respiratory_rate,
                self.sleep_hours,
                self.activity_steps,
            )
        ):
            raise ValueError("At least one vital measurement is required.")
        if (
            self.systolic_bp is not None
            and self.diastolic_bp is not None
            and self.diastolic_bp >= self.systolic_bp
        ):
            raise ValueError(
                "Diastolic pressure must be lower than systolic pressure."
            )
        return self


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
