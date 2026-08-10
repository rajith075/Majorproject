# ==========================================================
# AI Model Loader
# ==========================================================

from pathlib import Path
import joblib


class ModelLoader:
    """
    Loads all trained AI models and supporting artifacts
    once during FastAPI startup.
    """

    def __init__(self):

        # ==================================================
        # Project Root
        # ==================================================

        self.base_dir = Path(__file__).resolve().parents[2]

        # ==================================================
        # ML Models Directory
        # backend/ml/models
        # ==================================================

        self.model_dir = self.base_dir / "ml" / "models"

        print("=" * 70)
        print("Loading AI Models...")
        print("=" * 70)

        print(f"Project Directory : {self.base_dir}")
        print(f"Models Directory  : {self.model_dir}")
        print()

        # ==================================================
        # Verify Directory
        # ==================================================

        if not self.model_dir.exists():
            raise FileNotFoundError(
                f"Models directory not found:\n{self.model_dir}"
            )

        # ==================================================
        # Health Risk Model
        # ==================================================

        print("Loading Health Risk Model...")

        # --------------------------------------------------
        # Model
        # --------------------------------------------------

        self.health_model = joblib.load(
            self.model_dir / "health_risk_model_v2.pkl"
        )

        # --------------------------------------------------
        # Feature Columns
        # --------------------------------------------------

        self.health_features = joblib.load(
            self.model_dir / "health_feature_columns_v2.pkl"
        )

        # --------------------------------------------------
        # Feature Encoders
        # --------------------------------------------------

        self.health_feature_encoders = joblib.load(
            self.model_dir / "health_feature_encoders.pkl"
        )

        # --------------------------------------------------
        # Label Encoder
        # --------------------------------------------------

        self.health_label_encoder = joblib.load(
            self.model_dir / "health_label_encoder.pkl"
        )

        # --------------------------------------------------
        # IMPORTANT:
        # DO NOT LOAD health_scaler.pkl
        #
        # The old scaler expects 105 features.
        # V2 Health Model expects 99 features.
        # --------------------------------------------------

        print("✅ Health Risk Model Loaded")

        # ==================================================
        # Clinical Event Model
        # ==================================================

        print("Loading Clinical Event Model...")

        # --------------------------------------------------
        # Model
        # --------------------------------------------------

        self.clinical_model = joblib.load(
            self.model_dir / "clinical_event_model_v2.pkl"
        )

        # --------------------------------------------------
        # Feature Columns
        # --------------------------------------------------

        self.clinical_features = joblib.load(
            self.model_dir / "clinical_event_feature_columns_v2.pkl"
        )

        # --------------------------------------------------
        # Feature Encoders
        # --------------------------------------------------

        self.clinical_feature_encoders = joblib.load(
            self.model_dir / "clinical_event_feature_encoders.pkl"
        )

        # --------------------------------------------------
        # Label Encoder
        # --------------------------------------------------

        self.clinical_label_encoder = joblib.load(
            self.model_dir / "clinical_event_label_encoder.pkl"
        )

        print("✅ Clinical Event Model Loaded")

        # ==================================================
        # Model Information
        # ==================================================

        print()

        print(
            f"Health Features   : "
            f"{len(self.health_features)}"
        )

        print(
            f"Clinical Features : "
            f"{len(self.clinical_features)}"
        )

        print(
            f"Health Encoders   : "
            f"{len(self.health_feature_encoders)}"
        )

        print(
            f"Clinical Encoders : "
            f"{len(self.clinical_feature_encoders)}"
        )

        print()

        # ==================================================
        # Verify Health Model Feature Count
        # ==================================================

        if len(self.health_features) != 99:

            raise ValueError(
                "Health model feature mismatch! "
                f"Expected 99 features, "
                f"but found {len(self.health_features)}."
            )

        print(
            "✅ Health model expects exactly "
            f"{len(self.health_features)} features."
        )

        # ==================================================
        # Verify Clinical Model Feature Count
        # ==================================================

        print(
            "✅ Clinical model expects "
            f"{len(self.clinical_features)} features."
        )

        print()

        print("=" * 70)
        print("AI Runtime Ready")
        print("=" * 70)


# ==========================================================
# Singleton Instance
# ==========================================================

model_loader = ModelLoader()