from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
)

from sqlalchemy.orm import relationship

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

    condition = relationship(
        "Condition",
        lazy="joined",
    )