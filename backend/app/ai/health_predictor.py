"""
==========================================================
Health Risk Predictor

Uses the trained LightGBM Health Risk model
to predict patient health risk.
==========================================================
"""

import pandas as pd

from app.ai.model_loader import model_loader


class HealthPredictor:

    def __init__(self):

        self.model = model_loader.health_model

        self.features = model_loader.health_features

        self.label_encoder = model_loader.health_label_encoder

    def predict(self, features: dict):

        """
        Predict health risk.
        """

        df = pd.DataFrame([features])

        # Ensure correct feature order
        df = df[self.features]

        prediction = self.model.predict(df)[0]

        probabilities = self.model.predict_proba(df)[0]

        label = self.label_encoder.inverse_transform(
            [prediction]
        )[0]

        confidence = float(max(probabilities) * 100)

        return {

            "level": label,

            "confidence": round(confidence, 2)

        }


health_predictor = HealthPredictor()