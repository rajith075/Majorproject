from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
)
from sqlalchemy.sql import func

from app.db.database import Base


class Consultation(Base):
    __tablename__ = "consultations"

    # ==========================================================
    # Primary Key
    # ==========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ==========================================================
    # Patient
    # ==========================================================

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    # ==========================================================
    # Doctor
    # ==========================================================

    doctor_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # ==========================================================
    # Consultation Details
    # ==========================================================

    reason = Column(
        Text,
        nullable=True,
    )

    scheduled_date = Column(
        Date,
        nullable=False,
    )

    scheduled_time = Column(
        Time,
        nullable=False,
    )

    # scheduled / in_progress / completed / cancelled
    status = Column(
        String(30),
        nullable=False,
        default="scheduled",
    )

    # ==========================================================
    # Doctor Consultation Notes
    # ==========================================================

    consultation_notes = Column(
        Text,
        nullable=True,
    )

    # ==========================================================
    # Timestamps
    # ==========================================================

    requested_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    started_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    completed_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )