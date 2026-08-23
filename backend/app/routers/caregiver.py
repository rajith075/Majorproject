from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.patient import Patient


router = APIRouter(
    prefix="/caregiver",
    tags=["Caregiver"],
)


# ==========================================================
# Get Available Virtual Caregivers
# ==========================================================

@router.get("/available")
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
# Assign Caregiver To Patient
# ==========================================================

@router.put("/assign/{caregiver_id}")
def assign_caregiver(
    caregiver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # ------------------------------------------
    # Only family user can assign caregiver
    # ------------------------------------------

    if current_user.role != "family":
        raise HTTPException(
            status_code=403,
            detail="Only family members can assign a caregiver.",
        )

    # ------------------------------------------
    # Find patient's profile
    # ------------------------------------------

    patient = (
        db.query(Patient)
        .filter(
            Patient.user_id == current_user.id
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient profile not found.",
        )

    # ------------------------------------------
    # Find caregiver
    # ------------------------------------------

    caregiver = (
        db.query(User)
        .filter(
            User.id == caregiver_id,
            User.role == "caregiver",
            User.is_active == True,
        )
        .first()
    )

    if not caregiver:
        raise HTTPException(
            status_code=404,
            detail="Caregiver not found.",
        )

    # ------------------------------------------
    # Assign caregiver
    # ------------------------------------------

    patient.caregiver_id = caregiver.id

    # Keep existing field synchronized
    patient.assigned_caregiver = caregiver.full_name

    db.commit()
    db.refresh(patient)

    return {
        "message": "Caregiver assigned successfully.",
        "caregiver": {
            "id": caregiver.id,
            "full_name": caregiver.full_name,
            "email": caregiver.email,
        },
        "patient_id": patient.id,
    }


# ==========================================================
# Get Patients Assigned To Logged-in Caregiver
# ==========================================================

@router.get("/patients")
def get_caregiver_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.role != "caregiver":
        raise HTTPException(
            status_code=403,
            detail="Only caregivers can access assigned patients.",
        )

    patients = (
        db.query(Patient)
        .filter(
            Patient.caregiver_id == current_user.id
        )
        .all()
    )

    return patients