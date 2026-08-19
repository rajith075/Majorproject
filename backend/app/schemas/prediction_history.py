from datetime import datetime
from typing import Any

from pydantic import BaseModel


class PredictionHistoryResponse(BaseModel):

    # ======================================================
    # Primary Information
    # ======================================================

    id: int

    patient_id: int

    # ======================================================
    # Health Prediction
    # ======================================================

    health_risk: str

    health_confidence: float

    # ======================================================
    # Clinical Prediction
    # ======================================================

    clinical_event: str

    clinical_confidence: float

    # ======================================================
    # Alert Information
    # ======================================================

    alert_level: str

    alert_message: str

    # ======================================================
    # AI Recommendations
    # ======================================================

    recommendations: list[Any]

    # ======================================================
    # Engineered Features
    # ======================================================

    engineered_features: dict[str, Any]

    # ======================================================
    # Overall Health Score
    # ======================================================

    overall_health_score: float | None = None

    # ======================================================
    # AI Summary
    # ======================================================

    ai_summary: str | None = None

    # ======================================================
    # RAG Explanation
    # ======================================================
    #
    # Contains:
    #
    # {
    #   "status": "...",
    #   "summary": "...",
    #   "key_factors": [...],
    #   "caregiver_guidance": [...],
    #   "disclaimer": "...",
    #   "sources": [...]
    # }
    #
    # ======================================================

    rag_explanation: dict[str, Any] | None = None

    # ======================================================
    # Timestamp
    # ======================================================

    created_at: datetime

    # ======================================================
    # SQLAlchemy Compatibility
    # ======================================================

    class Config:
        from_attributes = True


class PredictionHistoryListResponse(BaseModel):

    history: list[PredictionHistoryResponse]