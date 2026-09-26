from sqlalchemy.orm import Session

from app.db.database import SessionLocal
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

    # ==============================================================
    # FAST EMERGENCY SAFETY CHECK
    # ==============================================================

    @staticmethod
    def get_immediate_emergency_alerts(data):

        alerts = []

        # ----------------------------------------------------------
        # CRITICAL SpO2
        # ----------------------------------------------------------

        if (
            data.spo2 is not None
            and data.spo2 > 0
            and data.spo2 < 85
        ):
            alerts.append({
                "severity": "Critical",
                "title": "Severe Hypoxia",
                "message": (
                    f"Critical oxygen saturation detected: "
                    f"SpO₂ {data.spo2}%."
                ),
            })

        # ----------------------------------------------------------
        # CRITICAL HEART RATE
        # ----------------------------------------------------------

        if (
            data.heart_rate is not None
            and data.heart_rate > 0
            and (
                data.heart_rate < 40
                or data.heart_rate > 140
            )
        ):
            alerts.append({
                "severity": "Critical",
                "title": "Critical Heart Rate",
                "message": (
                    f"Critical heart rate detected: "
                    f"{data.heart_rate} BPM."
                ),
            })

        # ----------------------------------------------------------
        # CRITICAL BLOOD PRESSURE
        # ----------------------------------------------------------

        if (
            data.systolic_bp is not None
            and data.diastolic_bp is not None
            and data.systolic_bp > 0
            and data.diastolic_bp > 0
            and (
                data.systolic_bp >= 180
                or data.diastolic_bp >= 120
            )
        ):
            alerts.append({
                "severity": "Critical",
                "title": "Critical Blood Pressure",
                "message": (
                    f"Critical blood pressure detected: "
                    f"{data.systolic_bp}/"
                    f"{data.diastolic_bp} mmHg."
                ),
            })

        # ----------------------------------------------------------
        # CRITICAL TEMPERATURE
        # ----------------------------------------------------------

        if (
            data.temperature is not None
            and data.temperature > 0
            and data.temperature >= 40
        ):
            alerts.append({
                "severity": "Critical",
                "title": "Critical Temperature",
                "message": (
                    f"Critical temperature detected: "
                    f"{data.temperature}°C."
                ),
            })

        # ----------------------------------------------------------
        # CRITICAL RESPIRATORY RATE
        # ----------------------------------------------------------

        if (
            data.respiratory_rate is not None
            and data.respiratory_rate > 0
            and data.respiratory_rate >= 30
        ):
            alerts.append({
                "severity": "Critical",
                "title": "Respiratory Distress",
                "message": (
                    f"Critical respiratory rate detected: "
                    f"{data.respiratory_rate}/min."
                ),
            })

        # ----------------------------------------------------------
        # HIGH RISK (same fast path as critical, but no voice call)
        # ----------------------------------------------------------
        # These ranges must not wait for the prediction/RAG pipeline before
        # notifying the care team. Critical ranges above still take priority.

        if data.spo2 is not None and 0 < data.spo2 < 90 and data.spo2 >= 85:
            alerts.append({
                "severity": "High",
                "title": "Low Oxygen Saturation",
                "message": f"Low oxygen saturation detected: SpO₂ {data.spo2}%.",
            })

        if data.heart_rate is not None and (
            40 <= data.heart_rate < 50 or 120 < data.heart_rate <= 140
        ):
            alerts.append({
                "severity": "High",
                "title": "High Risk Heart Rate",
                "message": f"High risk heart rate detected: {data.heart_rate} BPM.",
            })

        if (
            data.systolic_bp is not None
            and data.diastolic_bp is not None
            and 0 < data.systolic_bp < 180
            and 0 < data.diastolic_bp < 120
            and (data.systolic_bp >= 160 or data.diastolic_bp >= 100)
        ):
            alerts.append({
                "severity": "High",
                "title": "High Blood Pressure",
                "message": (
                    "High blood pressure detected: "
                    f"{data.systolic_bp}/{data.diastolic_bp} mmHg."
                ),
            })

        if data.temperature is not None and 38.5 <= data.temperature < 40:
            alerts.append({
                "severity": "High",
                "title": "High Temperature",
                "message": f"High temperature detected: {data.temperature}°C.",
            })

        if data.respiratory_rate is not None and 24 <= data.respiratory_rate < 30:
            alerts.append({
                "severity": "High",
                "title": "Elevated Respiratory Rate",
                "message": (
                    "Elevated respiratory rate detected: "
                    f"{data.respiratory_rate}/min."
                ),
            })

        return alerts

    # ==============================================================
    # CREATE VITAL LOG
    # ==============================================================

    @staticmethod
    def create_vital_log(
        db: Session,
        patient: Patient,
        data,
    ):

        # ==========================================================
        # 1. CREATE VITAL LOG
        # ==========================================================

        # A device only sends values for sensors it physically has.  Build a
        # complete current snapshot by retaining the last known value for the
        # other metrics (for example, blood pressure entered by a doctor).
        previous_vital = (
            db.query(VitalLog)
            .filter(VitalLog.patient_id == patient.id)
            .order_by(VitalLog.created_at.desc(), VitalLog.id.desc())
            .first()
        )

        snapshot_fields = {
            "heart_rate",
            "systolic_bp",
            "diastolic_bp",
            "spo2",
            "temperature",
            "respiratory_rate",
        }

        def current_value(field):
            incoming_value = getattr(data, field)
            if incoming_value is not None:
                return incoming_value

            if field in snapshot_fields:
                saved_value = getattr(patient, f"last_{field}", None)
                if saved_value is not None:
                    return saved_value

            return getattr(previous_vital, field, None)

        vital = VitalLog(
            patient_id=patient.id,

            heart_rate=current_value("heart_rate"),
            systolic_bp=current_value("systolic_bp"),
            diastolic_bp=current_value("diastolic_bp"),
            spo2=current_value("spo2"),
            temperature=current_value("temperature"),
            respiratory_rate=current_value("respiratory_rate"),

            sleep_hours=current_value("sleep_hours"),
            activity_steps=current_value("activity_steps"),
        )

        db.add(vital)

        # ==========================================================
        # 2. UPDATE PATIENT SNAPSHOT
        # ==========================================================

        # Keep the last known value when a connected device does not have a
        # physical sensor for a particular vital. Saving ``None`` here would
        # erase a valid clinician-entered reading from the patient snapshot.
        for field in (
            "heart_rate",
            "systolic_bp",
            "diastolic_bp",
            "spo2",
            "temperature",
            "respiratory_rate",
        ):
            value = getattr(data, field)
            if value is not None:
                setattr(patient, f"last_{field}", value)

        # ==========================================================
        # 3. SAVE IMMEDIATELY
        # ==========================================================

        db.commit()
        db.refresh(vital)

        # The reading is now durable and can be displayed immediately. The
        # optional notification/AI work is intentionally scheduled after the
        # HTTP response so it cannot block a device submission.
        immediate_alerts = VitalLogService.get_immediate_emergency_alerts(data)
        return vital, immediate_alerts

        # ==========================================================
        # 4. FAST EMERGENCY CHECK
        # ==========================================================
        #
        # IMPORTANT:
        #
        # This happens BEFORE PredictionService.
        #
        # Therefore FCM/Twilio does not wait for:
        #
        # ML → RAG → Gemini → Recommendations
        #
        # ==========================================================

        try:

            immediate_alerts = (
                VitalLogService.get_immediate_emergency_alerts(
                    data
                )
            )

            if immediate_alerts:

                print("=" * 70)
                print("🚨 IMMEDIATE EMERGENCY DETECTED")
                print("=" * 70)

                print(
                    f"Patient       : {patient.id}"
                )

                print(
                    f"Vital Log     : {vital.id}"
                )

                print(
                    f"Immediate Alerts: "
                    f"{immediate_alerts}"
                )

                # --------------------------------------------------
                # SEND FCM / TWILIO IMMEDIATELY
                # --------------------------------------------------

                emergency_notification_service.process_alerts(
                    db=db,
                    patient=patient,
                    vital=vital,
                    alerts=immediate_alerts,
                )

                print("=" * 70)
                print("🚨 EMERGENCY NOTIFICATION SENT")
                print("=" * 70)

            else:

                print(
                    "[IMMEDIATE SAFETY] "
                    "No critical vital threshold detected."
                )

        except Exception as e:

            print(
                "[IMMEDIATE EMERGENCY ERROR]",
                str(e),
            )

        # ==========================================================
        # 5. EXISTING AI PIPELINE
        # ==========================================================
        #
        # The existing AI system remains intact.
        #
        # This is used for:
        #
        # - Health risk prediction
        # - Clinical event prediction
        # - AI explanation
        # - RAG
        # - Recommendations
        # - Dashboard insights
        #
        # ==========================================================

        try:

            profile = (
                patient_profile_service.get_complete_profile(
                    db=db,
                    patient_id=patient.id,
                )
            )

            if profile is None:

                print(
                    f"[REAL-TIME AI] Patient profile not found: "
                    f"{patient.id}"
                )

                return vital

            prediction_result = (
                prediction_service.predict(
                    db=db,
                    patient_profile=profile,
                )
            )

            health_prediction = (
                prediction_result.get(
                    "health_prediction",
                    {},
                )
            )

            clinical_prediction = (
                prediction_result.get(
                    "clinical_prediction",
                    {},
                )
            )

            alerts = (
                prediction_result.get(
                    "alerts",
                    [],
                )
            )

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
            # IMPORTANT
            #
            # Don't send the same critical notification twice.
            #
            # If immediate safety already generated a Critical
            # alert, the AI-generated Critical alert should not
            # trigger another call.
            # ------------------------------------------------------

            immediate_was_sent = bool(immediate_alerts)
            ai_requires_escalation = any(
                alert.get("severity") == "Critical"
                for alert in alerts
            )
            immediate_is_critical = any(
                alert.get("severity") == "Critical"
                for alert in immediate_alerts
            )

            if alerts and (
                not immediate_was_sent
                or (ai_requires_escalation and not immediate_is_critical)
            ):

                emergency_notification_service.process_alerts(
                    db=db,
                    patient=patient,
                    vital=vital,
                    alerts=alerts,
                )

            elif not alerts:

                print(
                    "[EMERGENCY] "
                    "No AI emergency alerts generated."
                )

            else:

                print(
                    "[EMERGENCY] "
                    "Critical notification already sent "
                    "by immediate safety layer."
                )

        except Exception as e:

            print("=" * 70)
            print(
                "REAL-TIME AI / EMERGENCY PROCESSING ERROR"
            )
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
        # RETURN VITAL
        # ==========================================================

        return vital

    # ==============================================================
    # PROCESS A SAVED VITAL IN THE BACKGROUND
    # ==============================================================

    @staticmethod
    def process_saved_vital(
        patient_id: int,
        vital_id: int,
        immediate_alerts: list[dict],
        send_alerts: bool = True,
    ) -> None:
        """Generate AI output after saving a vital, optionally escalating alerts."""
        db = SessionLocal()
        try:
            patient = db.get(Patient, patient_id)
            vital = db.get(VitalLog, vital_id)
            if not patient or not vital:
                print(f"[VITAL PROCESSING] Missing patient or vital: {patient_id}/{vital_id}")
                return

            if send_alerts and immediate_alerts:
                emergency_notification_service.process_alerts(
                    db=db,
                    patient=patient,
                    vital=vital,
                    alerts=immediate_alerts,
                )

            profile = patient_profile_service.get_complete_profile(
                db=db,
                patient_id=patient.id,
            )
            if profile is None:
                print(f"[VITAL PROCESSING] Patient profile not found: {patient.id}")
                return

            prediction_result = prediction_service.predict(
                db=db,
                patient_profile=profile,
            )
            alerts = prediction_result.get("alerts", [])
            immediate_is_critical = any(
                alert.get("severity") == "Critical"
                for alert in immediate_alerts
            )
            ai_requires_escalation = any(
                alert.get("severity") == "Critical"
                for alert in alerts
            )

            if send_alerts and alerts and (
                not immediate_alerts
                or (ai_requires_escalation and not immediate_is_critical)
            ):
                emergency_notification_service.process_alerts(
                    db=db,
                    patient=patient,
                    vital=vital,
                    alerts=alerts,
                )

            print(f"[VITAL PROCESSING] AI prediction completed for vital {vital.id}.")
        except Exception as error:
            db.rollback()
            print(
                f"[VITAL PROCESSING] AI/notification processing failed for "
                f"vital {vital_id}: {error}"
            )
        finally:
            db.close()

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
                VitalLog.created_at.desc(),
                VitalLog.id.desc(),
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
                VitalLog.created_at.asc(),
                VitalLog.id.asc(),
            )
            .all()
        )


vital_log_service = VitalLogService()
