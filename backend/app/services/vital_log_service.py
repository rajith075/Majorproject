from sqlalchemy.orm import Session

from app.models.vital_log import VitalLog
from app.models.patient import Patient

from app.services.patient_profile_service import (
    patient_profile_service,
)

from app.ai.prediction_service import (
    prediction_service,
)

from app.services.emergency_notification_service import (
    emergency_notification_service,
)


class VitalLogService:

    @staticmethod
    def create_vital_log(
        db: Session,
        patient: Patient,
        data,
    ):

        # ==========================================================
        # CREATE VITAL LOG
        # ==========================================================

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

        # ==========================================================
        # UPDATE PATIENT LATEST SNAPSHOT
        # ==========================================================

        patient.last_heart_rate = data.heart_rate
        patient.last_systolic_bp = data.systolic_bp
        patient.last_diastolic_bp = data.diastolic_bp
        patient.last_spo2 = data.spo2
        patient.last_temperature = data.temperature
        patient.last_respiratory_rate = data.respiratory_rate

        # ==========================================================
        # SAVE VITAL FIRST
        # ==========================================================

        db.commit()
        db.refresh(vital)

        # ==========================================================
        # REAL-TIME AI PREDICTION + EMERGENCY NOTIFICATION
        # ==========================================================

        try:

            # ------------------------------------------------------
            # 1. GET COMPLETE PATIENT PROFILE
            # ------------------------------------------------------

            profile = patient_profile_service.get_complete_profile(
                db=db,
                patient_id=patient.id,
            )

            if profile is None:
                print(
                    f"[REAL-TIME AI] Patient profile not found: "
                    f"{patient.id}"
                )

                return vital

            # ------------------------------------------------------
            # 2. RUN EXISTING AI PREDICTION PIPELINE
            # ------------------------------------------------------
            #
            # Existing architecture:
            #
            # PatientProfileService
            #        ↓
            # Feature Pipeline
            #        ↓
            # Health Risk Model
            #        ↓
            # Clinical Event Model
            #        ↓
            # Existing AlertEngine
            #
            # No duplicate ML model.
            # No duplicate prediction logic.
            # ------------------------------------------------------

            prediction_result = prediction_service.predict(
                db=db,
                patient_profile=profile,
            )

            # ------------------------------------------------------
            # 3. EXTRACT PREDICTIONS
            # ------------------------------------------------------

            health_prediction = prediction_result.get(
                "health_prediction",
                {},
            )

            clinical_prediction = prediction_result.get(
                "clinical_prediction",
                {},
            )

            alerts = prediction_result.get(
                "alerts",
                [],
            )

            # ------------------------------------------------------
            # 4. REAL-TIME AI LOG
            # ------------------------------------------------------

            print("=" * 70)
            print("REAL-TIME AI PREDICTION")
            print("=" * 70)

            print(
                f"Patient ID        : {patient.id}"
            )

            print(
                f"Vital Log ID      : {vital.id}"
            )

            print(
                f"Health Risk       : "
                f"{health_prediction.get('level')}"
            )

            print(
                f"Health Confidence : "
                f"{health_prediction.get('confidence')}%"
            )

            print(
                f"Clinical Event    : "
                f"{clinical_prediction.get('event')}"
            )

            print(
                f"Clinical Conf.    : "
                f"{clinical_prediction.get('confidence')}%"
            )

            print(
                f"AI Alerts         : "
                f"{alerts}"
            )

            print("=" * 70)

            # ------------------------------------------------------
            # 5. PROCESS EMERGENCY ALERTS
            # ------------------------------------------------------
            #
            # Existing AlertEngine generates the alerts.
            #
            # EmergencyNotificationService handles:
            #
            # WARNING
            #     ↓
            # SMS
            #
            # CRITICAL
            #     ↓
            # SMS + CALL
            #
            # Family + Caregiver
            # ------------------------------------------------------

            if alerts:

                emergency_notification_service.process_alerts(
                    db=db,
                    patient=patient,
                    vital=vital,
                    alerts=alerts,
                )

            else:

                print(
                    "[EMERGENCY] No emergency alerts generated."
                )

        except Exception as e:

            # ======================================================
            # IMPORTANT
            # ======================================================
            #
            # AI / notification failure must NEVER undo the
            # already-saved vital.
            #
            # The vital remains safely stored in the database.
            # ======================================================

            print("=" * 70)
            print("REAL-TIME AI / EMERGENCY PROCESSING ERROR")
            print("=" * 70)

            print(
                f"Patient ID: {patient.id}"
            )

            print(
                f"Vital Log ID: {vital.id}"
            )

            print(
                f"Error: {str(e)}"
            )

            print("=" * 70)

        # ==========================================================
        # RETURN ORIGINAL VITAL RESPONSE
        # ==========================================================

        return vital

    # ==============================================================
    # GET LATEST VITALS
    # ==============================================================

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

    # ==============================================================
    # GET COMPLETE VITAL HISTORY
    # ==============================================================

    @staticmethod
    def get_vital_history(
        db: Session,
        patient_id: int,
    ):

        return (
            db.query(VitalLog)
            .filter(
                VitalLog.patient_id == patient_id
            )
            .order_by(
                VitalLog.created_at.asc()
            )
            .all()
        )


vital_log_service = VitalLogService()