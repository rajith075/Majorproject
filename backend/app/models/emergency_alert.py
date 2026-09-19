from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.sql import func

from app.db.database import Base


class EmergencyAlert(Base):

    __tablename__ = "emergency_alerts"

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

    event_type = Column(
        String,
        nullable=False,
    )

    status = Column(
        String,
        nullable=False,
        default="ACTIVE",
        index=True,
    )

    latitude = Column(
        nullable=True,
    )

    longitude = Column(
        nullable=True,
    )

    detected_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    patient_confirmation = Column(
        Boolean,
        nullable=True,
    )

    caregiver_confirmation = Column(
        Boolean,
        nullable=True,
    )

    resolution = Column(
        String,
        nullable=True,
    )

    resolved_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )

    vital_log_id = Column(
        Integer,
        ForeignKey("vital_logs.id"),
        nullable=True,
        index=True,
    )