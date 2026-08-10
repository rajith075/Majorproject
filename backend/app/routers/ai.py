from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import get_current_user

from app.models.user import User
from app.models.patient import Patient

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
# AI Prediction
# ======================================================

@router.post("/predict/{patient_id}")
def predict_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # ==================================================
    # Verify Patient
    # ==================================================

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
    # Verify Patient
    # ==================================================

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

    # ==================================================
    # Get Latest Prediction
    # ==================================================

    prediction = (
        prediction_history_service.get_latest_prediction(
            db,
            patient_id,
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
    # Verify Patient
    # ==================================================

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

    # ==================================================
    # Get Prediction History
    # ==================================================

    history = (
        prediction_history_service.get_prediction_history(
            db,
            patient_id,
        )
    )

    return {
        "history": history,
    }