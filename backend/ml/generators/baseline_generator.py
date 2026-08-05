"""
=========================================================
Baseline Generator
=========================================================
Generates personalized baseline vital signs for each patient.
"""

import random
import pandas as pd

random.seed(42)


class BaselineGenerator:

    def __init__(self):
        pass

    def generate_baseline(self, patient):

        age = patient["Age"]

        hr = random.randint(60, 72)
        sbp = random.randint(110, 125)
        dbp = random.randint(70, 82)
        spo2 = random.randint(97, 99)
        temp = round(random.uniform(36.4, 36.9), 1)
        rr = random.randint(14, 18)

        # Diabetes
        if patient["Diabetes"]:
            hr += random.randint(2, 6)

        # Hypertension
        if patient["Hypertension"]:
            sbp += random.randint(10, 20)
            dbp += random.randint(5, 10)

        # Heart Disease
        if patient["Heart_Disease"]:
            hr += random.randint(5, 12)

        # COPD
        if patient["COPD"]:
            spo2 -= random.randint(2, 5)
            rr += random.randint(2, 4)

        # Parkinson's
        if patient["Parkinsons"]:
            hr += random.randint(1, 4)

        # Very elderly
        if age >= 85:
            hr += random.randint(2, 5)

        return {

            "Baseline_Heart_Rate": hr,

            "Baseline_Systolic_BP": sbp,

            "Baseline_Diastolic_BP": dbp,

            "Baseline_SpO2": spo2,

            "Baseline_Temperature": temp,

            "Baseline_Respiratory_Rate": rr

        }

    def apply(self, df):

        rows = []

        for _, patient in df.iterrows():

            rows.append(

                self.generate_baseline(patient)

            )

        baseline_df = pd.DataFrame(rows)

        return pd.concat(
            [
                df.reset_index(drop=True),
                baseline_df.reset_index(drop=True)
            ],
            axis=1
        )


if __name__ == "__main__":

    from ml.generators.patient_generator import PatientGenerator
    from ml.generators.disease_generator import DiseaseGenerator
    from ml.generators.medication_generator import MedicationGenerator
    from ml.generators.lifestyle_generator import LifestyleGenerator

    patient_gen = PatientGenerator()
    disease_gen = DiseaseGenerator()
    medication_gen = MedicationGenerator()
    lifestyle_gen = LifestyleGenerator()
    baseline_gen = BaselineGenerator()

    df = patient_gen.generate_patients(10)
    df = disease_gen.apply(df)
    df = medication_gen.apply(df)
    df = lifestyle_gen.apply(df)

    df = baseline_gen.apply(df)

    print(df.head())

    print(df.shape)