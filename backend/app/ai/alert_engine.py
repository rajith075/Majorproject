class AlertEngine:

    # Clinical events that indicate a potentially serious situation.
    # These come from the existing Clinical Event ML model.
    CRITICAL_CLINICAL_EVENTS = {
        "Hypertensive Crisis",
        "Heart Attack",
        "Stroke",
        "Severe Hypoxia",
        "Respiratory Distress",
        "Cardiac Event",
        "Severe Respiratory Event",
    }

    @staticmethod
    def generate(health_prediction, clinical_prediction):

        alerts = []

        health = health_prediction.get("level")
        event = clinical_prediction.get("event")

        # ---------------------------------------------------------
        # HEALTH RISK
        # ---------------------------------------------------------

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

        # ---------------------------------------------------------
        # CLINICAL EVENT
        # ---------------------------------------------------------

        if event:

            event_name = str(event).strip()

            # Normal clinical prediction → no emergency
            if event_name.lower() in {
                "none",
                "stable",
                "normal",
                "no event",
            }:
                return alerts

            # Serious clinical event → CRITICAL
            if event_name in AlertEngine.CRITICAL_CLINICAL_EVENTS:
                alerts.append({
                    "severity": "Critical",
                    "title": event_name,
                    "message": (
                        f"Predicted critical clinical event: "
                        f"{event_name}"
                    ),
                })

            # Other predicted clinical events remain informational
            else:
                alerts.append({
                    "severity": "Clinical",
                    "title": event_name,
                    "message": (
                        f"Predicted clinical event: "
                        f"{event_name}"
                    ),
                })

        return alerts


alert_engine = AlertEngine()