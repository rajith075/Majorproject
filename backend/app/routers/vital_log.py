from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import get_current_user

from app.models.user import User
from app.models.patient import Patient

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


@router.post(
    "/{patient_id}",
    response_model=VitalLogResponse,
)
def create_vital_log(
    patient_id: int,
    request: VitalLogCreate,
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

    return vital_log_service.create_vital_log(
        db,
        patient,
        request,
    )