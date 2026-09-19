from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.db.database import Base


class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(Integer, primary_key=True, index=True)

    doctor_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    specialization = Column(String(150), nullable=True)
    clinic_name = Column(String(200), nullable=True)
    clinic_address = Column(Text, nullable=True)
    experience_years = Column(Integer, nullable=True)
    bio = Column(Text, nullable=True)