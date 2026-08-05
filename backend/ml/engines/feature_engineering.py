"""
=========================================================
Feature Engineering V2
=========================================================
Creates clinically meaningful derived features for
ML models.

Author : Rajith Shetty
=========================================================
"""

import numpy as np


class FeatureEngineering:

    def apply(self, df):

        # -------------------------------------------------
        # Pulse Pressure
        # -------------------------------------------------

        df["Pulse_Pressure"] = (
            df["Systolic_BP"] - df["Diastolic_BP"]
        )

        # -------------------------------------------------
        # Mean Arterial Pressure
        # -------------------------------------------------

        df["MAP"] = (
            df["Diastolic_BP"] +
            (df["Pulse_Pressure"] / 3)
        ).round(1)

        # -------------------------------------------------
        # Baseline Deviations
        # -------------------------------------------------

        df["Heart_Rate_Deviation"] = (
            df["Heart_Rate"] - df["Baseline_Heart_Rate"]
        )

        df["Systolic_BP_Deviation"] = (
            df["Systolic_BP"] - df["Baseline_Systolic_BP"]
        )

        df["Diastolic_BP_Deviation"] = (
            df["Diastolic_BP"] - df["Baseline_Diastolic_BP"]
        )

        df["SpO2_Deviation"] = (
            df["Baseline_SpO2"] - df["SpO2"]
        )

        df["Temperature_Deviation"] = (
            df["Temperature"] - df["Baseline_Temperature"]
        ).round(2)

        df["Respiratory_Deviation"] = (
            df["Respiratory_Rate"] -
            df["Baseline_Respiratory_Rate"]
        )

        # -------------------------------------------------
        # Sleep Quality
        # -------------------------------------------------

        df["Sleep_Quality"] = np.where(
            df["Sleep_Hours"] >= 7,
            "Good",
            np.where(
                df["Sleep_Hours"] >= 5,
                "Average",
                "Poor"
            )
        )

        df["Sleep_Deficit"] = (
            8 - df["Sleep_Hours"]
        ).clip(lower=0)

        # -------------------------------------------------
        # Activity
        # -------------------------------------------------

        df["Activity_Level"] = np.where(
            df["Activity_Steps"] >= 7000,
            "High",
            np.where(
                df["Activity_Steps"] >= 3000,
                "Moderate",
                "Low"
            )
        )

        df["Activity_Deficit"] = (
            7000 - df["Activity_Steps"]
        ).clip(lower=0)

        # -------------------------------------------------
        # Comorbidity Count
        # -------------------------------------------------

        disease_columns = [
            "Diabetes",
            "Hypertension",
            "Heart_Disease",
            "Stroke",
            "Parkinsons",
            "Alzheimers",
            "Asthma",
            "COPD",
            "Kidney_Disease",
            "Liver_Disease",
            "Arthritis",
            "Thyroid",
            "Cancer",
            "Osteoporosis",
            "Depression",
            "Anemia"
        ]

        df["Comorbidity_Count"] = (
            df[disease_columns].sum(axis=1)
        )

        # -------------------------------------------------
        # High Risk Disease Count
        # -------------------------------------------------

        high_risk = [
            "Heart_Disease",
            "Stroke",
            "COPD",
            "Kidney_Disease",
            "Diabetes"
        ]

        df["High_Risk_Disease_Count"] = (
            df[high_risk].sum(axis=1)
        )

        # -------------------------------------------------
        # Clinical Flags
        # -------------------------------------------------

        df["Fever_Flag"] = (
            df["Temperature"] >= 38
        ).astype(int)

        df["Low_Oxygen_Flag"] = (
            df["SpO2"] < 92
        ).astype(int)

        df["Tachycardia_Flag"] = (
            df["Heart_Rate"] > 100
        ).astype(int)

        df["Hypertension_Flag"] = (
            df["Systolic_BP"] >= 140
        ).astype(int)

        # -------------------------------------------------
        # Vital Abnormality Count
        # -------------------------------------------------

        abnormal = (
            (df["Heart_Rate"] > 100).astype(int)
            + (df["Systolic_BP"] > 140).astype(int)
            + (df["SpO2"] < 92).astype(int)
            + (df["Temperature"] > 38).astype(int)
            + (df["Respiratory_Rate"] > 22).astype(int)
        )

        df["Vital_Abnormality_Count"] = abnormal

        return df