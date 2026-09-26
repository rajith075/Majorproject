from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine

# ==========================================================
# Routers
# ==========================================================

from app.routers.auth import router as auth_router
from app.routers.patient import router as patient_router
from app.routers.condition import router as condition_router
from app.routers.vital_log import router as vital_log_router
from app.routers.ai import router as ai_router
from app.routers.caregiver import router as caregiver_router
from app.routers.medication import router as medication_router
from app.routers.doctor import router as doctor_router
from app.models.consultation import Consultation
from app.models.doctor_profile import DoctorProfile
from app.models.emergency_alert import EmergencyAlert
from app.routers.emergency import router as emergency_router
from app.routers.twilio_voice import router as twilio_voice_router
from app.routers.notification import router as notification_router
from app.services.medication_scheduler import (
    start_medication_scheduler,
    stop_medication_scheduler,
)


# ==========================================================
# Models
# (Import all models so SQLAlchemy creates tables)
# ==========================================================

from app.models.user import User
from app.models.patient import Patient
from app.models.condition import Condition
from app.models.patient_condition import PatientCondition
from app.models.medication import Medication
from app.models.medication_log import MedicationLog
from app.models.emergency_contact import EmergencyContact
from app.models.vital_log import VitalLog
from app.models.prediction_history import PredictionHistory
from app.models.doctor_verification import DoctorVerification
from app.models.doctor_patient import DoctorPatient
from app.models.caregiver_patient import CaregiverPatient
from app.models.caregiver_invitation import CaregiverInvitation
from app.models.device_token import DeviceToken
from app.models.medication_reminder import MedicationReminder
from app.models.device_connection import DeviceConnection
from app.routers.device import router as device_router

# ==========================================================
# FastAPI App
# ==========================================================

app = FastAPI(
    title="Elderly Care AI API",
    version="1.0.0",
)

# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# Database
# ==========================================================

Base.metadata.create_all(bind=engine)


@app.on_event("startup")
def start_background_jobs():
    start_medication_scheduler()


@app.on_event("shutdown")
def stop_background_jobs():
    stop_medication_scheduler()

# ==========================================================
# API Routers
# ==========================================================

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(condition_router)
app.include_router(vital_log_router)
app.include_router(ai_router)
app.include_router(caregiver_router)
app.include_router(medication_router)
app.include_router(doctor_router)
app.include_router(emergency_router)
app.include_router(twilio_voice_router)
app.include_router(notification_router)
app.include_router(device_router)
# ==========================================================
# Root Endpoint
# ==========================================================

@app.get("/")
def root():
    return {
        "message": "Elderly Care AI Backend Running 🚀",
        "version": "1.0.0",
        "status": "healthy",
    }
