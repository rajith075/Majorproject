from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, UniqueConstraint

from app.db.database import Base


class MedicationReminder(Base):
    """One reminder delivery attempt per medication per patient-local day."""

    __tablename__ = "medication_reminders"
    __table_args__ = (
        UniqueConstraint("medication_id", "scheduled_date", name="uq_medication_reminder_day"),
    )

    id = Column(Integer, primary_key=True, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    scheduled_date = Column(Date, nullable=False, index=True)
    status = Column(String(20), nullable=False, default="sent")
    sent_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
