"""
==========================================================
Recommendation Engine

Generates recommendations based on
Health Risk and Clinical Event predictions.
==========================================================
"""


class RecommendationEngine:

    def generate(
        self,
        health_prediction,
        clinical_prediction,
    ):

        recommendations = []

        health = health_prediction["level"]
        event = clinical_prediction["event"]

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
        # Clinical Event Recommendation
        # ==================================================

        if event and event != "None":

            recommendations.append(

                f"Observe the patient for symptoms related to {event}."

            )

        return recommendations


recommendation_engine = RecommendationEngine()