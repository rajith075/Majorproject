from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
)

from app.db.database import Base


class PatientCondition(Base):
    __tablename__ = "patient_conditions"

    id = Column(
        Integer,
        primary_key=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
    )

    condition_id = Column(
        Integer,
        ForeignKey("conditions.id"),
    )