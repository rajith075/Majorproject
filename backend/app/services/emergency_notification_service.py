from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.models.user import User
from app.models.vital_log import VitalLog
from app.models.emergency_alert import EmergencyAlert

from app.services.notification_service import notification_service


class EmergencyNotificationService:

    @staticmethod
    def process_alerts(
        db: Session,
        patient: Patient,
        vital: VitalLog,
        alerts,
    ):

        if not alerts:
            print("[EMERGENCY] No emergency alerts generated.")
            return

        # ---------------------------------------------------------
        # Find family member
        # ---------------------------------------------------------

        family_member = (
            db.query(User)
            .filter(User.id == patient.user_id)
            .first()
        )

        # ---------------------------------------------------------
        # Find caregiver
        # ---------------------------------------------------------

        caregiver = None

        if patient.caregiver_id:
            caregiver = (
                db.query(User)
                .filter(User.id == patient.caregiver_id)
                .first()
            )

        # ---------------------------------------------------------
        # CONSOLIDATE ALERTS
        #
        # Critical > High > Moderate > Clinical
        #
        # Only ONE emergency notification is created.
        # ---------------------------------------------------------

        severity_priority = {
            "Critical": 4,
            "High": 3,
            "Moderate": 2,
            "Clinical": 1,
        }

        emergency_alert = max(
            alerts,
            key=lambda alert: severity_priority.get(
                str(alert.get("severity", "")).strip(),
                0,
            ),
        )

        severity = str(
            emergency_alert.get("severity", "")
        ).strip()

        title = emergency_alert.get(
            "title",
            "Health Alert",
        )

        message = emergency_alert.get(
            "message",
            "An abnormal health condition was detected.",
        )

        # ---------------------------------------------------------
        # Only High and Critical become emergency notifications.
        # ---------------------------------------------------------

        if severity == "Critical":
            emergency_status = "CRITICAL"

        elif severity == "High":
            emergency_status = "WARNING"

        else:
            print(
                f"[EMERGENCY] Alert ignored: "
                f"{severity} - {title}"
            )
            return

        # ---------------------------------------------------------
        # Create ONE emergency database record
        # ---------------------------------------------------------

        emergency_alert_record = EmergencyAlert(
            patient_id=patient.id,
            event_type=title,
            status=emergency_status,
            latitude=None,
            longitude=None,
            patient_confirmation=None,
            caregiver_confirmation=None,
            resolution=None,
            resolved_at=None,
            notes=message,
            vital_log_id=vital.id,
        )

        db.add(emergency_alert_record)
        db.commit()
        db.refresh(emergency_alert_record)

        # ---------------------------------------------------------
        # Notification message
        # ---------------------------------------------------------

        notification_message = (
            f"ElderlyCare {emergency_status} Alert. "
            f"Patient ID {patient.id}. "
            f"{title}. "
            f"{message}"
        )

        sms_success = False
        call_success = False

        # ---------------------------------------------------------
        # SMS → Family
        # ---------------------------------------------------------

        if family_member and family_member.phone:

            success = notification_service.send_sms(
                family_member.phone,
                notification_message,
            )

            if success:
                sms_success = True

        # ---------------------------------------------------------
        # SMS → Caregiver
        # ---------------------------------------------------------

        if caregiver and caregiver.phone:

            success = notification_service.send_sms(
                caregiver.phone,
                notification_message,
            )

            if success:
                sms_success = True

        # ---------------------------------------------------------
        # CRITICAL → CALL
        # ---------------------------------------------------------

        if emergency_status == "CRITICAL":

            # Family call
            if family_member and family_member.phone:

                success = notification_service.make_call(
                    family_member.phone,
                    notification_message,
                )

                if success:
                    call_success = True

            # Caregiver call
            if caregiver and caregiver.phone:

                success = notification_service.make_call(
                    caregiver.phone,
                    notification_message,
                )

                if success:
                    call_success = True

        # ---------------------------------------------------------
        # Store notification result in notes
        #
        # emergency_alerts table does not have sms_sent/call_sent
        # columns, so we keep the result in notes.
        # ---------------------------------------------------------

        notification_status = (
            f" | SMS={'SENT' if sms_success else 'FAILED'}"
            f" | CALL={'SENT' if call_success else 'NOT_SENT'}"
        )

        emergency_alert_record.notes = (
            f"{message}{notification_status}"
        )

        db.commit()

        # ---------------------------------------------------------
        # Console output
        # ---------------------------------------------------------

        print("=" * 70)
        print("EMERGENCY NOTIFICATION PROCESSED")
        print("=" * 70)
        print(f"Patient       : {patient.id}")
        print(f"Emergency ID  : {emergency_alert_record.id}")
        print(f"Event Type    : {title}")
        print(f"Status        : {emergency_status}")
        print(f"Vital Log     : {vital.id}")
        print(f"SMS Sent      : {sms_success}")
        print(f"Call Sent     : {call_success}")
        print("=" * 70)


emergency_notification_service = EmergencyNotificationService()