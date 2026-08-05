from typing import Optional

from pydantic import BaseModel


# ==========================================================
# Create Patient
# ==========================================================

class PatientCreate(BaseModel):

    # ======================================================
    # Basic Information
    # ======================================================

    full_name: str
    age: int
    gender: str
    blood_group: str
    ethnicity: Optional[str] = None

    phone: str
    address: str

    # ======================================================
    # Physical Information
    # ======================================================

    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    bmi: Optional[float] = None

    # ======================================================
    # Lifestyle
    # ======================================================

    smoking: Optional[str] = None
    alcohol: Optional[str] = None
    exercise_level: Optional[str] = None
    diet_quality: Optional[str] = None
    water_intake_liters: Optional[float] = None
    medication_adherence: Optional[str] = None

    mobility: Optional[str] = None
    memory_status: Optional[str] = None

    # ======================================================
    # Baseline Vitals
    # ======================================================

    baseline_heart_rate: Optional[float] = None
    baseline_systolic_bp: Optional[float] = None
    baseline_diastolic_bp: Optional[float] = None
    baseline_spo2: Optional[float] = None
    baseline_temperature: Optional[float] = None
    baseline_respiratory_rate: Optional[float] = None

    # ======================================================
    # Medical Information
    # ======================================================

    medical_conditions: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None

    # ======================================================
    # Emergency Contact
    # ======================================================

    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    relationship: Optional[str] = None
    secondary_contact: Optional[str] = None

    # ======================================================
    # Care Team
    # ======================================================

    assigned_doctor: Optional[str] = None
    assigned_caregiver: Optional[str] = None
    hospital: Optional[str] = None
    doctor_phone: Optional[str] = None

    # ======================================================
    # Notes
    # ======================================================

    notes: Optional[str] = None


# ==========================================================
# Update Patient
# ==========================================================

class PatientUpdate(PatientCreate):
    pass


# ==========================================================
# Response Schema
# ==========================================================

class PatientResponse(PatientCreate):

    id: int

    # ======================================================
    # Latest Live Vitals
    # ======================================================

    last_heart_rate: Optional[float] = None
    last_systolic_bp: Optional[float] = None
    last_diastolic_bp: Optional[float] = None
    last_spo2: Optional[float] = None
    last_temperature: Optional[float] = None
    last_respiratory_rate: Optional[float] = None

    # ======================================================
    # AI Monitoring
    # ======================================================

    health_index: Optional[float] = None
    last_health_risk: Optional[str] = None
    last_clinical_event: Optional[str] = None
    last_prediction_time: Optional[str] = None

    class Config:
        from_attributes = True