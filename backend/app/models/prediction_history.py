from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    DateTime,
    ForeignKey,
    JSON,
)

from sqlalchemy.sql import func

from app.db.database import Base


class PredictionHistory(Base):

    __tablename__ = "prediction_history"

    # ======================================================
    # Primary Key
    # ======================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    # ======================================================
    # Health Prediction
    # ======================================================

    health_risk = Column(String(50))

    health_confidence = Column(Float)

    # ======================================================
    # Clinical Prediction
    # ======================================================

    clinical_event = Column(String(100))

    clinical_confidence = Column(Float)

    # ======================================================
    # Alert
    # ======================================================

    alert_level = Column(String(50))

    alert_message = Column(String(255))

    # ======================================================
    # AI Output
    # ======================================================

    recommendations = Column(JSON)

    engineered_features = Column(JSON)

    # ======================================================
    # NEW (Future Dashboard & RAG)
    # ======================================================

    overall_health_score = Column(Float)

    ai_summary = Column(String(500))

    # ======================================================
    # Timestamp
    # ======================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )