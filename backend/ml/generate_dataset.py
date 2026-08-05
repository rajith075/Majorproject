"""
=========================================================
AI-Powered Elderly Healthcare Dataset Pipeline
=========================================================

Author : Rajith Shetty
Project : AI-Powered Elderly Healthcare Monitoring

This file orchestrates the complete synthetic
dataset generation pipeline.
"""

import os

from ml.generators.patient_generator import PatientGenerator
from ml.generators.disease_generator import DiseaseGenerator
from ml.generators.medication_generator import MedicationGenerator
from ml.generators.lifestyle_generator import LifestyleGenerator
from ml.generators.baseline_generator import BaselineGenerator

from ml.digital_twin.twin_engine import TwinEngine

from ml.generators.scenario_generator import ScenarioGenerator
from ml.generators.sensor_generator import SensorGenerator
from ml.generators.trend_generator import TrendGenerator

from ml.engines.feature_engineering import FeatureEngineering
from ml.engines.clinical_score_engine import ClinicalScoreEngine
from ml.engines.dataset_validator import DatasetValidator

OUTPUT_FOLDER = "ml/data/generated"

os.makedirs(OUTPUT_FOLDER, exist_ok=True)


class DatasetPipeline:

    def __init__(self, patients=5000):

        self.patients = patients

    # ---------------------------------------------------------

    def run(self):

        print("=" * 65)
        print(" AI-Powered Elderly Healthcare Dataset Generator ")
        print("=" * 65)

        # ---------------------------------------------------------
        print("\n[1/11] Generating Patients...")
        df = PatientGenerator(self.patients).generate()

        # ---------------------------------------------------------
        print("[2/11] Assigning Diseases...")
        df = DiseaseGenerator().apply(df)
        print(df["Diabetes_Severity"].value_counts(dropna=False))
        print(df["Hypertension_Severity"].value_counts(dropna=False))

        # ---------------------------------------------------------
        print("[3/11] Assigning Medications...")
        df = MedicationGenerator().apply(df)

        # ---------------------------------------------------------
        print("[4/11] Assigning Lifestyle...")
        df = LifestyleGenerator().apply(df)

        # ---------------------------------------------------------
        print("[5/11] Building Personalized Baselines...")
        df = BaselineGenerator().apply(df)

        # ---------------------------------------------------------
        print("[6/11] Building Digital Twins...")
        df = TwinEngine().apply(df)

        # ---------------------------------------------------------
        print("[7/11] Assigning Clinical Scenarios...")
        df = ScenarioGenerator().apply(df)

        # ---------------------------------------------------------
        print("[8/11] Simulating IoT Sensor Timeline...")
        df = SensorGenerator(observations=20).apply(df)

        # ---------------------------------------------------------
        print("[9/11] Engineering Features...")
        df = FeatureEngineering().apply(df)

        # ---------------------------------------------------------
        print("[10/11] Computing Clinical Scores...")
        df = ClinicalScoreEngine().apply(df)

        # ---------------------------------------------------------
        print("[11/11] Validating Dataset...")
        DatasetValidator().validate(df)

        # ---------------------------------------------------------
        print("\nSaving datasets...")

        master_path = os.path.join(
            OUTPUT_FOLDER,
            "master_dataset.csv"
        )

        health_path = os.path.join(
            OUTPUT_FOLDER,
            "health_model_dataset.csv"
        )

        alert_path = os.path.join(
            OUTPUT_FOLDER,
            "alert_model_dataset.csv"
        )

        df.to_csv(master_path, index=False)

        # ---------------------------------------------------------
        # Health Risk Model
        # ---------------------------------------------------------

        health_columns = [

            c for c in df.columns

            if c not in [

                "Alert_Level",
                "Possible_Event",
                "Recommendation"

            ]

        ]

        df[health_columns].to_csv(

            health_path,

            index=False

        )

        # ---------------------------------------------------------
        # Alert Model
        # ---------------------------------------------------------

        alert_columns = [

            c for c in df.columns

            if c not in [

                "Risk_Level"

            ]

        ]

        df[alert_columns].to_csv(

            alert_path,

            index=False

        )

        print("\n")
        print("=" * 65)

        print(" DATASET GENERATED SUCCESSFULLY ")

        print("=" * 65)

        print(f"\nMaster Dataset : {master_path}")

        print(f"Health Dataset : {health_path}")

        print(f"Alert Dataset  : {alert_path}")

        print(f"\nTotal Records : {len(df):,}")

        print("=" * 65)

        return df


if __name__ == "__main__":

    DatasetPipeline(

        patients=5000

    ).run()