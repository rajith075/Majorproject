import os

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
        alerts
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
        # FIND CAREGIVER
        # =====================================================

        caregiver = None

        if patient.caregiver_id:

            caregiver = db.query(User).filter(
                User.id == patient.caregiver_id
            ).first()

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

        fcm_test_token = os.getenv(
            "FCM_TEST_TOKEN"
        )

        if fcm_test_token:

            push_title = (
                f"ElderCare {emergency_status}"
            )

            push_message = (
                f"Patient {patient.id}: "
                f"{title}. "
                f"{message}"
            )

            push_success = (
                notification_service.send_push_notification(
                    token=fcm_test_token,
                    title=push_title,
                    message=push_message,
                    data={
                        "type": "emergency",
                        "patient_id": patient.id,
                        "emergency_id": (
                            emergency_alert_record.id
                        ),
                        "severity": severity,
                        "event": str(title),
                    },
                )
            )

        else:

            print(
                "[FCM] FCM_TEST_TOKEN is not configured."
            )

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

                if (
                    caregiver
                    and caregiver.phone
                ):

                    notification_recipients.add(
                        str(
                            caregiver.phone
                        ).strip()
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


emergency_notification_service = (
    EmergencyNotificationService()
)