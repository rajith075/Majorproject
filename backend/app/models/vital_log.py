from sqlalchemy import (
    Column,
    Integer,
    Float,
    ForeignKey,
    DateTime,
)

from sqlalchemy.sql import func

from app.db.database import Base


class VitalLog(Base):
    __tablename__ = "vital_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
    )

    heart_rate = Column(Float)

    systolic_bp = Column(Float)

    diastolic_bp = Column(Float)

    spo2 = Column(Float)

    temperature = Column(Float)

    respiratory_rate = Column(Float)

    sleep_hours = Column(Float)

    activity_steps = Column(Integer)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )