from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.sql import func

from app.db.database import Base


class DoctorVerification(Base):
    __tablename__ = "doctor_verifications"

    id = Column(
        Integer,
        primary_key=True,
    )

    doctor_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    medical_certificate = Column(
        String(500),
        nullable=True,
    )

    clinic_license = Column(
        String(500),
        nullable=True,
    )

    verification_status = Column(
        String(30),
        default="pending",
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )