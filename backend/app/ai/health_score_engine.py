# ==========================================================
# Overall Health Score Engine
# ==========================================================

class HealthScoreEngine:

    # ======================================================
    # Calculate Overall Health Score
    # ======================================================

    def calculate(
        self,
        health_prediction,
        clinical_prediction,
        engineered_features,
    ):

        score = 100.0

        # ==================================================
        # Health Risk
        # ==================================================

        health_level = health_prediction.get(
            "level",
            "Stable",
        )

        health_penalty = {
            "Stable": 0,
            "Low": 5,
            "Moderate": 15,
            "High": 25,
            "Critical": 40,
        }

        score -= health_penalty.get(
            health_level,
            0,
        )

        # ==================================================
        # Clinical Event
        # ==================================================

        clinical_event = clinical_prediction.get(
            "event",
            "Stable",
        )

        clinical_penalty = {
            "Stable": 0,
            "Cardiac Event Risk": 15,
            "Respiratory Distress": 15,
            "Metabolic Risk": 12,
            "Possible Stroke": 20,
            "Hypertensive Crisis": 20,
        }

        score -= clinical_penalty.get(
            clinical_event,
            0,
        )

        # ==================================================
        # Vital Abnormalities
        # ==================================================

        abnormality_count = engineered_features.get(
            "Vital_Abnormality_Count",
            0,
        )

        score -= min(
            abnormality_count * 5,
            20,
        )

        # ==================================================
        # Comorbidities
        # ==================================================

        comorbidity_count = engineered_features.get(
            "Comorbidity_Count",
            0,
        )

        score -= min(
            comorbidity_count * 2,
            10,
        )

        # ==================================================
        # Sleep
        # ==================================================

        sleep_deficit = engineered_features.get(
            "Sleep_Deficit",
            0,
        )

        score -= min(
            sleep_deficit * 2,
            10,
        )

        # ==================================================
        # Activity
        # ==================================================

        activity_deficit = engineered_features.get(
            "Activity_Deficit",
            0,
        )

        if activity_deficit >= 6000:
            score -= 5

        elif activity_deficit >= 3000:
            score -= 3

        # ==================================================
        # Keep Score Between 0 and 100
        # ==================================================

        score = max(
            0,
            min(100, score),
        )

        return round(
            score,
            2,
        )


# ==========================================================
# Singleton
# ==========================================================

health_score_engine = HealthScoreEngine()