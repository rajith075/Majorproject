from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from app.db.database import Base


class CaregiverInvitation(Base):
    """A time-limited, email-addressed invitation that has not granted access."""

    __tablename__ = "caregiver_invitations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    invited_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    accepted_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    invited_email = Column(String(120), nullable=False, index=True)
    relationship = Column(String(50), nullable=False)
    message = Column(Text, nullable=True)

    # A SHA-256 hash is stored; the raw token exists only in the emailed URL.
    token_hash = Column(String(64), nullable=False, unique=True, index=True)
    status = Column(String(30), nullable=False, default="pending", index=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    responded_at = Column(DateTime(timezone=True), nullable=True)
