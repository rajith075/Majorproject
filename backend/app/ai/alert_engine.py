"""
==========================================================
Alert Engine

Combines Health Risk and Clinical Event predictions
to determine alert severity.
==========================================================
"""


class AlertEngine:

    def generate(
        self,
        health_prediction,
        clinical_prediction,
    ):

        alerts = []

        health = health_prediction["level"]

        event = clinical_prediction["event"]

        # ==================================================
        # Health Risk Alerts
        # ==================================================

        if health == "Critical":

            alerts.append({

                "severity": "Critical",

                "title": "Critical Health Risk",

                "message": "Immediate medical attention is required.",

            })

        elif health == "High":

            alerts.append({

                "severity": "High",

                "title": "High Health Risk",

                "message": "Close monitoring is recommended.",

            })

        elif health == "Moderate":

            alerts.append({

                "severity": "Moderate",

                "title": "Moderate Health Risk",

                "message": "Monitor the patient's condition carefully.",

            })

        # ==================================================
        # Clinical Event Alert
        # ==================================================

        if event and event != "None":

            alerts.append({

                "severity": "Clinical",

                "title": event,

                "message": f"Predicted clinical event: {event}",

            })

        return alerts


alert_engine = AlertEngine()