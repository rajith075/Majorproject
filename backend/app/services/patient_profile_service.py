from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.models.patient_condition import PatientCondition
from app.models.medication import Medication
from app.models.vital_log import VitalLog


class PatientProfileService:
    """
    Loads everything required for AI prediction.
    """

    @staticmethod
    def get_complete_profile(
        db: Session,
        patient_id: int,
    ):

        patient = (
            db.query(Patient)
            .filter(Patient.id == patient_id)
            .first()
        )

        if patient is None:
            return None

        conditions = (
            db.query(PatientCondition)
            .filter(
                PatientCondition.patient_id == patient_id
            )
            .all()
        )

        medications = (
            db.query(Medication)
            .filter(
                Medication.patient_id == patient_id
            )
            .all()
        )

        latest_vitals = (
            db.query(VitalLog)
            .filter(
                VitalLog.patient_id == patient_id
            )
            .order_by(VitalLog.created_at.desc())
            .first()
        )

        return {

            "patient": patient,

            "conditions": conditions,

            "medications": medications,

            "latest_vitals": latest_vitals

        }


patient_profile_service = PatientProfileService()