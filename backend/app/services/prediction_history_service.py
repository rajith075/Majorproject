"""
==========================================================
Prediction History Service

Handles storing and retrieving AI prediction history.
==========================================================
"""

from sqlalchemy.orm import Session

from app.models.prediction_history import PredictionHistory


class PredictionHistoryService:

    def save_prediction(
        self,
        db: Session,
        patient_id: int,
        prediction: dict,
    ):

        history = PredictionHistory(

            patient_id=patient_id,

            # ==========================================
            # Health Prediction
            # ==========================================

            health_risk=prediction["health_prediction"]["level"],

            health_confidence=prediction["health_prediction"]["confidence"],

            # ==========================================
            # Clinical Prediction
            # ==========================================

            clinical_event=prediction["clinical_prediction"]["event"],

            clinical_confidence=prediction["clinical_prediction"]["confidence"],

            # ==========================================
            # Alert
            # ==========================================

            alert_level=(
                prediction["alerts"][0]["severity"]
                if prediction["alerts"]
                else "Normal"
            ),

            alert_message=(
                prediction["alerts"][0]["message"]
                if prediction["alerts"]
                else "No active alerts"
            ),

            # ==========================================
            # AI Output
            # ==========================================

            recommendations=prediction["recommendations"],

            engineered_features=prediction["engineered_features"],

            # ==========================================
            # Future Features
            # ==========================================

            overall_health_score=None,

            ai_summary=None,

        )

        db.add(history)

        db.commit()

        db.refresh(history)

        return history

    # ======================================================
    # Latest Prediction
    # ======================================================

    def get_latest_prediction(
        self,
        db: Session,
        patient_id: int,
    ):

        return (

            db.query(PredictionHistory)

            .filter(
                PredictionHistory.patient_id == patient_id
            )

            .order_by(
                PredictionHistory.created_at.desc()
            )

            .first()

        )

    # ======================================================
    # Complete History
    # ======================================================

    def get_prediction_history(
        self,
        db: Session,
        patient_id: int,
    ):

        return (

            db.query(PredictionHistory)

            .filter(
                PredictionHistory.patient_id == patient_id
            )

            .order_by(
                PredictionHistory.created_at.desc()
            )

            .all()

        )


prediction_history_service = PredictionHistoryService()