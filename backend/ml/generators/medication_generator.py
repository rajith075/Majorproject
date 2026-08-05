"""
=========================================================
Medication Generator
=========================================================
Assigns medications based on patient diseases.
"""

import random
import pandas as pd

random.seed(42)


class MedicationGenerator:

    def __init__(self):
        pass

    def assign_medications(self, patient):

        meds = {

            "Uses_Insulin": 0,
            "Uses_Metformin": 0,
            "Uses_Glimepiride": 0,

            "Uses_Amlodipine": 0,
            "Uses_Losartan": 0,
            "Uses_Aspirin": 0,
            "Uses_Atorvastatin": 0,

            "Uses_Salbutamol": 0,

            "Uses_Levodopa": 0,

            "Uses_Donepezil": 0,

            "Medication_Adherence": random.choice([
                "Excellent",
                "Good",
                "Poor",
                "Missed"
            ])
        }

        # -----------------------------
        # Diabetes
        # -----------------------------

        if patient["Diabetes"]:

            meds["Uses_Metformin"] = 1

            if random.random() < 0.45:
                meds["Uses_Insulin"] = 1

            if random.random() < 0.30:
                meds["Uses_Glimepiride"] = 1

        # -----------------------------
        # Hypertension
        # -----------------------------

        if patient["Hypertension"]:

            meds["Uses_Amlodipine"] = 1

            if random.random() < 0.60:
                meds["Uses_Losartan"] = 1

        # -----------------------------
        # Heart Disease
        # -----------------------------

        if patient["Heart_Disease"]:

            meds["Uses_Aspirin"] = 1

            meds["Uses_Atorvastatin"] = 1

        # -----------------------------
        # COPD / Asthma
        # -----------------------------

        if patient["COPD"] or patient["Asthma"]:

            meds["Uses_Salbutamol"] = 1

        # -----------------------------
        # Parkinson's
        # -----------------------------

        if patient["Parkinsons"]:

            meds["Uses_Levodopa"] = 1

        # -----------------------------
        # Alzheimer's
        # -----------------------------

        if patient["Alzheimers"]:

            meds["Uses_Donepezil"] = 1

        return meds

    def apply(self, df):

        medication_rows = []

        for _, patient in df.iterrows():

            medication_rows.append(

                self.assign_medications(patient)

            )

        medication_df = pd.DataFrame(medication_rows)

        return pd.concat(
            [df.reset_index(drop=True),
             medication_df.reset_index(drop=True)],
            axis=1
        )


if __name__ == "__main__":

    from ml.generators.patient_generator import PatientGenerator
    from ml.generators.disease_generator import DiseaseGenerator

    patient_gen = PatientGenerator()

    disease_gen = DiseaseGenerator()

    patients = patient_gen.generate_patients(10)

    patients = disease_gen.apply(patients)

    medication_gen = MedicationGenerator()

    final_df = medication_gen.apply(patients)

    print(final_df.head())

    print(final_df.shape)