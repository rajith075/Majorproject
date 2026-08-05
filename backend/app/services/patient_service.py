from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.models.user import User
from app.schemas.patient import PatientCreate


class PatientService:

    @staticmethod
    def create_patient(
        db: Session,
        request: PatientCreate,
        current_user: User,
    ):

        patient = Patient(
            user_id=current_user.id,
            **request.model_dump(),
        )

        db.add(patient)
        db.commit()
        db.refresh(patient)

        return patient

    @staticmethod
    def get_patient_by_user(
        db: Session,
        current_user: User,
    ):

        return (
            db.query(Patient)
            .filter(Patient.user_id == current_user.id)
            .first()
        )