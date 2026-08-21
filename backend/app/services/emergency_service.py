from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.emergency_alert import EmergencyAlert


class EmergencyService:

    # ======================================================
    # Create Emergency Alert
    # ======================================================

    def create_alert(
        self,
        db: Session,
        patient_id: int,
        event_type: str = "FALL",
        latitude: float | None = None,
        longitude: float | None = None,
    ):

        alert = EmergencyAlert(
            patient_id=patient_id,
            event_type=event_type,
            status="DETECTED",
            latitude=latitude,
            longitude=longitude,
        )

        db.add(alert)
        db.commit()
        db.refresh(alert)

        return alert

    # ======================================================
    # Get Single Alert
    # ======================================================

    def get_alert(
        self,
        db: Session,
        alert_id: int,
    ):

        return (
            db.query(EmergencyAlert)
            .filter(
                EmergencyAlert.id == alert_id
            )
            .first()
        )

    # ======================================================
    # Get Patient Alerts
    # ======================================================

    def get_patient_alerts(
        self,
        db: Session,
        patient_id: int,
    ):

        return (
            db.query(EmergencyAlert)
            .filter(
                EmergencyAlert.patient_id == patient_id
            )
            .order_by(
                EmergencyAlert.detected_at.desc()
            )
            .all()
        )

    # ======================================================
    # Patient Confirmation
    # ======================================================

    def confirm_by_patient(
        self,
        db: Session,
        alert_id: int,
        is_safe: bool,
    ):

        alert = self.get_alert(
            db,
            alert_id,
        )

        if not alert:
            return None

        alert.patient_confirmation = is_safe

        if is_safe:
            alert.status = "RESOLVED"
            alert.resolution = "PATIENT_SAFE"
            alert.resolved_at = datetime.now(timezone.utc)

        else:
            alert.status = "SOS_PENDING"
            alert.resolution = "EMERGENCY"

        db.commit()
        db.refresh(alert)

        return alert

    # ======================================================
    # Caregiver Confirmation
    # ======================================================

    def confirm_by_caregiver(
        self,
        db: Session,
        alert_id: int,
        is_safe: bool,
    ):

        alert = self.get_alert(
            db,
            alert_id,
        )

        if not alert:
            return None

        alert.caregiver_confirmation = is_safe

        if is_safe:
            alert.status = "RESOLVED"
            alert.resolution = "CAREGIVER_CONFIRMED_SAFE"
            alert.resolved_at = datetime.now(timezone.utc)

        else:
            alert.status = "SOS_PENDING"
            alert.resolution = "EMERGENCY"

        db.commit()
        db.refresh(alert)

        return alert


# ==========================================================
# Singleton
# ==========================================================

emergency_service = EmergencyService()