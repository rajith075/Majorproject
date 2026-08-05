"""
=========================================================
Patient Generator
AI-Powered Elderly Healthcare Monitoring System
=========================================================
Generates realistic elderly patient demographic data.

Author : Rajith Shetty
=========================================================
"""

import random
import uuid
import pandas as pd

from ml.configs.constants import (
    RANDOM_SEED,
    MIN_AGE,
    MAX_AGE,
    GENDERS,
    BLOOD_GROUPS,
    ETHNICITIES,
)

from ml.configs.ranges import (
    HEIGHT_RANGE,
    WEIGHT_RANGE,
)

random.seed(RANDOM_SEED)


class PatientGenerator:
    """
    Generates synthetic elderly patient demographic data.
    This is the first stage of the dataset generation pipeline.
    """

    def __init__(self, number_of_patients=5000):
        self.number_of_patients = number_of_patients

    # --------------------------------------------------
    # Patient ID
    # --------------------------------------------------

    def generate_patient_id(self):
        return str(uuid.uuid4())[:8].upper()

    # --------------------------------------------------
    # Age Group
    # --------------------------------------------------

    def get_age_group(self, age):

        if age < 70:
            return "60-69"

        elif age < 80:
            return "70-79"

        elif age < 90:
            return "80-89"

        return "90+"

    # --------------------------------------------------
    # BMI
    # --------------------------------------------------

    def calculate_bmi(self, height_cm, weight_kg):

        height_m = height_cm / 100

        bmi = weight_kg / (height_m ** 2)

        return round(bmi, 1)

    # --------------------------------------------------
    # Generate One Patient
    # --------------------------------------------------

    def generate_patient(self):

        age = random.randint(MIN_AGE, MAX_AGE)

        gender = random.choice(GENDERS)

        height = random.randint(*HEIGHT_RANGE)

        weight = random.randint(*WEIGHT_RANGE)

        bmi = self.calculate_bmi(height, weight)

        return {
            "Patient_ID": self.generate_patient_id(),
            "Age": age,
            "Age_Group": self.get_age_group(age),
            "Gender": gender,
            "Height_cm": height,
            "Weight_kg": weight,
            "BMI": bmi,
            "Blood_Group": random.choice(BLOOD_GROUPS),
            "Ethnicity": random.choice(ETHNICITIES),
        }

    # --------------------------------------------------
    # Generate Complete Dataset
    # --------------------------------------------------

    def generate(self):

        patients = []

        for _ in range(self.number_of_patients):
            patients.append(self.generate_patient())

        return pd.DataFrame(patients)


# ======================================================
# Testing
# ======================================================

if __name__ == "__main__":

    generator = PatientGenerator(number_of_patients=10)

    df = generator.generate()

    print(df.head())

    print()

    print(df.shape)