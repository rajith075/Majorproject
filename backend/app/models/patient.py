from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey,
)

from app.db.database import Base


class Patient(Base):
    __tablename__ = "patients"

    # ==========================================================
    # Primary Key
    # ==========================================================

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    # ==========================================================
    # Basic Information
    # ==========================================================

    full_name = Column(String(100), nullable=False)

    age = Column(Integer, nullable=False)

    gender = Column(String(20), nullable=False)

    blood_group = Column(String(5), nullable=False)

    ethnicity = Column(String(50))

    phone = Column(String(15), nullable=False)

    address = Column(Text, nullable=False)

    # ==========================================================
    # Physical Information
    # ==========================================================

    height_cm = Column(Float)

    weight_kg = Column(Float)

    bmi = Column(Float)

    # ==========================================================
    # Lifestyle
    # ==========================================================

    smoking = Column(String(20))

    alcohol = Column(String(20))

    exercise_level = Column(String(30))

    diet_quality = Column(String(30))

    water_intake_liters = Column(Float)

    medication_adherence = Column(String(30))

    mobility = Column(String(30))

    memory_status = Column(String(30))

    # ==========================================================
    # Baseline Vitals
    # ==========================================================

    baseline_heart_rate = Column(Float)

    baseline_systolic_bp = Column(Float)

    baseline_diastolic_bp = Column(Float)

    baseline_spo2 = Column(Float)

    baseline_temperature = Column(Float)

    baseline_respiratory_rate = Column(Float)

    # ==========================================================
    # Latest Live Vitals
    # ==========================================================

    last_heart_rate = Column(Float)

    last_systolic_bp = Column(Float)

    last_diastolic_bp = Column(Float)

    last_spo2 = Column(Float)

    last_temperature = Column(Float)

    last_respiratory_rate = Column(Float)

    # ==========================================================
    # Medical Information
    # (Temporary - will migrate fully to PatientCondition
    # and Medication tables later)
    # ==========================================================

    medical_conditions = Column(Text)

    allergies = Column(Text)

    medications = Column(Text)

    # ==========================================================
    # Emergency Contact
    # ==========================================================

    emergency_contact_name = Column(String(100))

    emergency_contact_phone = Column(String(15))

    relationship = Column(String(30))

    secondary_contact = Column(String(15))

    # ==========================================================
    # Care Team
    # ==========================================================

    assigned_doctor = Column(String(100))

    assigned_caregiver = Column(String(100))

    hospital = Column(String(100))

    doctor_phone = Column(String(15))

    # ==========================================================
    # AI Monitoring
    # ==========================================================

    health_index = Column(Float)

    last_health_risk = Column(String(30))

    last_clinical_event = Column(String(100))

    last_prediction_time = Column(DateTime)

    # ==========================================================
    # Notes
    # ==========================================================

    notes = Column(Text)