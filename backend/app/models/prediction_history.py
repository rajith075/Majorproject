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

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
    )

    # ======================================================
    # Health Model
    # ======================================================

    health_risk = Column(String(50))

    health_confidence = Column(Float)

    # ======================================================
    # Clinical Event Model
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
    # Timestamp
    # ======================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )