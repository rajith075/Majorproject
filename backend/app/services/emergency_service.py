from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.emergency_alert import EmergencyAlert


class EmergencyService:

    # ==========================================================
    # CREATE ALERT
    # ==========================================================

    @staticmethod
    def create_alert(
        db: Session,
        patient_id: int,
        event_type: str,
        latitude=None,
        longitude=None,
    ):

        alert = EmergencyAlert(

            patient_id=patient_id,

            event_type=event_type,

            status="ACTIVE",

            latitude=latitude,

            longitude=longitude,

            patient_confirmation=None,

            caregiver_confirmation=None,

            resolution=None,

            resolved_at=None,

            notes=None,
        )

        db.add(alert)

        db.commit()

        db.refresh(alert)

        return alert

    # ==========================================================
    # GET SINGLE ALERT
    # ==========================================================

    @staticmethod
    def get_alert(
        db: Session,
        alert_id: int,
    ):

        return (
            db.query(EmergencyAlert)
            .filter(
                EmergencyAlert.id == alert_id,
            )
            .first()
        )

    # ==========================================================
    # GET PATIENT ALERT HISTORY
    # ==========================================================

    @staticmethod
    def get_patient_alerts(
        db: Session,
        patient_id: int,
    ):

        return (
            db.query(EmergencyAlert)
            .filter(
                EmergencyAlert.patient_id == patient_id,
            )
            .order_by(
                EmergencyAlert.detected_at.desc()
            )
            .all()
        )

    # ==========================================================
    # PATIENT CONFIRMATION
    # ==========================================================

    @staticmethod
    def confirm_by_patient(
        db: Session,
        alert_id: int,
        is_safe: bool,
    ):

        alert = (
            db.query(EmergencyAlert)
            .filter(
                EmergencyAlert.id == alert_id,
            )
            .first()
        )

        if not alert:
            return None

        alert.patient_confirmation = is_safe

        if is_safe:

            alert.status = "RESOLVED"

            alert.resolution = (
                "Patient confirmed safe."
            )

            alert.resolved_at = datetime.now(
                timezone.utc
            )

        db.commit()

        db.refresh(alert)

        return alert

    # ==========================================================
    # CAREGIVER CONFIRMATION
    # ==========================================================

    @staticmethod
    def confirm_by_caregiver(
        db: Session,
        alert_id: int,
        is_safe: bool,
    ):

        alert = (
            db.query(EmergencyAlert)
            .filter(
                EmergencyAlert.id == alert_id,
            )
            .first()
        )

        if not alert:
            return None

        alert.caregiver_confirmation = is_safe

        if is_safe:

            alert.status = "RESOLVED"

            alert.resolution = (
                "Caregiver confirmed safe."
            )

            alert.resolved_at = datetime.now(
                timezone.utc
            )

        db.commit()

        db.refresh(alert)

        return alert


emergency_service = EmergencyService()