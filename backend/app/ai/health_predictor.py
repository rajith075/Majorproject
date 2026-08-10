# ==========================================================
# Health Risk Predictor
# ==========================================================

import pandas as pd

from app.ai.model_loader import model_loader


class HealthPredictor:

    def __init__(self):

        self.model = model_loader.health_model

        self.features = model_loader.health_features

        self.label_encoder = model_loader.health_label_encoder

    # ======================================================
    # Predict Health Risk
    # ======================================================

    def predict(
        self,
        features,
    ):

        # ==================================================
        # Feature Pipeline already returns a DataFrame
        # ==================================================

        if not isinstance(features, pd.DataFrame):
            raise TypeError(
                "HealthPredictor expected a pandas DataFrame."
            )

        df = features.copy()

        # ==================================================
        # Correct Feature Order
        # ==================================================

        df = df[self.features]

        # ==================================================
        # Predict
        # ==================================================

        prediction = self.model.predict(df)[0]

        probabilities = self.model.predict_proba(df)[0]

        confidence = float(
            max(probabilities) * 100
        )

        label = self.label_encoder.inverse_transform(
            [prediction]
        )[0]

        # ==================================================
        # Probability Distribution
        # ==================================================

        probability_map = {}

        for index, probability in enumerate(
            probabilities
        ):

            class_name = (
                self.label_encoder.inverse_transform(
                    [index]
                )[0]
            )

            probability_map[class_name] = round(
                float(probability * 100),
                2,
            )

        # ==================================================
        # Response
        # ==================================================

        return {

            "prediction": int(prediction),

            "level": label,

            "confidence": round(
                confidence,
                2,
            ),

            "probabilities": probability_map,

            "model": "Health Risk LightGBM",

        }


# ==========================================================
# Global Instance
# ==========================================================

health_predictor = HealthPredictor()