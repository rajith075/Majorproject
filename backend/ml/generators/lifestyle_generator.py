"""
=========================================================
Lifestyle Generator
=========================================================
Generates realistic lifestyle attributes for elderly patients.
"""

import random
import pandas as pd

random.seed(42)


class LifestyleGenerator:

    def __init__(self):
        pass

    def generate_lifestyle(self, patient):

        age = patient["Age"]

        lifestyle = {

            "Smoking": random.choices(
                [0, 1],
                weights=[82, 18],
                k=1
            )[0],

            "Alcohol": random.choices(
                [0, 1],
                weights=[78, 22],
                k=1
            )[0],

            "Mobility": random.choices(
                [
                    "Independent",
                    "Assisted",
                    "Wheelchair",
                    "Bedridden"
                ],
                weights=[55, 30, 10, 5],
                k=1
            )[0],

            "Memory_Status": "Normal",

            "Exercise_Level": random.choice([
                "Low",
                "Moderate",
                "High"
            ]),

            "Diet_Quality": random.choice([
                "Poor",
                "Average",
                "Good"
            ]),

            "Water_Intake_Liters": round(
                random.uniform(1.0, 3.0),
                1
            )
        }

        # Alzheimer's affects memory

        if patient["Alzheimers"]:

            lifestyle["Memory_Status"] = random.choice([
                "Mild Impairment",
                "Moderate Impairment",
                "Severe Impairment"
            ])

        # Parkinson's affects mobility

        if patient["Parkinsons"]:

            lifestyle["Mobility"] = random.choice([
                "Assisted",
                "Wheelchair"
            ])

        # Very elderly patients

        if age >= 90 and random.random() < 0.35:

            lifestyle["Mobility"] = "Wheelchair"

        return lifestyle

    def apply(self, df):

        rows = []

        for _, patient in df.iterrows():

            rows.append(

                self.generate_lifestyle(patient)

            )

        lifestyle_df = pd.DataFrame(rows)

        return pd.concat(
            [
                df.reset_index(drop=True),
                lifestyle_df.reset_index(drop=True)
            ],
            axis=1
        )


if __name__ == "__main__":

    from ml.generators.patient_generator import PatientGenerator
    from ml.generators.disease_generator import DiseaseGenerator
    from ml.generators.medication_generator import MedicationGenerator

    patient_gen = PatientGenerator()
    disease_gen = DiseaseGenerator()
    medication_gen = MedicationGenerator()
    lifestyle_gen = LifestyleGenerator()

    df = patient_gen.generate_patients(10)
    df = disease_gen.apply(df)
    df = medication_gen.apply(df)
    df = lifestyle_gen.apply(df)

    print(df.head())

    print(df.shape)