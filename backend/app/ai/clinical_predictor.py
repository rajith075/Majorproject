# ==========================================================
# Clinical Event Predictor
# ==========================================================

import pandas as pd

from app.ai.model_loader import model_loader


class ClinicalPredictor:

    def __init__(self):

        # --------------------------------------------------
        # Model
        # --------------------------------------------------

        self.model = model_loader.clinical_model

        # --------------------------------------------------
        # Expected Features
        # --------------------------------------------------

        self.features = model_loader.clinical_features

        # --------------------------------------------------
        # Feature Encoders
        # --------------------------------------------------

        self.feature_encoders = (
            model_loader.clinical_feature_encoders
        )

        # --------------------------------------------------
        # Label Encoder
        # --------------------------------------------------

        self.label_encoder = (
            model_loader.clinical_label_encoder
        )

        # --------------------------------------------------
        # Binary Features
        # --------------------------------------------------

        self.binary_features = {
            "Smoking",
            "Alcohol",
        }

        print("=" * 70)
        print("Clinical Predictor Loaded")
        print("=" * 70)

        print(
            "Clinical Features:",
            len(self.features)
        )

        print(
            "Clinical Encoders:",
            len(self.feature_encoders)
        )

        print("=" * 70)

    # ======================================================
    # Encode Binary Features
    # ======================================================

    @staticmethod
    def _encode_binary(value, column):

        # Already numeric
        if isinstance(value, (int, float)):

            return int(value)

        # Convert string
        value = str(value).strip().lower()

        if value in {
            "yes",
            "true",
            "1",
            "smoker",
            "smoking",
            "alcohol",
            "drinks",
            "drinker",
        }:

            return 1

        if value in {
            "no",
            "false",
            "0",
            "non-smoker",
            "nonsmoker",
            "none",
            "no alcohol",
            "non-drinker",
        }:

            return 0

        raise ValueError(
            f"Unknown value in clinical feature "
            f"'{column}': {value}. "
            f"Expected a binary Yes/No value."
        )

    # ======================================================
    # Encode Features
    # ======================================================

    def _encode_features(self, df):

        df = df.copy()

        # ==================================================
        # Saved Encoders
        # ==================================================

        for column, encoder in self.feature_encoders.items():

            if column not in df.columns:
                continue

            value = df[column].iloc[0]

            # ------------------------------------------------
            # Missing Value
            # ------------------------------------------------

            if pd.isna(value):

                raise ValueError(
                    f"Missing value in clinical feature "
                    f"'{column}'"
                )

            # ------------------------------------------------
            # Encode
            # ------------------------------------------------

            try:

                df[column] = encoder.transform(
                    [value]
                )[0]

            except ValueError as e:

                expected = list(
                    encoder.classes_
                )

                raise ValueError(
                    f"Unknown value in clinical "
                    f"feature '{column}': {value}. "
                    f"Expected one of: {expected}"
                ) from e

        # ==================================================
        # Binary Features Without Saved Encoders
        # ==================================================

        for column in self.binary_features:

            if column not in df.columns:
                continue

            # Only manually encode if the saved
            # encoder does not already handle it.

            if column not in self.feature_encoders:

                value = df[column].iloc[0]

                if pd.isna(value):

                    raise ValueError(
                        f"Missing value in clinical "
                        f"feature '{column}'"
                    )

                df[column] = self._encode_binary(
                    value,
                    column,
                )

        return df

    # ======================================================
    # Prediction
    # ======================================================

    def predict(
        self,
        features,
    ):

        # ==================================================
        # Create DataFrame
        # ==================================================

        if isinstance(features, dict):

            df = pd.DataFrame([features])

        else:

            df = features.copy()

        # ==================================================
        # Check Required Features
        # ==================================================

        missing = [
            column
            for column in self.features
            if column not in df.columns
        ]

        if missing:

            raise ValueError(
                "Missing clinical features: "
                + ", ".join(missing)
            )

        # ==================================================
        # Correct Feature Order
        # ==================================================

        df = df.reindex(
            columns=self.features
        )

        # ==================================================
        # Encode Features
        # ==================================================

        df = self._encode_features(df)

        # ==================================================
        # Final Data Type Check
        # ==================================================

        bad_columns = [
            column
            for column in df.columns
            if df[column].dtype == "object"
        ]

        if bad_columns:

            raise ValueError(
                "Clinical model still has "
                "non-numeric features: "
                + ", ".join(bad_columns)
            )

        # ==================================================
        # Prediction
        # ==================================================

        prediction = self.model.predict(df)[0]

        probabilities = (
            self.model.predict_proba(df)[0]
        )

        # ==================================================
        # Confidence
        # ==================================================

        confidence = float(
            max(probabilities) * 100
        )

        # ==================================================
        # Decode Prediction
        # ==================================================

        label = (
            self.label_encoder
            .inverse_transform(
                [prediction]
            )[0]
        )

        # ==================================================
        # Probability Distribution
        # ==================================================

        probability_map = {}

        for index, probability in enumerate(
            probabilities
        ):

            class_name = (
                self.label_encoder
                .inverse_transform(
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

            "event": label,

            "confidence": round(
                confidence,
                2,
            ),

            "probabilities": probability_map,

            "model": "Clinical Event LightGBM",

        }


# ==========================================================
# Singleton
# ==========================================================

clinical_predictor = ClinicalPredictor()