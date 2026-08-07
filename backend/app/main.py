from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine

from app.routers.auth import router as auth_router
from app.routers.patient import router as patient_router
from app.routers.condition import router as condition_router

from app.models.patient import Patient
from app.models.condition import Condition
from app.models.patient_condition import PatientCondition
from app.models.medication import Medication
from app.models.emergency_contact import EmergencyContact

app = FastAPI(
    title="Elderly Care AI API",
)

# CORS
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

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(condition_router)



@app.get("/")
def root():
    return {
        "message": "Elderly Care AI Backend Running 🚀"
    }