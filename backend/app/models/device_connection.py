from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from app.db.database import Base


class DeviceConnection(Base):
    __tablename__ = "device_connections"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    device_name = Column(
        String(100),
        nullable=False,
        default="Arduino UNO",
    )

    device_token = Column(
        String(128),
        nullable=False,
        unique=True,
        index=True,
    )

    status = Column(
        String(30),
        nullable=False,
        default="connected",
    )

    connected_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    last_seen_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )