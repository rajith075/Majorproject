"""
==========================================================
Feature Pipeline

Converts:

Patient Profile
+
Latest Live Vitals

↓

Model Ready Features
==========================================================
"""

import pandas as pd

from app.ai.feature_engineering import FeatureEngineering
from app.ai.model_loader import model_loader


class FeaturePipeline:

    def __init__(self):

        self.health_features = model_loader.health_features

        self.clinical_features = model_loader.clinical_features

        self.engineering = FeatureEngineering()

    def build_base_features(
        self,
        profile: dict,
    ):

        patient = profile["patient"]

        vitals = profile["latest_vitals"]

        features = {}

        return features


feature_pipeline = FeaturePipeline()