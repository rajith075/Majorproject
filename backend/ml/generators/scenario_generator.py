"""
=========================================================
Scenario Generator V3
=========================================================

Uses the patient's Digital Twin to assign a realistic
clinical scenario.

Author : Rajith Elderly AI Project
"""

import random

random.seed(42)


class ScenarioGenerator:

    def __init__(self):
        pass

    # -------------------------------------------------

    def calculate_health_index(self, row):

        scores = [

            row["Cardiovascular_Score"],
            row["Respiratory_Score"],
            row["Neurological_Score"],
            row["Metabolic_Score"],
            row["Mobility_Score"],
            row["Sleep_Score"]

        ]

        return sum(scores) / len(scores)

    # -------------------------------------------------

    def assign_scenario(self, row):

        health = self.calculate_health_index(row)

        disease_count = (

            row["Diabetes"] +
            row["Hypertension"] +
            row["Heart_Disease"] +
            row["Stroke"] +
            row["COPD"] +
            row["Kidney_Disease"] +
            row["Parkinsons"] +
            row["Alzheimers"]

        )

        age = row["Age"]

        # -------------------------------
        # Low-risk patient
        # -------------------------------

        if health >= 90:

            weights = {

                "Stable": 0.70,

                "Improving": 0.15,

                "Mild_Deterioration": 0.12,

                "Moderate_Deterioration": 0.02,

                "Acute_Event": 0.01

            }

        # -------------------------------

        elif health >= 80:

            weights = {

                "Stable": 0.45,

                "Improving": 0.15,

                "Mild_Deterioration": 0.25,

                "Moderate_Deterioration": 0.10,

                "Acute_Event": 0.05

            }

        # -------------------------------

        elif health >= 70:

            weights = {

                "Stable": 0.25,

                "Improving": 0.10,

                "Mild_Deterioration": 0.35,

                "Moderate_Deterioration": 0.20,

                "Acute_Event": 0.10

            }

        # -------------------------------

        else:

            weights = {

                "Stable": 0.08,

                "Improving": 0.05,

                "Mild_Deterioration": 0.27,

                "Moderate_Deterioration": 0.35,

                "Acute_Event": 0.25

            }

        # --------------------------------------------------
        # Age adjustment
        # --------------------------------------------------

        if age >= 85:

            weights["Acute_Event"] += 0.05
            weights["Moderate_Deterioration"] += 0.05
            weights["Stable"] -= 0.05

        # --------------------------------------------------
        # Disease burden adjustment
        # --------------------------------------------------

        if disease_count >= 5:

            weights["Acute_Event"] += 0.05
            weights["Moderate_Deterioration"] += 0.05
            weights["Stable"] -= 0.05

        # --------------------------------------------------

        scenario = random.choices(

            population=list(weights.keys()),

            weights=list(weights.values()),

            k=1

        )[0]

        return scenario

    # -------------------------------------------------

    def apply(self, df):

        df["Health_Index"] = df.apply(

            self.calculate_health_index,

            axis=1

        )

        df["Scenario"] = df.apply(

            self.assign_scenario,

            axis=1

        )

        return df