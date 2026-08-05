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

        # ======================================================
        # Project Root
        # ======================================================

        self.base_dir = Path(__file__).resolve().parents[2]

        # ======================================================
        # ML Models Directory
        # backend/ml/models
        # ======================================================

        self.model_dir = self.base_dir / "ml" / "models"

        print("=" * 70)
        print("Loading AI Models...")
        print("=" * 70)

        print(f"Project Directory : {self.base_dir}")
        print(f"Models Directory  : {self.model_dir}")
        print()

        # ======================================================
        # Verify Directory
        # ======================================================

        if not self.model_dir.exists():
            raise FileNotFoundError(
                f"Models directory not found:\n{self.model_dir}"
            )

        # ======================================================
        # Health Risk Model
        # ======================================================

        print("Loading Health Risk Model...")

        self.health_model = joblib.load(
            self.model_dir / "health_risk_model_v2.pkl"
        )

        self.health_features = joblib.load(
            self.model_dir / "health_feature_columns_v2.pkl"
        )

        self.health_feature_encoders = joblib.load(
            self.model_dir / "health_feature_encoders.pkl"
        )

        self.health_label_encoder = joblib.load(
            self.model_dir / "health_label_encoder.pkl"
        )

        print("✅ Health Risk Model Loaded")

        # ======================================================
        # Clinical Event Model
        # ======================================================

        print("Loading Clinical Event Model...")

        self.clinical_model = joblib.load(
            self.model_dir / "clinical_event_model_v2.pkl"
        )

        self.clinical_features = joblib.load(
            self.model_dir / "clinical_event_feature_columns_v2.pkl"
        )

        self.clinical_feature_encoders = joblib.load(
            self.model_dir / "clinical_event_feature_encoders.pkl"
        )

        self.clinical_label_encoder = joblib.load(
            self.model_dir / "clinical_event_label_encoder.pkl"
        )

        print("✅ Clinical Event Model Loaded")

        print()

        print(f"Health Features   : {len(self.health_features)}")
        print(f"Clinical Features : {len(self.clinical_features)}")

        print()
        print("=" * 70)
        print("AI Runtime Ready")
        print("=" * 70)


# ==========================================================
# Singleton Instance
# ==========================================================

model_loader = ModelLoader()