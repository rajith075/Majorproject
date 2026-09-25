from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from app.db.database import Base


class CaregiverPatient(Base):
    """An active caregiver-to-patient relationship."""

    __tablename__ = "caregiver_patients"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    caregiver_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # Legacy metadata retained while existing installations transition to the
    # dedicated caregiver_invitations table.
    invited_by_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    caregiver_name = Column(String(100), nullable=False)
    caregiver_phone = Column(String(20), nullable=False, index=True)
    caregiver_email = Column(String(120), nullable=True, index=True)
    relationship_role = Column(String(50), nullable=False, default="Primary caregiver")

    # New links are always created as active. Retaining the column avoids a
    # destructive schema change for the previously deployed table.
    status = Column(String(30), nullable=False, default="active", index=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    responded_at = Column(DateTime(timezone=True), nullable=True)
