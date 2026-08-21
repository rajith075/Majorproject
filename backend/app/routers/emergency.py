from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.schemas.emergency import (
    EmergencyAlertCreate,
    EmergencyAlertResponse,
)

from app.services.emergency_service import (
    emergency_service,
)


router = APIRouter(
    prefix="/emergency",
    tags=["Emergency"],
)


# ==========================================================
# Create Emergency Alert
# ==========================================================

@router.post(
    "/alerts",
    response_model=EmergencyAlertResponse,
)
def create_emergency_alert(
    data: EmergencyAlertCreate,
    db: Session = Depends(get_db),
):

    alert = emergency_service.create_alert(
        db=db,
        patient_id=data.patient_id,
        event_type=data.event_type,
        latitude=data.latitude,
        longitude=data.longitude,
    )

    return alert


# ==========================================================
# Get Single Emergency Alert
# ==========================================================

@router.get(
    "/alerts/{alert_id}",
    response_model=EmergencyAlertResponse,
)
def get_emergency_alert(
    alert_id: int,
    db: Session = Depends(get_db),
):

    alert = emergency_service.get_alert(
        db=db,
        alert_id=alert_id,
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Emergency alert not found",
        )

    return alert


# ==========================================================
# Get Patient Emergency History
# ==========================================================

@router.get(
    "/patients/{patient_id}/alerts",
    response_model=list[EmergencyAlertResponse],
)
def get_patient_emergency_alerts(
    patient_id: int,
    db: Session = Depends(get_db),
):

    return emergency_service.get_patient_alerts(
        db=db,
        patient_id=patient_id,
    )


# ==========================================================
# Patient Confirmation
# ==========================================================

@router.patch(
    "/alerts/{alert_id}/patient-confirm",
    response_model=EmergencyAlertResponse,
)
def patient_confirm_emergency(
    alert_id: int,
    is_safe: bool,
    db: Session = Depends(get_db),
):

    alert = emergency_service.confirm_by_patient(
        db=db,
        alert_id=alert_id,
        is_safe=is_safe,
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Emergency alert not found",
        )

    return alert


# ==========================================================
# Caregiver Confirmation
# ==========================================================

@router.patch(
    "/alerts/{alert_id}/caregiver-confirm",
    response_model=EmergencyAlertResponse,
)
def caregiver_confirm_emergency(
    alert_id: int,
    is_safe: bool,
    db: Session = Depends(get_db),
):

    alert = emergency_service.confirm_by_caregiver(
        db=db,
        alert_id=alert_id,
        is_safe=is_safe,
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Emergency alert not found",
        )

    return alert