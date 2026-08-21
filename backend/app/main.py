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
from app.routers.emergency import router as emergency_router

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
from app.models.emergency_alert import EmergencyAlert

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

# ==========================================================
# API Routers
# ==========================================================

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(condition_router)
app.include_router(vital_log_router)
app.include_router(ai_router)
app.include_router(emergency_router)

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