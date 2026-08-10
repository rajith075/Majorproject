"""
==========================================================
Prediction Service

Coordinates the complete AI Prediction Pipeline

Flow

Patient Profile
        ↓
Feature Pipeline
        ↓
Health Prediction
        ↓
Clinical Prediction
        ↓
Alert Engine
        ↓
Recommendation Engine
        ↓
Prediction History
==========================================================
"""

from sqlalchemy.orm import Session

from app.ai.feature_pipeline import feature_pipeline
from app.ai.health_predictor import health_predictor
from app.ai.clinical_predictor import clinical_predictor
from app.ai.alert_engine import alert_engine
from app.ai.recommendation_engine import recommendation_engine

from app.services.prediction_history_service import (
    prediction_history_service,
)


class PredictionService:

    def __init__(self):

        self.pipeline = feature_pipeline

        self.health_predictor = health_predictor

        self.clinical_predictor = clinical_predictor

        self.alert_engine = alert_engine

        self.recommendation_engine = recommendation_engine

    def predict(
        self,
        db: Session,
        patient_profile: dict,
    ):

        # ==================================================
        # Feature Pipeline
        # ==================================================

        pipeline_result = self.pipeline.build(
            patient_profile
        )

        # ==================================================
        # Health Prediction
        # ==================================================

        health_prediction = self.health_predictor.predict(
            pipeline_result["health_features"]
        )

        # ==================================================
        # Clinical Prediction
        # ==================================================

        clinical_prediction = self.clinical_predictor.predict(
            pipeline_result["clinical_features"]
        )

        # ==================================================
        # Alerts
        # ==================================================

        alerts = self.alert_engine.generate(
            health_prediction,
            clinical_prediction,
        )

        # ==================================================
        # Recommendations
        # ==================================================

        recommendations = self.recommendation_engine.generate(
            health_prediction,
            clinical_prediction,
        )

        # ==================================================
        # Final Prediction Result
        # ==================================================

        result = {

            "patient_id": patient_profile["patient"].id,

            "status": "Prediction Completed",

            "health_prediction": health_prediction,

            "clinical_prediction": clinical_prediction,

            "alerts": alerts,

            "recommendations": recommendations,

            "engineered_features":
                pipeline_result["engineered_features"],

        }

        # ==================================================
        # Save Prediction History
        # ==================================================

        prediction_history_service.save_prediction(

            db=db,

            patient_id=patient_profile["patient"].id,

            prediction=result,

        )

        # ==================================================
        # Return Prediction
        # ==================================================

        return result


prediction_service = PredictionService()