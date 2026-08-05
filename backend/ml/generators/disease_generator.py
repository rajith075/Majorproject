"""
=========================================================
Disease Generator V2
AI-Powered Elderly Healthcare Monitoring System
=========================================================
Generates medically realistic disease profiles for
elderly patients using age-based prevalence and
clinical comorbidity rules.
"""

import random
import pandas as pd

from ml.configs.constants import RANDOM_SEED

random.seed(RANDOM_SEED)


class DiseaseGenerator:

    def __init__(self):
        pass

    # -----------------------------------------------------
    # Age Group
    # -----------------------------------------------------

    def get_age_group(self, age):

        if age < 70:
            return "60-69"

        elif age < 80:
            return "70-79"

        elif age < 90:
            return "80-89"

        return "90+"

    # -----------------------------------------------------
    # Disease Probability Table
    # -----------------------------------------------------

    def disease_probability(self, age_group):

        probabilities = {

            "60-69": {
                "Diabetes": 0.28,
                "Hypertension": 0.45,
                "Heart_Disease": 0.18,
                "Stroke": 0.07,
                "COPD": 0.10,
                "Asthma": 0.10,
                "Kidney_Disease": 0.10,
                "Parkinsons": 0.05,
                "Alzheimers": 0.04,
                "Thyroid": 0.10,
                "Liver_Disease": 0.04,
                "Arthritis": 0.35,
                "Cancer": 0.05,
                "Osteoporosis": 0.15,
                "Depression": 0.12,
                "Anemia": 0.10
            },

            "70-79": {
                "Diabetes": 0.38,
                "Hypertension": 0.60,
                "Heart_Disease": 0.30,
                "Stroke": 0.12,
                "COPD": 0.12,
                "Asthma": 0.10,
                "Kidney_Disease": 0.16,
                "Parkinsons": 0.08,
                "Alzheimers": 0.12,
                "Thyroid": 0.10,
                "Liver_Disease": 0.04,
                "Arthritis": 0.45,
                "Cancer": 0.06,
                "Osteoporosis": 0.20,
                "Depression": 0.15,
                "Anemia": 0.12
            },

            "80-89": {
                "Diabetes": 0.42,
                "Hypertension": 0.72,
                "Heart_Disease": 0.42,
                "Stroke": 0.18,
                "COPD": 0.15,
                "Asthma": 0.10,
                "Kidney_Disease": 0.22,
                "Parkinsons": 0.12,
                "Alzheimers": 0.25,
                "Thyroid": 0.12,
                "Liver_Disease": 0.05,
                "Arthritis": 0.55,
                "Cancer": 0.08,
                "Osteoporosis": 0.28,
                "Depression": 0.18,
                "Anemia": 0.15
            },

            "90+": {
                "Diabetes": 0.45,
                "Hypertension": 0.80,
                "Heart_Disease": 0.50,
                "Stroke": 0.24,
                "COPD": 0.18,
                "Asthma": 0.10,
                "Kidney_Disease": 0.30,
                "Parkinsons": 0.18,
                "Alzheimers": 0.40,
                "Thyroid": 0.15,
                "Liver_Disease": 0.06,
                "Arthritis": 0.65,
                "Cancer": 0.10,
                "Osteoporosis": 0.40,
                "Depression": 0.22,
                "Anemia": 0.20
            }

        }

        return probabilities[age_group]

    # -----------------------------------------------------
    # Disease Severity
    # -----------------------------------------------------

    def assign_severity(self):

        return random.choices(
            ["Mild", "Moderate", "Severe"],
            weights=[55, 30, 15],
            k=1
        )[0]

    # -----------------------------------------------------
    # Generate Diseases
    # -----------------------------------------------------

    def generate_diseases(self, patient):

        age_group = self.get_age_group(patient["Age"])

        probs = self.disease_probability(age_group)

        disease_flags = {}

        for disease, probability in probs.items():
            disease_flags[disease] = random.random() < probability

        # -----------------------------
        # Clinical Dependencies
        # -----------------------------

        if disease_flags["Diabetes"] and random.random() < 0.40:
            disease_flags["Kidney_Disease"] = True

        if disease_flags["Diabetes"] and random.random() < 0.45:
            disease_flags["Hypertension"] = True

        if disease_flags["Hypertension"] and random.random() < 0.35:
            disease_flags["Heart_Disease"] = True

        if disease_flags["Heart_Disease"] and random.random() < 0.20:
            disease_flags["Stroke"] = True

        if disease_flags["COPD"] and random.random() < 0.30:
            disease_flags["Heart_Disease"] = True

        if disease_flags["Alzheimers"] and random.random() < 0.40:
            disease_flags["Depression"] = True

        # -----------------------------
        # Final Output
        # -----------------------------

        result = {}

        for disease, present in disease_flags.items():

            result[disease] = int(present)

            result[f"{disease}_Severity"] = (
                self.assign_severity()
                if present
                else "None"
            )

        return result

    # -----------------------------------------------------
    # Apply
    # -----------------------------------------------------

    def apply(self, patient_df):

        disease_rows = []

        for _, patient in patient_df.iterrows():
            disease_rows.append(
                self.generate_diseases(patient)
            )

        disease_df = pd.DataFrame(disease_rows)

        return pd.concat(
            [
                patient_df.reset_index(drop=True),
                disease_df.reset_index(drop=True)
            ],
            axis=1
        )


# =========================================================
# Testing
# =========================================================

if __name__ == "__main__":

    from ml.generators.patient_generator import PatientGenerator

    patients = PatientGenerator(10).generate()

    df = DiseaseGenerator().apply(patients)

    print(df.head())

    print(df.shape)