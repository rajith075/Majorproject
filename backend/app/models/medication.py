from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    Time,
)

from app.db.database import Base


class Medication(Base):
    __tablename__ = "medications"

    id = Column(
        Integer,
        primary_key=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
    )

    medicine_name = Column(
        String(150),
        nullable=False,
    )

    dosage = Column(String(100))

    reminder_time = Column(Time)

    before_food = Column(Boolean, default=False)

    morning = Column(Boolean, default=False)

    afternoon = Column(Boolean, default=False)

    evening = Column(Boolean, default=False)

    night = Column(Boolean, default=False)

    active = Column(Boolean, default=True)