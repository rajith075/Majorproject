import os
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.patient import Patient
from app.models.user import User
from app.models.vital_log import VitalLog
from app.models.emergency_alert import EmergencyAlert
from app.models.caregiver_patient import CaregiverPatient
from app.models.device_token import DeviceToken

from app.services.notification_service import notification_service


class EmergencyNotificationService:

    @staticmethod
    def _is_duplicate_alert_within_cooldown(
        db: Session,
        patient_id: int,
        event_type: str,
        cooldown_seconds: int | None = None,
    ) -> bool:
        """Avoid repeatedly notifying a care team about the same alert.

        Sensor readings can arrive every few seconds.  A persistent condition
        must remain visible in the dashboard, but it must not produce a push
        notification for every reading.
        """
        if cooldown_seconds is None:
            cooldown_seconds = max(
                0,
                int(os.getenv("EMERGENCY_ALERT_COOLDOWN_SECONDS", "900")),
            )
        if cooldown_seconds == 0:
            return False

        cutoff = datetime.now(timezone.utc) - timedelta(
            seconds=cooldown_seconds
        )
        recent_duplicate = (
            db.query(EmergencyAlert.id)
            .filter(
                EmergencyAlert.patient_id == patient_id,
                EmergencyAlert.event_type == event_type,
                EmergencyAlert.detected_at >= cutoff,
            )
            .first()
        )
        return recent_duplicate is not None

    @staticmethod
    def process_alerts(
        db: Session,
        patient: Patient,
        vital: VitalLog,
        alerts,
        cooldown_seconds: int | None = 0,
    ):

        # =====================================================
        # NO ALERTS
        # =====================================================

        if not alerts:

            print(
                "[EMERGENCY] No emergency alerts generated."
            )

            return

        # =====================================================
        # FIND FAMILY MEMBER
        # =====================================================

        family_member = db.query(User).filter(
            User.id == patient.user_id
        ).first()

        # =====================================================
        # FIND ACTIVE CAREGIVERS
        # =====================================================

        caregivers = (
            db.query(User)
            .join(
                CaregiverPatient,
                CaregiverPatient.caregiver_id == User.id,
            )
            .filter(
                CaregiverPatient.patient_id == patient.id,
                CaregiverPatient.status == "active",
            )
            .all()
        )

        # =====================================================
        # SELECT HIGHEST SEVERITY
        # =====================================================

        severity_priority = {
            "Critical": 4,
            "High": 3,
            "Moderate": 2,
            "Clinical": 1,
        }

        emergency_alert = max(
            alerts,
            key=lambda alert:
                severity_priority.get(
                    str(
                        alert.get(
                            "severity",
                            ""
                        )
                    ).strip(),
                    0
                )
        )

        severity = str(
            emergency_alert.get(
                "severity",
                ""
            )
        ).strip()

        title = emergency_alert.get(
            "title",
            "Health Alert"
        )

        message = emergency_alert.get(
            "message",
            "An abnormal health condition was detected."
        )

        # =====================================================
        # DETERMINE EMERGENCY STATUS
        # =====================================================

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

        # Manual/backend alerts must be delivered immediately. Sensor vitals
        # never call this path, and the Arduino bridge debounces fall signals
        # before submitting them, so a global alert cooldown is unnecessary.
        if EmergencyNotificationService._is_duplicate_alert_within_cooldown(
            db=db,
            patient_id=patient.id,
            event_type=title,
            cooldown_seconds=cooldown_seconds,
        ):
            print(
                "[EMERGENCY] Duplicate alert notification suppressed: "
                f"{title} (cooldown active)."
            )
            return

        # =====================================================
        # CREATE EMERGENCY RECORD
        # =====================================================

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

        db.add(
            emergency_alert_record
        )

        db.commit()

        db.refresh(
            emergency_alert_record
        )

        # =====================================================
        # PUSH NOTIFICATION
        # =====================================================

        push_success = False

        recipient_user_ids = [
            user.id
            for user in [family_member, *caregivers]
            if user is not None
        ]
        registered_tokens = (
            db.query(DeviceToken.token)
            .filter(DeviceToken.user_id.in_(recipient_user_ids))
            .all()
            if recipient_user_ids
            else []
        )
        tokens = {token for (token,) in registered_tokens}

        # Keep the explicit test token as a development fallback only.
        fcm_test_token = os.getenv("FCM_TEST_TOKEN")
        if fcm_test_token:
            tokens.add(fcm_test_token.strip())

        push_title = f"ElderCare {emergency_status}"
        push_message = f"Patient {patient.id}: {title}. {message}"
        push_data = {
            "type": "emergency",
            "patient_id": patient.id,
            "emergency_id": emergency_alert_record.id,
            "severity": severity,
            "event": str(title),
        }
        for token in tokens:
            push_success = (
                notification_service.send_push_notification(
                    token=token,
                    title=push_title,
                    message=push_message,
                    data=push_data,
                    urgent=True,
                )
                or push_success
            )

        if not tokens:
            print("[FCM] No device token is registered for this care team.")

        # =====================================================
        # CRITICAL → TWILIO CALL
        # =====================================================

        call_success = False

        if emergency_status == "CRITICAL":

            notification_message = (
                f"ElderCare {emergency_status} Alert. "
                f"Patient ID {patient.id}. "
                f"{title}. "
                f"{message}"
            )

            notification_recipients = set()

            test_phone = os.getenv(
                "TEST_NOTIFICATION_PHONE"
            )

            if test_phone:

                test_phone = (
                    test_phone.strip()
                )

                print(
                    "[EMERGENCY] "
                    "TEST NOTIFICATION PHONE ENABLED: "
                    f"{test_phone}"
                )

                notification_recipients.add(
                    test_phone
                )

            else:

                if (
                    family_member
                    and family_member.phone
                ):

                    notification_recipients.add(
                        str(
                            family_member.phone
                        ).strip()
                    )

                for caregiver in caregivers:
                    if caregiver.phone:
                        notification_recipients.add(
                            str(caregiver.phone).strip()
                        )

            # =============================================
            # TWILIO CALL
            # =============================================

            for phone in notification_recipients:

                success = (
                    notification_service.make_call(
                        phone,
                        notification_message
                    )
                )

                if success:

                    call_success = True

        # =====================================================
        # UPDATE EMERGENCY RECORD
        # =====================================================

        notification_status = (
            f" | PUSH="
            f"{'SENT' if push_success else 'FAILED'}"
            f" | CALL="
            f"{'SENT' if call_success else 'NOT_SENT'}"
        )

        emergency_alert_record.notes = (
            f"{message}"
            f"{notification_status}"
        )

        db.commit()

        # =====================================================
        # LOG
        # =====================================================

        print("=" * 70)
        print(
            "EMERGENCY NOTIFICATION PROCESSED"
        )
        print("=" * 70)

        print(
            f"Patient       : {patient.id}"
        )

        print(
            f"Emergency ID  : "
            f"{emergency_alert_record.id}"
        )

        print(
            f"Event Type    : {title}"
        )

        print(
            f"Status        : {emergency_status}"
        )

        print(
            f"Vital Log     : {vital.id}"
        )

        print(
            f"FCM Push      : {push_success}"
        )

        print(
            f"Twilio Call   : {call_success}"
        )

        print("=" * 70)

    @staticmethod
    def process_fall_alert(patient_id: int, vital_id: int) -> None:
        """Create the one emergency path used by an Arduino fall event."""
        db = SessionLocal()
        try:
            patient = db.get(Patient, patient_id)
            vital = db.get(VitalLog, vital_id)
            if not patient or not vital:
                print(
                    "[FALL ALERT] Missing patient or vital: "
                    f"{patient_id}/{vital_id}"
                )
                return

            EmergencyNotificationService.process_alerts(
                db=db,
                patient=patient,
                vital=vital,
                alerts=[
                    {
                        "severity": "Critical",
                        "title": "Fall Detected",
                        "message": (
                            "The Arduino fall sensor detected a fall. "
                            "Please check on the patient immediately."
                        ),
                    }
                ],
                # The bridge reports only when the sensor changes from clear
                # to detected, so each distinct fall must be delivered.
                cooldown_seconds=0,
            )
        except Exception as error:
            db.rollback()
            print(f"[FALL ALERT] Notification processing failed: {error}")
        finally:
            db.close()


emergency_notification_service = (
    EmergencyNotificationService()
)
