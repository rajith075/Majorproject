from sqlalchemy.orm import Session

from app.models.vital_log import VitalLog
from app.models.patient import Patient


class VitalLogService:

    @staticmethod
    def create_vital_log(
        db: Session,
        patient: Patient,
        data,
    ):

        vital = VitalLog(

            patient_id=patient.id,

            heart_rate=data.heart_rate,
            systolic_bp=data.systolic_bp,
            diastolic_bp=data.diastolic_bp,
            spo2=data.spo2,
            temperature=data.temperature,
            respiratory_rate=data.respiratory_rate,

            sleep_hours=data.sleep_hours,
            activity_steps=data.activity_steps,

        )

        db.add(vital)

        # =====================================
        # Update Patient Latest Snapshot
        # =====================================

        patient.last_heart_rate = data.heart_rate
        patient.last_systolic_bp = data.systolic_bp
        patient.last_diastolic_bp = data.diastolic_bp
        patient.last_spo2 = data.spo2
        patient.last_temperature = data.temperature
        patient.last_respiratory_rate = data.respiratory_rate

        db.commit()

        db.refresh(vital)

        return vital

    @staticmethod
    def get_latest_vitals(
        db: Session,
        patient_id: int,
    ):

        return (

            db.query(VitalLog)

            .filter(
                VitalLog.patient_id == patient_id
            )

            .order_by(
                VitalLog.created_at.desc()
            )

            .first()

        )


vital_log_service = VitalLogService()