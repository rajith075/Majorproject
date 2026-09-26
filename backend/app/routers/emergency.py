from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import get_current_user

from app.models.caregiver_patient import CaregiverPatient
from app.models.emergency_alert import EmergencyAlert
from app.models.patient import Patient
from app.models.user import User

from app.schemas.emergency import (
    EmergencyAlertCreate,
    EmergencyLocationUpdate,
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
# Attach browser location to an emergency alert
# ==========================================================

@router.patch(
    "/alerts/{alert_id}/location",
    response_model=EmergencyAlertResponse,
)
def update_emergency_location(
    alert_id: int,
    data: EmergencyLocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save the current family/caregiver browser location for an alert."""
    alert = db.get(EmergencyAlert, alert_id)
    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Emergency alert not found",
        )

    patient = db.get(Patient, alert.patient_id)
    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    has_access = (
        current_user.role == "family"
        and patient.user_id == current_user.id
    )
    if current_user.role == "caregiver":
        has_access = (
            db.query(CaregiverPatient.id)
            .filter(
                CaregiverPatient.patient_id == patient.id,
                CaregiverPatient.caregiver_id == current_user.id,
                CaregiverPatient.status == "active",
            )
            .first()
            is not None
        )

    if not has_access:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this emergency alert.",
        )

    alert.latitude = data.latitude
    alert.longitude = data.longitude
    db.commit()
    db.refresh(alert)
    return alert


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
