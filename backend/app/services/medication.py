from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.medication import Medication
from app.models.medication_log import MedicationLog


class MedicationService:

    # ==========================================================
    # Get Active Medications
    # ==========================================================

    @staticmethod
    def get_active_medications(
        db: Session,
        patient_id: int,
    ):
        return (
            db.query(Medication)
            .filter(
                Medication.patient_id == patient_id,
                Medication.active == True,
            )
            .order_by(Medication.id.asc())
            .all()
        )

    # ==========================================================
    # Get Active Medications With Today's Status
    # ==========================================================

    @staticmethod
    def get_medications_with_status(
        db: Session,
        patient_id: int,
    ):
        medications = MedicationService.get_active_medications(
            db=db,
            patient_id=patient_id,
        )

        now = datetime.now(timezone.utc)
        today = now.date()

        results = []

        for medication in medications:

            latest_log = MedicationService.get_latest_log(
                db=db,
                medication_id=medication.id,
            )

            status = "upcoming"
            given_by = None
            given_at = None

            # --------------------------------------------------
            # Check whether medication was given today
            # --------------------------------------------------

            if (
                latest_log
                and latest_log.taken
                and latest_log.taken_at
                and latest_log.taken_at.date() == today
            ):
                status = "taken"
                given_by = latest_log.taken_by
                given_at = latest_log.taken_at

            # --------------------------------------------------
            # If not taken today, determine pending/upcoming
            # --------------------------------------------------

            elif medication.reminder_time:

                current_time = now.time().replace(tzinfo=None)

                if current_time >= medication.reminder_time:
                    status = "pending"
                else:
                    status = "upcoming"

            else:
                # No reminder time means we cannot determine
                # whether the scheduled time has passed.
                status = "pending"

            results.append(
                {
                    "id": medication.id,
                    "patient_id": medication.patient_id,
                    "medicine_name": medication.medicine_name,
                    "dosage": medication.dosage,
                    "reminder_time": medication.reminder_time,
                    "before_food": medication.before_food,
                    "morning": medication.morning,
                    "afternoon": medication.afternoon,
                    "evening": medication.evening,
                    "night": medication.night,
                    "active": medication.active,
                    "status": status,
                    "given_by": given_by,
                    "given_at": given_at,
                }
            )

        return results

    # ==========================================================
    # Create Medication
    # Used later by Doctor Dashboard
    # ==========================================================

    @staticmethod
    def create_medication(
        db: Session,
        patient_id: int,
        medicine_name: str,
        dosage: str | None = None,
        reminder_time=None,
        before_food: bool = False,
        morning: bool = False,
        afternoon: bool = False,
        evening: bool = False,
        night: bool = False,
    ):
        medication = Medication(
            patient_id=patient_id,
            medicine_name=medicine_name,
            dosage=dosage,
            reminder_time=reminder_time,
            before_food=before_food,
            morning=morning,
            afternoon=afternoon,
            evening=evening,
            night=night,
            active=True,
        )

        db.add(medication)
        db.commit()
        db.refresh(medication)

        return medication

    # ==========================================================
    # Replace Current Medication Plan
    # Used later by Doctor Dashboard
    # ==========================================================

    @staticmethod
    def replace_medications(
        db: Session,
        patient_id: int,
        medications: list,
    ):
        # Deactivate existing medications
        db.query(Medication).filter(
            Medication.patient_id == patient_id,
            Medication.active == True,
        ).update(
            {"active": False},
            synchronize_session=False,
        )

        # Create new official medications
        created_medications = []

        for medication_data in medications:
            medication = Medication(
                patient_id=patient_id,
                medicine_name=medication_data.medicine_name,
                dosage=medication_data.dosage,
                reminder_time=medication_data.reminder_time,
                before_food=medication_data.before_food,
                morning=medication_data.morning,
                afternoon=medication_data.afternoon,
                evening=medication_data.evening,
                night=medication_data.night,
                active=True,
            )

            db.add(medication)
            created_medications.append(medication)

        db.commit()

        for medication in created_medications:
            db.refresh(medication)

        return created_medications

    # ==========================================================
    # Mark Medication as Given
    # ==========================================================

    @staticmethod
    def mark_as_given(
        db: Session,
        medication_id: int,
        taken_by: str,
        notes: str | None = None,
    ):
        medication = (
            db.query(Medication)
            .filter(
                Medication.id == medication_id,
                Medication.active == True,
            )
            .first()
        )

        if not medication:
            return None

        log = MedicationLog(
            medication_id=medication.id,
            taken=True,
            taken_at=datetime.now(timezone.utc),
            taken_by=taken_by,
            notes=notes,
        )

        db.add(log)
        db.commit()
        db.refresh(log)

        return log

    # ==========================================================
    # Get Latest Medication Log
    # ==========================================================

    @staticmethod
    def get_latest_log(
        db: Session,
        medication_id: int,
    ):
        return (
            db.query(MedicationLog)
            .filter(
                MedicationLog.medication_id == medication_id,
            )
            .order_by(
                MedicationLog.created_at.desc(),
                MedicationLog.id.desc(),
            )
            .first()
        )