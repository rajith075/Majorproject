"""
=========================================================
Digital Twin Engine
=========================================================

Creates an internal physiological profile for every patient.

This profile is NOT part of the ML labels.

It represents the patient's simulated body systems and is
used by the Scenario Generator and Sensor Generator.

Author : Rajith Elderly AI Project
"""

import random

random.seed(42)


class TwinEngine:

    def __init__(self):
        pass

    # --------------------------------------------------

    def clamp(self, value, low=0, high=100):
        return max(low, min(high, value))

    # --------------------------------------------------

    def calculate_cardiovascular(self, row):

        score = 100

        score -= (row["Age"] - 60) * 0.35

        if row["Hypertension"]:
            score -= 15

        if row["Heart_Disease"]:
            score -= 20

        if row["Stroke"]:
            score -= 8

        if row["Smoking"]:
            score -= 6

        if row["BMI"] >= 30:
            score -= 5

        return round(self.clamp(score), 1)

    # --------------------------------------------------

    def calculate_respiratory(self, row):

        score = 100

        score -= (row["Age"] - 60) * 0.20

        if row["COPD"]:
            score -= 25

        if row["Asthma"]:
            score -= 15

        if row["Smoking"]:
            score -= 10

        return round(self.clamp(score), 1)

    # --------------------------------------------------

    def calculate_neurological(self, row):

        score = 100

        if row["Stroke"]:
            score -= 18

        if row["Parkinsons"]:
            score -= 22

        if row["Alzheimers"]:
            score -= 25

        score -= (row["Age"] - 60) * 0.25

        return round(self.clamp(score), 1)

    # --------------------------------------------------

    def calculate_metabolic(self, row):

        score = 100

        if row["Diabetes"]:
            score -= 18

        if row["Thyroid"]:
            score -= 8

        if row["Kidney_Disease"]:
            score -= 12

        score -= (row["BMI"] - 25) * 0.6

        return round(self.clamp(score), 1)

    # --------------------------------------------------

    def calculate_mobility(self, row):

        score = 100

        mobility = row["Mobility"]

        if mobility == "Independent":
            score -= 0

        elif mobility == "Assisted":
            score -= 20

        elif mobility == "Wheelchair":
            score -= 40

        if row["Arthritis"]:
            score -= 15

        if row["Parkinsons"]:
            score -= 18

        return round(self.clamp(score), 1)

    # --------------------------------------------------

    def calculate_sleep(self, row):

        score = 100

        if row["Depression"]:
            score -= 12

        if row["Diabetes"]:
            score -= 6

        score -= random.randint(0, 10)

        return round(self.clamp(score), 1)

    # --------------------------------------------------

    def apply(self, df):

        df["Cardiovascular_Score"] = df.apply(
            self.calculate_cardiovascular,
            axis=1
        )

        df["Respiratory_Score"] = df.apply(
            self.calculate_respiratory,
            axis=1
        )

        df["Neurological_Score"] = df.apply(
            self.calculate_neurological,
            axis=1
        )

        df["Metabolic_Score"] = df.apply(
            self.calculate_metabolic,
            axis=1
        )

        df["Mobility_Score"] = df.apply(
            self.calculate_mobility,
            axis=1
        )

        df["Sleep_Score"] = df.apply(
            self.calculate_sleep,
            axis=1
        )

        return df