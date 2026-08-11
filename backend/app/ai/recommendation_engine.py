# ==========================================================
# Recommendation Engine
# ==========================================================


class RecommendationEngine:

    # ======================================================
    # Generate Recommendations
    # ======================================================

    def generate(
        self,
        health_prediction,
        clinical_prediction,
        engineered_features=None,
    ):

        recommendations = []

        health = health_prediction["level"]

        event = clinical_prediction["event"]

        # ==================================================
        # Default Features
        # ==================================================

        if engineered_features is None:
            engineered_features = {}

        # ==================================================
        # Health Risk Recommendations
        # ==================================================

        if health == "Critical":

            recommendations.extend([

                "Seek immediate medical attention.",

                "Contact the assigned doctor immediately.",

                "Continuously monitor vital signs.",

                "Inform emergency contacts immediately.",

            ])

        elif health == "High":

            recommendations.extend([

                "Increase monitoring frequency.",

                "Schedule a doctor's consultation.",

                "Ensure medication adherence.",

                "Maintain proper hydration.",

            ])

        elif health == "Moderate":

            recommendations.extend([

                "Monitor symptoms closely.",

                "Continue prescribed medications.",

                "Maintain a healthy lifestyle.",

            ])

        else:

            recommendations.extend([

                "Continue routine monitoring.",

                "Maintain current healthy habits.",

            ])

        # ==================================================
        # Blood Pressure
        # ==================================================

        systolic_bp = engineered_features.get(
            "Systolic_BP"
        )

        diastolic_bp = engineered_features.get(
            "Diastolic_BP"
        )

        if (
            systolic_bp is not None
            and systolic_bp >= 140
        ):

            recommendations.append(
                "Monitor blood pressure more frequently."
            )

        if (
            diastolic_bp is not None
            and diastolic_bp >= 90
        ):

            recommendations.append(
                "Discuss persistently elevated blood pressure with the doctor."
            )

        # ==================================================
        # Oxygen
        # ==================================================

        spo2 = engineered_features.get(
            "SpO2"
        )

        if (
            spo2 is not None
            and spo2 < 92
        ):

            recommendations.append(
                "Monitor oxygen saturation closely and seek medical advice if it remains low."
            )

        # ==================================================
        # Heart Rate
        # ==================================================

        heart_rate = engineered_features.get(
            "Heart_Rate"
        )

        if (
            heart_rate is not None
            and heart_rate > 100
        ):

            recommendations.append(
                "Monitor heart rate and report persistent elevation to the doctor."
            )

        # ==================================================
        # Temperature
        # ==================================================

        temperature = engineered_features.get(
            "Temperature"
        )

        if (
            temperature is not None
            and temperature >= 38
        ):

            recommendations.append(
                "Monitor temperature and watch for signs of infection or fever."
            )

        # ==================================================
        # Sleep
        # ==================================================

        sleep_deficit = engineered_features.get(
            "Sleep_Deficit",
            0,
        )

        if sleep_deficit >= 2:

            recommendations.append(
                "Encourage adequate sleep and maintain a consistent sleep routine."
            )

        # ==================================================
        # Physical Activity
        # ==================================================

        activity_deficit = engineered_features.get(
            "Activity_Deficit",
            0,
        )

        if activity_deficit >= 3000:

            recommendations.append(
                "Encourage safe and appropriate physical activity according to the patient's mobility."
            )

        # ==================================================
        # Medication Adherence
        # ==================================================

        medication_adherence = engineered_features.get(
            "Medication_Adherence"
        )

        if medication_adherence in [
            "Poor",
            "Missed",
        ]:

            recommendations.append(
                "Review medication adherence and ensure prescribed medicines are taken on schedule."
            )

        # ==================================================
        # Mobility
        # ==================================================

        mobility = engineered_features.get(
            "Mobility"
        )

        if mobility in [
            "Wheelchair",
            "Bedridden",
        ]:

            recommendations.append(
                "Ensure appropriate mobility assistance and fall-prevention measures."
            )

        # ==================================================
        # Clinical Event Recommendation
        # ==================================================

        if event and event != "None":

            if event == "Stable":

                # Don't add an unnecessary
                # "symptoms related to Stable" message.

                pass

            else:

                recommendations.append(

                    f"Observe the patient for symptoms related to {event}."

                )

        # ==================================================
        # Remove Duplicate Recommendations
        # ==================================================

        recommendations = list(
            dict.fromkeys(
                recommendations
            )
        )

        # ==================================================
        # Return
        # ==================================================

        return recommendations


# ==========================================================
# Singleton
# ==========================================================

recommendation_engine = RecommendationEngine()