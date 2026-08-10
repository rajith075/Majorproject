from datetime import datetime
from typing import Any

from pydantic import BaseModel


class PredictionHistoryResponse(BaseModel):

    id: int

    patient_id: int

    health_risk: str

    health_confidence: float

    clinical_event: str

    clinical_confidence: float

    alert_level: str

    alert_message: str

    recommendations: list[Any]

    engineered_features: dict[str, Any]

    overall_health_score: float | None = None

    ai_summary: str | None = None

    created_at: datetime

    class Config:
        from_attributes = True


class PredictionHistoryListResponse(BaseModel):

    history: list[PredictionHistoryResponse]