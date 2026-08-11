# ==========================================================
# AI Summary Engine
# ==========================================================

class SummaryEngine:

    # ======================================================
    # Generate AI Health Summary
    # ======================================================

    def generate(
        self,
        health_prediction,
        clinical_prediction,
        engineered_features,
    ):

        health_level = health_prediction.get(
            "level",
            "Stable",
        )

        clinical_event = clinical_prediction.get(
            "event",
            "Stable",
        )

        # ==================================================
        # Patient Risk Description
        # ==================================================

        if health_level == "Critical":
            summary_start = (
                "The patient is currently at critical health risk."
            )

        elif health_level == "High":
            summary_start = (
                "The patient is currently at high health risk."
            )

        elif health_level == "Moderate":
            summary_start = (
                "The patient is currently at moderate health risk."
            )

        elif health_level == "Low":
            summary_start = (
                "The patient is currently at low health risk."
            )

        else:
            summary_start = (
                "The patient's overall health status is currently stable."
            )

        # ==================================================
        # Clinical Status
        # ==================================================

        if clinical_event == "Stable":
            clinical_text = (
                " The clinical event model predicts a stable condition."
            )

        else:
            clinical_text = (
                f" The clinical event model indicates "
                f"{clinical_event}."
            )

        # ==================================================
        # Identify Important Factors
        # ==================================================

        factors = []

        # --------------------------------------------------
        # Blood Pressure
        # --------------------------------------------------

        systolic_bp = engineered_features.get(
            "Systolic_BP",
            0,
        )

        if systolic_bp >= 140:
            factors.append(
                "elevated blood pressure"
            )

        # --------------------------------------------------
        # Oxygen
        # --------------------------------------------------

        spo2 = engineered_features.get(
            "SpO2",
            100,
        )

        if spo2 < 92:
            factors.append(
                "low oxygen saturation"
            )

        # --------------------------------------------------
        # Heart Rate
        # --------------------------------------------------

        heart_rate = engineered_features.get(
            "Heart_Rate",
            0,
        )

        if heart_rate > 100:
            factors.append(
                "elevated heart rate"
            )

        # --------------------------------------------------
        # Temperature
        # --------------------------------------------------

        temperature = engineered_features.get(
            "Temperature",
            0,
        )

        if temperature >= 38:
            factors.append(
                "elevated temperature"
            )

        # --------------------------------------------------
        # Sleep
        # --------------------------------------------------

        sleep_deficit = engineered_features.get(
            "Sleep_Deficit",
            0,
        )

        if sleep_deficit >= 2:
            factors.append(
                "insufficient sleep"
            )

        # --------------------------------------------------
        # Activity
        # --------------------------------------------------

        activity_deficit = engineered_features.get(
            "Activity_Deficit",
            0,
        )

        if activity_deficit >= 3000:
            factors.append(
                "low physical activity"
            )

        # --------------------------------------------------
        # Vital Abnormalities
        # --------------------------------------------------

        abnormality_count = engineered_features.get(
            "Vital_Abnormality_Count",
            0,
        )

        if abnormality_count >= 2:
            factors.append(
                "multiple abnormal vital signs"
            )

        # ==================================================
        # Build Factor Text
        # ==================================================

        if factors:

            if len(factors) == 1:
                factor_text = (
                    f" Key factors include "
                    f"{factors[0]}."
                )

            else:
                factor_text = (
                    " Key factors include "
                    + ", ".join(factors[:-1])
                    + f", and {factors[-1]}."
                )

        else:

            factor_text = (
                " No major abnormal vital factors "
                "were identified from the current measurements."
            )

        # ==================================================
        # Monitoring Recommendation
        # ==================================================

        if health_level in ["Critical", "High"]:

            monitoring_text = (
                " Close monitoring is recommended."
            )

        elif health_level == "Moderate":

            monitoring_text = (
                " Continued monitoring is recommended."
            )

        else:

            monitoring_text = (
                " Continue routine monitoring."
            )

        # ==================================================
        # Final Summary
        # ==================================================

        summary = (
            summary_start
            + clinical_text
            + factor_text
            + monitoring_text
        )

        return summary


# ==========================================================
# Singleton
# ==========================================================

summary_engine = SummaryEngine()