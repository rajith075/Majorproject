# ==========================================================
# Prediction Service
# ==========================================================
#
# Coordinates the complete AI Prediction Pipeline
#
# Flow:
#
# Patient
#    ↓
# Feature Pipeline
#    ↓
# Health Prediction
#    ↓
# Clinical Prediction
#    ↓
# Overall Health Score
#    ↓
# Existing AI Summary
#    ↓
# RAG Category Detection
#    ↓
# RAG Medical Explanation
#    ↓
# Alerts
#    ↓
# Recommendations
#    ↓
# Save Prediction History
#
# ==========================================================

from sqlalchemy.orm import Session

from app.ai.feature_pipeline import feature_pipeline
from app.ai.health_predictor import health_predictor
from app.ai.clinical_predictor import clinical_predictor
from app.ai.alert_engine import alert_engine
from app.ai.recommendation_engine import recommendation_engine
from app.ai.health_score_engine import health_score_engine
from app.ai.summary_engine import summary_engine

# ==========================================================
# RAG
# ==========================================================

from app.ai.rag.rag_generator import rag_generator

from app.services.prediction_history_service import (
    prediction_history_service,
)


class PredictionService:

    # ======================================================
    # Initialization
    # ======================================================

    def __init__(self):

        self.pipeline = feature_pipeline

        self.health_predictor = health_predictor

        self.clinical_predictor = clinical_predictor

        self.alert_engine = alert_engine

        self.recommendation_engine = (
            recommendation_engine
        )

        self.health_score_engine = (
            health_score_engine
        )

        self.summary_engine = summary_engine

        # --------------------------------------------------
        # RAG Generator
        # --------------------------------------------------

        self.rag_generator = rag_generator

        # --------------------------------------------------
        # RAG Category Priority Weights
        # --------------------------------------------------
        #
        # Used by _determine_rag_category() to break ties
        # when multiple conditions are active at once.
        # Higher weight = higher clinical priority.
        #
        # --------------------------------------------------

        self.condition_priority_weight = {

            "Stroke": 100,
            "Heart_Disease": 95,
            "COPD": 85,
            "Diabetes": 80,
            "Hypertension": 75,
            "Kidney_Disease": 70,
            "Asthma": 65,
            "Alzheimers": 60,
            "Parkinsons": 60,
            "Cancer": 60,
            "Liver_Disease": 55,
            "Thyroid": 45,
            "Anemia": 40,
            "Depression": 35,
            "Arthritis": 30,
            "Osteoporosis": 25,

        }

        # --------------------------------------------------
        # Vital Flag → Category Mapping
        # --------------------------------------------------

        self.vital_flag_category_map = {

            "Hypertension_Flag": "Hypertension",
            "Tachycardia_Flag": "Heart_Disease",
            "Low_Oxygen_Flag": "COPD",
            "Fever_Flag": None,  # non-specific, no category boost

        }

        # --------------------------------------------------
        # Clinical Event → Category Mapping
        # --------------------------------------------------
        #
        # clinical_predictor may return events using
        # different naming than the condition fields, so
        # we normalize common variants here.
        #
        # --------------------------------------------------

        self.clinical_event_category_map = {

            "stroke": "Stroke",
            "cardiac event": "Heart_Disease",
            "heart attack": "Heart_Disease",
            "myocardial infarction": "Heart_Disease",
            "diabetic event": "Diabetes",
            "hypoglycemia": "Diabetes",
            "hyperglycemia": "Diabetes",
            "hypertensive crisis": "Hypertension",
            "respiratory distress": "COPD",
            "copd exacerbation": "COPD",
            "asthma attack": "Asthma",
            "kidney failure": "Kidney_Disease",

        }

    # ======================================================
    # RAG Category Detection
    # ======================================================
    #
    # Determines the single most clinically relevant
    # condition to filter the RAG retriever by, instead of
    # letting Gemini "guess" from an unfiltered query.
    #
    # Scoring:
    #   - Clinical event match:      +150
    #   - Vital abnormality match:   +50 per matching flag
    #   - Active medical condition:  + condition_priority_weight
    #
    # The category with the highest total score wins.
    # Returns None if no signal could be mapped to a
    # known category (RAG will then fall back to an
    # unfiltered search).
    #
    # ======================================================

    def _determine_rag_category(
        self,
        health_prediction: dict,
        clinical_prediction: dict,
        medical_conditions: list,
        engineered_features: dict,
    ):

        scores = {}

        def add_score(category, points):

            if not category:
                return

            scores[category] = (
                scores.get(category, 0) + points
            )

        # --------------------------------------------------
        # Signal 1: Clinical Event (strongest signal)
        # --------------------------------------------------

        clinical_event = (
            clinical_prediction.get("event", "")
            or ""
        )

        clinical_event_normalized = (
            clinical_event.strip().lower()
        )

        if clinical_event_normalized:

            mapped_category = (
                self.clinical_event_category_map.get(
                    clinical_event_normalized
                )
            )

            if mapped_category:

                add_score(mapped_category, 150)

            else:

                # Fallback: try to match event text
                # directly against a condition field name.

                for condition in (
                    self.condition_priority_weight.keys()
                ):

                    condition_readable = (
                        condition.replace(
                            "_", " "
                        ).lower()
                    )

                    if (
                        condition_readable
                        in clinical_event_normalized
                    ):

                        add_score(condition, 150)

        # --------------------------------------------------
        # Signal 2: Vital Abnormalities
        # --------------------------------------------------

        for flag, category in (
            self.vital_flag_category_map.items()
        ):

            if engineered_features.get(flag) == 1:

                add_score(category, 50)

        # --------------------------------------------------
        # Signal 3: Active Medical Conditions
        # --------------------------------------------------

        for condition_readable in medical_conditions:

            # medical_conditions list stores readable
            # names (underscores replaced with spaces),
            # so map back to the original field name.

            condition_field = (
                condition_readable.replace(" ", "_")
            )

            weight = self.condition_priority_weight.get(
                condition_field, 20
            )

            add_score(condition_field, weight)

        # --------------------------------------------------
        # No usable signal → no category filter
        # --------------------------------------------------

        if not scores:

            return None

        # --------------------------------------------------
        # Pick the highest scoring category
        # --------------------------------------------------

        best_category = max(
            scores,
            key=scores.get,
        )

        return best_category.lower()

    # ======================================================
    # Main Prediction Function
    # ======================================================

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

        engineered_features = (
            pipeline_result[
                "engineered_features"
            ]
        )

        # ==================================================
        # Health Prediction
        # ==================================================

        health_prediction = (
            self.health_predictor.predict(
                pipeline_result[
                    "health_features"
                ]
            )
        )

        # ==================================================
        # Clinical Prediction
        # ==================================================

        clinical_prediction = (
            self.clinical_predictor.predict(
                pipeline_result[
                    "clinical_features"
                ]
            )
        )

        # ==================================================
        # Overall Health Score
        # ==================================================

        overall_health_score = (
            self.health_score_engine.calculate(

                health_prediction,

                clinical_prediction,

                engineered_features,

            )
        )

        # ==================================================
        # Existing AI Summary
        # ==================================================

        ai_summary = (
            self.summary_engine.generate(

                health_prediction,

                clinical_prediction,

                engineered_features,

            )
        )

        # ==================================================
        # RAG QUERY
        # ==================================================
        #
        # Build a meaningful query from the actual
        # prediction and patient features.
        #
        # This query is sent to the vector retriever.
        #
        # ==================================================

        rag_query_parts = []

        # --------------------------------------------------
        # Health Risk
        # --------------------------------------------------

        health_level = (
            health_prediction.get(
                "level",
                "",
            )
        )

        if health_level:

            rag_query_parts.append(
                f"health risk: {health_level}"
            )

        # --------------------------------------------------
        # Clinical Event
        # --------------------------------------------------

        clinical_event = (
            clinical_prediction.get(
                "event",
                "",
            )
        )

        if clinical_event:

            rag_query_parts.append(
                f"clinical event: {clinical_event}"
            )

        # --------------------------------------------------
        # Important Medical Conditions
        # --------------------------------------------------

        medical_conditions = []

        condition_fields = [

            "Diabetes",
            "Hypertension",
            "Heart_Disease",
            "Stroke",
            "COPD",
            "Asthma",
            "Kidney_Disease",
            "Parkinsons",
            "Alzheimers",
            "Thyroid",
            "Liver_Disease",
            "Arthritis",
            "Cancer",
            "Osteoporosis",
            "Depression",
            "Anemia",

        ]

        for condition in condition_fields:

            value = engineered_features.get(
                condition
            )

            if value == 1:

                medical_conditions.append(
                    condition.replace(
                        "_",
                        " ",
                    )
                )

        if medical_conditions:

            rag_query_parts.append(
                "medical conditions: "
                + ", ".join(
                    medical_conditions
                )
            )

        # --------------------------------------------------
        # Important Vital Abnormalities
        # --------------------------------------------------

        vital_flags = []

        flag_fields = [

            "Fever_Flag",
            "Low_Oxygen_Flag",
            "Tachycardia_Flag",
            "Hypertension_Flag",

        ]

        for flag in flag_fields:

            if engineered_features.get(
                flag
            ) == 1:

                vital_flags.append(
                    flag.replace(
                        "_Flag",
                        "",
                    ).replace(
                        "_",
                        " ",
                    )
                )

        if vital_flags:

            rag_query_parts.append(
                "vital abnormalities: "
                + ", ".join(
                    vital_flags
                )
            )

        # --------------------------------------------------
        # Fallback Query
        # --------------------------------------------------

        if not rag_query_parts:

            rag_query = (
                "elderly patient health monitoring"
            )

        else:

            rag_query = (
                "elderly patient "
                + ", ".join(
                    rag_query_parts
                )
            )

        # ==================================================
        # RAG CATEGORY DETECTION
        # ==================================================
        #
        # Determine the single most relevant medical
        # category (e.g. "hypertension", "diabetes",
        # "stroke") using a priority system based on:
        #   1. Clinical event
        #   2. Vital abnormality flags
        #   3. Active medical conditions
        #
        # This category is passed to the retriever so
        # semantic search is filtered instead of searching
        # across all vectors in the knowledge base.
        #
        # ==================================================

        rag_category = self._determine_rag_category(
            health_prediction=health_prediction,
            clinical_prediction=clinical_prediction,
            medical_conditions=medical_conditions,
            engineered_features=engineered_features,
        )

        # ==================================================
        # RAG PATIENT CONTEXT
        # ==================================================
        #
        # Gemini receives the patient/AI context separately
        # from the retrieved medical knowledge.
        #
        # ==================================================

        patient_context = {

            "age":
                engineered_features.get(
                    "Age"
                ),

            "gender":
                engineered_features.get(
                    "Gender"
                ),

            "health_risk":
                health_prediction.get(
                    "level"
                ),

            "health_confidence":
                health_prediction.get(
                    "confidence"
                ),

            "clinical_event":
                clinical_prediction.get(
                    "event"
                ),

            "clinical_confidence":
                clinical_prediction.get(
                    "confidence"
                ),

            "overall_health_score":
                overall_health_score,

            "medical_conditions":
                medical_conditions,

            "heart_rate":
                engineered_features.get(
                    "Heart_Rate"
                ),

            "systolic_bp":
                engineered_features.get(
                    "Systolic_BP"
                ),

            "diastolic_bp":
                engineered_features.get(
                    "Diastolic_BP"
                ),

            "spo2":
                engineered_features.get(
                    "SpO2"
                ),

            "temperature":
                engineered_features.get(
                    "Temperature"
                ),

            "respiratory_rate":
                engineered_features.get(
                    "Respiratory_Rate"
                ),

            "sleep_hours":
                engineered_features.get(
                    "Sleep_Hours"
                ),

            "activity_steps":
                engineered_features.get(
                    "Activity_Steps"
                ),

        }

        # ==================================================
        # Convert Patient Context to Text
        # ==================================================

        patient_context_text = "\n".join(

            f"{key}: {value}"

            for key, value
            in patient_context.items()

        )

        # ==================================================
        # RAG GENERATION
        # ==================================================

        rag_explanation = (
            self.rag_generator.generate(

                query=rag_query,

                patient_context=(
                    patient_context_text
                ),

                top_k=3,

                category=rag_category,

            )
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

        recommendations = (
            self.recommendation_engine.generate(

                health_prediction,

                clinical_prediction,

                engineered_features,

            )
        )

        # ==================================================
        # Final Prediction Result
        # ==================================================

        result = {

            "patient_id":
                patient_profile[
                    "patient"
                ].id,

            "status":
                "Prediction Completed",

            # ------------------------------------------------
            # ML Predictions
            # ------------------------------------------------

            "health_prediction":
                health_prediction,

            "clinical_prediction":
                clinical_prediction,

            # ------------------------------------------------
            # Overall Health Score
            # ------------------------------------------------

            "overall_health_score":
                overall_health_score,

            # ------------------------------------------------
            # Existing AI Summary
            # ------------------------------------------------

            "ai_summary":
                ai_summary,

            # ------------------------------------------------
            # RAG Explanation
            # ------------------------------------------------

            "rag_explanation":
                rag_explanation,

            # ------------------------------------------------
            # RAG Query
            # ------------------------------------------------

            "rag_query":
                rag_query,

            # ------------------------------------------------
            # RAG Category
            # ------------------------------------------------

            "rag_category":
                rag_category,

            # ------------------------------------------------
            # Alerts
            # ------------------------------------------------

            "alerts":
                alerts,

            # ------------------------------------------------
            # Recommendations
            # ------------------------------------------------

            "recommendations":
                recommendations,

            # ------------------------------------------------
            # Engineered Features
            # ------------------------------------------------

            "engineered_features":
                engineered_features,

        }

        # ==================================================
        # Save Prediction History
        # ==================================================

        prediction_history_service.save_prediction(

            db=db,

            patient_id=
                patient_profile[
                    "patient"
                ].id,

            prediction=result,

        )

        # ==================================================
        # Return Prediction
        # ==================================================

        return result


# ==========================================================
# Singleton
# ==========================================================

prediction_service = PredictionService()