from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text,
    Boolean,
)

from sqlalchemy.sql import func

from app.db.database import Base


class EmergencyAlert(Base):

    __tablename__ = "emergency_alerts"

    # ======================================================
    # Primary Key
    # ======================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ======================================================
    # Patient
    # ======================================================

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    # ======================================================
    # Emergency Event
    # ======================================================

    event_type = Column(
        String(50),
        nullable=False,
        default="FALL",
    )

    status = Column(
        String(50),
        nullable=False,
        default="DETECTED",
        index=True,
    )

    # ======================================================
    # GPS LOCATION
    # ======================================================

    latitude = Column(
        Float,
        nullable=True,
    )

    longitude = Column(
        Float,
        nullable=True,
    )

    # ======================================================
    # Detection Time
    # ======================================================

    detected_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # ======================================================
    # Human Confirmation
    # ======================================================

    patient_confirmation = Column(
        Boolean,
        nullable=True,
    )

    caregiver_confirmation = Column(
        Boolean,
        nullable=True,
    )

    # ======================================================
    # Final Resolution
    # ======================================================

    resolution = Column(
        String(50),
        nullable=True,
    )

    resolved_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ======================================================
    # Additional Notes
    # ======================================================

    notes = Column(
        Text,
        nullable=True,
    )