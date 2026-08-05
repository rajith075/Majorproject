"""
=========================================================
Dataset Validator
=========================================================

Validates the generated synthetic dataset before
training ML models.

Author : Rajith Elderly AI Project
"""

import pandas as pd


class DatasetValidator:

    def __init__(self):
        pass

    # -----------------------------------------------------

    def validate(self, df: pd.DataFrame):

        print("\n" + "=" * 60)
        print(" DATASET VALIDATION REPORT ")
        print("=" * 60)

        # ----------------------------------------------

        print(f"Total Records : {len(df):,}")

        # ----------------------------------------------

        missing = df.isnull().sum().sum()

        print(f"Missing Values : {missing}")

        if missing == 0:
            print("✅ No Missing Values")
        else:
            print("❌ Missing values detected")

        # ----------------------------------------------

        duplicates = df.duplicated().sum()

        print(f"Duplicate Rows : {duplicates}")

        if duplicates == 0:
            print("✅ No Duplicate Rows")
        else:
            print("❌ Duplicate rows detected")

        # ----------------------------------------------

        if "Heart_Rate" in df.columns:

            if df["Heart_Rate"].between(45, 180).all():
                print("✅ Heart Rate Range Valid")
            else:
                print("❌ Invalid Heart Rate Values")

        # ----------------------------------------------

        if "SpO2" in df.columns:

            if df["SpO2"].between(75, 100).all():
                print("✅ SpO₂ Range Valid")
            else:
                print("❌ Invalid SpO₂ Values")

        # ----------------------------------------------

        if "Temperature" in df.columns:

            if df["Temperature"].between(35, 41.5).all():
                print("✅ Temperature Range Valid")
            else:
                print("❌ Invalid Temperature Values")

        # ----------------------------------------------

        if "Respiratory_Rate" in df.columns:

            if df["Respiratory_Rate"].between(8, 40).all():
                print("✅ Respiratory Rate Valid")
            else:
                print("❌ Invalid Respiratory Rate")

        # ----------------------------------------------

        if "Clinical_Score" in df.columns:

            if df["Clinical_Score"].between(0, 100).all():
                print("✅ Clinical Score Valid")
            else:
                print("❌ Clinical Score Out Of Range")

        # ----------------------------------------------

        if "Risk_Level" in df.columns:

            print("\nRisk Distribution")

            print(df["Risk_Level"].value_counts())

        # ----------------------------------------------

        if "Alert_Level" in df.columns:

            print("\nAlert Distribution")

            print(df["Alert_Level"].value_counts())

        # ----------------------------------------------

        if "Scenario" in df.columns:

            print("\nScenario Distribution")

            print(df["Scenario"].value_counts())

        print("\n✅ Dataset Validation Complete")
        print("=" * 60)

        return True