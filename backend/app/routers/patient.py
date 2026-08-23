from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db

from app.models.user import User
from app.models.patient import Patient

from app.schemas.patient import (
    PatientCreate,
    PatientResponse,
)

from app.services.patient import PatientService


router = APIRouter(
    prefix="/patient",
    tags=["Patient"],
)


# ==========================================================
# Create Patient
# ==========================================================

@router.post(
    "/create",
    response_model=PatientResponse,
)
def create_patient(
    request: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    patient = PatientService.create_patient(
        db=db,
        user_id=current_user.id,
        request=request,
    )

    if patient is None:
        raise HTTPException(
            status_code=400,
            detail="Patient profile already exists.",
        )

    return patient


# ==========================================================
# Get Logged-in Patient
# ==========================================================

@router.get(
    "/me",
    response_model=PatientResponse | None,
)
def get_my_patient(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return PatientService.get_patient(
        db=db,
        user_id=current_user.id,
    )


# ==========================================================
# Update Patient
# ==========================================================

@router.put(
    "/update",
    response_model=PatientResponse,
)
def update_patient(
    request: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    patient = PatientService.update_patient(
        db=db,
        user_id=current_user.id,
        request=request,
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    return patient


# ==========================================================
# Get Available Caregivers
# ==========================================================

@router.get("/caregivers")
def get_available_caregivers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    caregivers = (
        db.query(User)
        .filter(
            User.role == "caregiver",
            User.is_active == True,
        )
        .all()
    )

    return [
        {
            "id": caregiver.id,
            "full_name": caregiver.full_name,
            "email": caregiver.email,
            "phone": caregiver.phone,
        }
        for caregiver in caregivers
    ]


# ==========================================================
# Assign Caregiver
# ==========================================================

@router.post("/assign-caregiver")
def assign_caregiver(
    caregiver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # ------------------------------------------------------
    # Find patient's profile
    # ------------------------------------------------------

    patient = (
        db.query(Patient)
        .filter(
            Patient.user_id == current_user.id
        )
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient profile not found.",
        )

    # ------------------------------------------------------
    # Find caregiver
    # ------------------------------------------------------

    caregiver = (
        db.query(User)
        .filter(
            User.id == caregiver_id,
            User.role == "caregiver",
            User.is_active == True,
        )
        .first()
    )

    if caregiver is None:
        raise HTTPException(
            status_code=404,
            detail="Caregiver not found.",
        )

    # ------------------------------------------------------
    # Assign caregiver
    # ------------------------------------------------------

    patient.caregiver_id = caregiver.id
    patient.assigned_caregiver = caregiver.full_name

    db.commit()
    db.refresh(patient)

    return {
        "message": "Caregiver assigned successfully.",
        "patient_id": patient.id,
        "caregiver_id": caregiver.id,
        "caregiver_name": caregiver.full_name,
    }