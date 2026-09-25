from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.medication import Medication
from app.models.patient import Patient
from app.models.user import User
from app.schemas.medication import (
    MedicationCreate,
    MedicationResponse,
    MedicationStatusResponse,
)
from app.services.medication import MedicationService
from app.models.doctor_patient import DoctorPatient
from app.models.caregiver_patient import CaregiverPatient


router = APIRouter(
    prefix="/medications",
    tags=["Medications"],
)


# ==========================================================
# Get My Medications
# Family → their patient
# ==========================================================

@router.get(
    "/me",
    response_model=list[MedicationStatusResponse],
)
def get_my_medications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only family members can access this endpoint
    if current_user.role != "family":
        raise HTTPException(
            status_code=403,
            detail="Only family members can access this endpoint.",
        )

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
            detail="Patient not found.",
        )

    return MedicationService.get_medications_with_status(
        db=db,
        patient_id=patient.id,
    )


# ==========================================================
# Get Assigned Patient Medications
# Caregiver → assigned patient
# ==========================================================

@router.get(
    "/caregiver",
    response_model=list[MedicationStatusResponse],
)
def get_caregiver_medications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only caregivers can access this endpoint
    if current_user.role != "caregiver":
        raise HTTPException(
            status_code=403,
            detail="Only caregivers can access this endpoint.",
        )

    patient = (
        db.query(Patient)
        .join(CaregiverPatient, CaregiverPatient.patient_id == Patient.id)
        .filter(
            CaregiverPatient.caregiver_id == current_user.id,
            CaregiverPatient.status == "active",
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="No patient assigned to this caregiver.",
        )

    return MedicationService.get_medications_with_status(
        db=db,
        patient_id=patient.id,
    )


# ==========================================================
# Mark Medication As Given
# Caregiver → assigned patient only
# ==========================================================

@router.post(
    "/{medication_id}/given",
)
def mark_medication_as_given(
    medication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ------------------------------------------------------
    # Only caregivers can mark medication as given
    # ------------------------------------------------------

    if current_user.role != "caregiver":
        raise HTTPException(
            status_code=403,
            detail="Only caregivers can mark medication as given.",
        )

    # ------------------------------------------------------
    # Find active medication
    # ------------------------------------------------------

    medication = (
        db.query(Medication)
        .filter(
            Medication.id == medication_id,
            Medication.active == True,
        )
        .first()
    )

    if not medication:
        raise HTTPException(
            status_code=404,
            detail="Active medication not found.",
        )

    # ------------------------------------------------------
    # Verify that this medication belongs to the
    # patient assigned to the logged-in caregiver
    # ------------------------------------------------------

    patient = (
        db.query(Patient)
        .filter(
            Patient.id == medication.patient_id
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    caregiver_link = (
        db.query(CaregiverPatient)
        .filter(
            CaregiverPatient.patient_id == patient.id,
            CaregiverPatient.caregiver_id == current_user.id,
            CaregiverPatient.status == "active",
        )
        .first()
    )

    if not caregiver_link:
        raise HTTPException(
            status_code=403,
            detail="You are not assigned to this patient.",
        )

    # ------------------------------------------------------
    # Create medication log
    # ------------------------------------------------------

    log = MedicationService.mark_as_given(
        db=db,
        medication_id=medication.id,
        taken_by=current_user.full_name,
    )

    if not log:
        raise HTTPException(
            status_code=404,
            detail="Unable to mark medication as given.",
        )

    return {
        "message": "Medication marked as given.",
        "medication_id": medication.id,
        "medicine_name": medication.medicine_name,
        "status": "taken",
        "given_by": log.taken_by,
        "given_at": log.taken_at,
    }


# ==========================================================
# Create Medication
# Doctor
# ==========================================================

@router.post(
    "/patient/{patient_id}",
    response_model=MedicationResponse,
)
def create_medication(
    patient_id: int,
    request: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Only doctors can create medications.",
        )

    patient = (
        db.query(Patient)
        .filter(
            Patient.id == patient_id
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    return MedicationService.create_medication(
        db=db,
        patient_id=patient_id,
        medicine_name=request.medicine_name,
        dosage=request.dosage,
        reminder_time=request.reminder_time,
        before_food=request.before_food,
        morning=request.morning,
        afternoon=request.afternoon,
        evening=request.evening,
        night=request.night,
    )


# ==========================================================
# Get Patient Medication History
# Doctor → linked patient only
# Includes current + previous medications
# ==========================================================

@router.get(
    "/doctor/patient/{patient_id}",
    response_model=list[MedicationResponse],
)
def get_doctor_patient_medications(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ------------------------------------------------------
    # Only doctors can access medication history
    # ------------------------------------------------------

    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Only doctors can access patient medication history.",
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
    # Return ALL medications
    #
    # active=True  → Current medication
    # active=False → Previous medication
    #
    # Previous medication records are intentionally preserved.
    # ------------------------------------------------------

    medications = (
        db.query(Medication)
        .filter(
            Medication.patient_id == patient_id,
        )
        .order_by(
            Medication.active.desc(),
            Medication.id.desc(),
        )
        .all()
    )

    return medications
