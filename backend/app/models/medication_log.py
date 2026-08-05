from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.sql import func

from app.db.database import Base


class MedicationLog(Base):
    __tablename__ = "medication_logs"

    id = Column(Integer, primary_key=True)

    medication_id = Column(
        Integer,
        ForeignKey("medications.id"),
    )

    taken = Column(
        Boolean,
        default=False,
    )

    taken_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    taken_by = Column(
        String(100),
    )

    notes = Column(
        String(500),
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )