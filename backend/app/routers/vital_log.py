from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import get_current_user

from app.models.user import User
from app.models.patient import Patient
from app.models.doctor_patient import DoctorPatient
from app.models.caregiver_patient import CaregiverPatient

from app.schemas.vital_log import (
    VitalLogCreate,
    VitalLogResponse,
)

from app.services.vital_log_service import (
    vital_log_service,
)


router = APIRouter(
    prefix="/vitals",
    tags=["Vital Logs"],
)


# ==========================================================
# FAMILY MEMBER
# Get latest vitals for the patient belonging to current user
# ==========================================================

@router.get(
    "/me",
    response_model=VitalLogResponse | None,
)
def get_my_latest_vitals(
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    response.headers["Cache-Control"] = "no-store"

    if current_user.role != "family":
        raise HTTPException(
            status_code=403,
            detail="Family member access required.",
        )

    patient = (
        db.query(Patient)
        .filter(
            Patient.user_id == current_user.id,
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    return vital_log_service.get_latest_vitals(
        db=db,
        patient_id=patient.id,
    )


# ==========================================================
# Doctor → Patient Vital History
# Uses Doctor ↔ Patient relationship
# ==========================================================

# ==========================================================
# CAREGIVER
# Get the latest shared vital record for a patient assigned to
# the logged-in caregiver.
# ==========================================================

@router.get(
    "/caregiver/patient/{patient_id}/latest",
    response_model=VitalLogResponse | None,
)
def get_caregiver_latest_vitals(
    patient_id: int,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    response.headers["Cache-Control"] = "no-store"
    if current_user.role != "caregiver":
        raise HTTPException(
            status_code=403,
            detail="Caregiver access required.",
        )

    patient = (
        db.query(Patient)
        .join(CaregiverPatient, CaregiverPatient.patient_id == Patient.id)
        .filter(
            Patient.id == patient_id,
            CaregiverPatient.caregiver_id == current_user.id,
            CaregiverPatient.status == "active",
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient is not assigned to this caregiver.",
        )

    return vital_log_service.get_latest_vitals(
        db=db,
        patient_id=patient.id,
    )


@router.get(
    "/doctor/patient/{patient_id}/history",
)
def get_doctor_vital_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ------------------------------------------------------
    # Only doctors can access this endpoint
    # ------------------------------------------------------

    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Doctor access required.",
        )

    # ------------------------------------------------------
    # Verify Doctor ↔ Patient relationship
    # ------------------------------------------------------

    doctor_patient = (
        db.query(DoctorPatient)
        .filter(
            DoctorPatient.doctor_id == current_user.id,
            DoctorPatient.patient_id == patient_id,
            DoctorPatient.status == "active",
        )
        .first()
    )

    if not doctor_patient:
        raise HTTPException(
            status_code=404,
            detail="Patient is not linked to this doctor.",
        )

    # ------------------------------------------------------
    # Verify patient exists
    # ------------------------------------------------------

    patient = (
        db.query(Patient)
        .filter(
            Patient.id == patient_id,
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    # ------------------------------------------------------
    # Get vital history
    # ------------------------------------------------------

    return vital_log_service.get_vital_history(
        db=db,
        patient_id=patient_id,
    )


# ==========================================================
# CREATE VITAL LOG
# ==========================================================

@router.post(
    "/{patient_id}",
    response_model=VitalLogResponse,
)
def create_vital_log(
    patient_id: int,
    request: VitalLogCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    patient = (
        db.query(Patient)
        .filter(
            Patient.id == patient_id,
            Patient.user_id == current_user.id,
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    vital, immediate_alerts = vital_log_service.create_vital_log(
        db,
        patient,
        request,
    )
    background_tasks.add_task(
        vital_log_service.process_saved_vital,
        patient.id,
        vital.id,
        immediate_alerts,
    )
    return vital
