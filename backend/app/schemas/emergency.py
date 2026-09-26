from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class EmergencyAlertCreate(BaseModel):

    patient_id: int

    event_type: str = "FALL"

    latitude: Optional[float] = None

    longitude: Optional[float] = None


class EmergencyLocationUpdate(BaseModel):
    """A browser-provided coordinate for an existing emergency alert."""

    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class EmergencyAlertResponse(BaseModel):

    id: int
    patient_id: int

    event_type: str
    status: str

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    detected_at: datetime

    patient_confirmation: Optional[bool] = None
    caregiver_confirmation: Optional[bool] = None

    resolution: Optional[str] = None
    resolved_at: Optional[datetime] = None

    notes: Optional[str] = None

    class Config:
        from_attributes = True
