from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import get_current_user

from app.models.user import User
from app.models.patient import Patient
from app.models.caregiver_patient import CaregiverPatient

from app.services.patient_profile_service import (
    patient_profile_service,
)

from app.services.prediction_history_service import (
    prediction_history_service,
)

from app.schemas.prediction_history import (
    PredictionHistoryResponse,
    PredictionHistoryListResponse,
)

from app.ai.prediction_service import (
    prediction_service,
)


router = APIRouter(
    prefix="/ai",
    tags=["Artificial Intelligence"],
)


# ======================================================
# Patient Authorization Helper
# ======================================================

def get_authorized_patient(
    db: Session,
    patient_id: int,
    current_user: User,
):
    """
    Return the patient only if the current user is authorized.

    Authorized users:
    1. Family member who registered/owns the patient
    2. Caregiver assigned to the patient
    """

    patient = db.query(Patient).filter(Patient.id == patient_id).first()

    caregiver_link = None
    if patient and current_user.role == "caregiver":
        caregiver_link = (
            db.query(CaregiverPatient)
            .filter(
                CaregiverPatient.patient_id == patient.id,
                CaregiverPatient.caregiver_id == current_user.id,
                CaregiverPatient.status == "active",
            )
            .first()
        )

    if not patient or (
        patient.user_id != current_user.id and not caregiver_link
    ):
        raise HTTPException(
            status_code=404,
            detail="Patient not found or access denied.",
        )

    return patient


# ======================================================
# AI Prediction
# ======================================================

@router.post("/predict/{patient_id}")
def predict_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # ==================================================
    # Verify Patient Authorization
    # ==================================================

    patient = get_authorized_patient(
        db=db,
        patient_id=patient_id,
        current_user=current_user,
    )

    # ==================================================
    # Build Complete Patient Profile
    # ==================================================

    profile = patient_profile_service.get_complete_profile(
        db=db,
        patient_id=patient.id,
    )

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Patient profile could not be built.",
        )

    # ==================================================
    # Run AI Prediction
    # ==================================================

    return prediction_service.predict(
        db=db,
        patient_profile=profile,
    )


# ======================================================
# Latest Prediction
# ======================================================

@router.get(
    "/latest/{patient_id}",
    response_model=PredictionHistoryResponse,
)
def get_latest_prediction(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # ==================================================
    # Verify Patient Authorization
    # ==================================================

    patient = get_authorized_patient(
        db=db,
        patient_id=patient_id,
        current_user=current_user,
    )

    # ==================================================
    # Get Latest Prediction
    # ==================================================

    prediction = (
        prediction_history_service.get_latest_prediction(
            db,
            patient.id,
        )
    )

    if prediction is None:
        raise HTTPException(
            status_code=404,
            detail="No prediction history found.",
        )

    return prediction


# ======================================================
# Complete Prediction History
# ======================================================

@router.get(
    "/history/{patient_id}",
    response_model=PredictionHistoryListResponse,
)
def get_prediction_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # ==================================================
    # Verify Patient Authorization
    # ==================================================

    patient = get_authorized_patient(
        db=db,
        patient_id=patient_id,
        current_user=current_user,
    )

    # ==================================================
    # Get Prediction History
    # ==================================================

    history = (
        prediction_history_service.get_prediction_history(
            db,
            patient.id,
        )
    )

    return {
        "history": history,
    }
