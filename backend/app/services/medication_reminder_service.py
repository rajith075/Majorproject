from datetime import datetime, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.caregiver_patient import CaregiverPatient
from app.models.device_token import DeviceToken
from app.models.medication import Medication
from app.models.medication_log import MedicationLog
from app.models.medication_reminder import MedicationReminder
from app.models.patient import Patient
from app.models.user import User
from app.services.notification_service import notification_service


class MedicationReminderService:
    @staticmethod
    def _timezone() -> ZoneInfo:
        try:
            return ZoneInfo(settings.MEDICATION_REMINDER_TIMEZONE)
        except ZoneInfoNotFoundError:
            return ZoneInfo("UTC")

    @classmethod
    def dispatch_due_reminders(cls, db: Session, now: datetime | None = None) -> int:
        """Send each due medication reminder at most once for the local day."""
        local_now = (now or datetime.now(timezone.utc)).astimezone(cls._timezone())
        today = local_now.date()
        due_medications = (
            db.query(Medication, Patient)
            .join(Patient, Medication.patient_id == Patient.id)
            .filter(
                Medication.active.is_(True),
                Medication.reminder_time.is_not(None),
                Medication.reminder_time <= local_now.time().replace(tzinfo=None),
            )
            .all()
        )
        dispatched = 0

        for medication, patient in due_medications:
            if cls._was_taken_today(db, medication.id, today):
                continue

            existing = (
                db.query(MedicationReminder)
                .filter(
                    MedicationReminder.medication_id == medication.id,
                    MedicationReminder.scheduled_date == today,
                )
                .first()
            )
            if existing and existing.status == "sent":
                continue

            if existing:
                reminder = existing
            else:
                reminder = MedicationReminder(
                    medication_id=medication.id,
                    patient_id=patient.id,
                    scheduled_date=today,
                    status="pending",
                )
                db.add(reminder)
                db.flush()

            sent = cls._send_to_care_team(db, patient, medication, reminder)
            reminder.status = "sent" if sent else "failed"
            db.commit()
            dispatched += 1

        return dispatched

    @classmethod
    def _was_taken_today(cls, db: Session, medication_id: int, today) -> bool:
        log = (
            db.query(MedicationLog)
            .filter(MedicationLog.medication_id == medication_id, MedicationLog.taken.is_(True))
            .order_by(MedicationLog.taken_at.desc(), MedicationLog.id.desc())
            .first()
        )
        if not log or not log.taken_at:
            return False
        taken_at = log.taken_at
        if taken_at.tzinfo is None:
            taken_at = taken_at.replace(tzinfo=timezone.utc)
        return taken_at.astimezone(cls._timezone()).date() == today

    @staticmethod
    def _send_to_care_team(
        db: Session,
        patient: Patient,
        medication: Medication,
        reminder: MedicationReminder,
    ) -> bool:
        family = db.get(User, patient.user_id)
        caregivers = (
            db.query(User)
            .join(CaregiverPatient, CaregiverPatient.caregiver_id == User.id)
            .filter(
                CaregiverPatient.patient_id == patient.id,
                CaregiverPatient.status == "active",
            )
            .all()
        )
        user_ids = [user.id for user in [family, *caregivers] if user]
        tokens = {
            token
            for (token,) in db.query(DeviceToken.token)
            .filter(DeviceToken.user_id.in_(user_ids))
            .all()
        } if user_ids else set()

        title = "Medication reminder"
        dosage = f" ({medication.dosage})" if medication.dosage else ""
        food_note = " Take before food." if medication.before_food else ""
        body = f"{patient.full_name}: {medication.medicine_name}{dosage} is due now.{food_note}"
        payload = {
            "type": "medication_reminder",
            "patient_id": patient.id,
            "medication_id": medication.id,
            "reminder_id": reminder.id,
            "medicine_name": medication.medicine_name,
            "title": title,
            "body": body,
        }
        sent = False
        for token in tokens:
            sent = notification_service.send_push_notification(
                token=token,
                title=title,
                message=body,
                data=payload,
                urgent=False,
            ) or sent
        return sent


medication_reminder_service = MedicationReminderService()
