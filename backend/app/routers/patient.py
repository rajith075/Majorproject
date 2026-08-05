from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db

from app.models.user import User

from app.schemas.patient import (
    PatientCreate,
    PatientResponse,
)

from app.services.patient_service import PatientService

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
            detail="Patient profile already exists."
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
            detail="Patient not found."
        )

    return patient