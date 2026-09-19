# %%
# ==========================================================
# Imports
# ==========================================================

import warnings
warnings.filterwarnings("ignore")

from pathlib import Path

import pandas as pd
import numpy as np

import matplotlib.pyplot as plt
import seaborn as sns

pd.set_option("display.max_columns", None)
pd.set_option("display.max_rows", 100)

plt.style.use("ggplot")

print("Libraries Loaded Successfully")

# %%
# ==========================================================
# Load Dataset
# ==========================================================

DATASET_PATH = Path("../data/generated/master_dataset.csv")

df = pd.read_csv(DATASET_PATH)

print("=" * 60)
print("DATASET LOADED SUCCESSFULLY")
print("=" * 60)

print(f"Rows    : {df.shape[0]:,}")
print(f"Columns : {df.shape[1]}")

# %%
print("=" * 60)

print("DATASET SHAPE")

print("=" * 60)

print(df.shape)

# %%
print("=" * 60)

print("DATASET INFORMATION")

print("=" * 60)

df.info()

# %%
df.describe(include="all").T

# %%
print("=" * 60)

print("MISSING VALUE ANALYSIS")

print("=" * 60)

missing = df.isnull().sum()

missing = missing[missing > 0]

if len(missing) == 0:

    print("✅ No Missing Values Found")

else:

    print(missing.sort_values(ascending=False))

# %%
print("=" * 60)

print("DUPLICATE ROW CHECK")

print("=" * 60)

duplicates = df.duplicated().sum()

print(f"Duplicate Rows : {duplicates}")

# %%
print("=" * 60)

print("PATIENT VALIDATION")

print("=" * 60)

print("Unique Patients :", df["Patient_ID"].nunique())

print("Total Records :", len(df))

print("Average Records Per Patient :",

      round(len(df)/df["Patient_ID"].nunique(),2))

# %%
df["Diabetes_Severity"].value_counts(dropna=False)


# %%
df = pd.read_csv(
    DATASET_PATH,
    keep_default_na=False
)

# %%
df["Diabetes_Severity"].value_counts(dropna=False)

# %%
print("=" * 60)

print("MISSING VALUE ANALYSIS")

print("=" * 60)

missing = df.isnull().sum()

missing = missing[missing > 0]

if len(missing) == 0:

    print("✅ No Missing Values Found")

else:

    print(missing.sort_values(ascending=False))

# %%
print("=" * 60)
print("AGE DISTRIBUTION")
print("=" * 60)

print(df["Age"].describe())

plt.figure(figsize=(8,5))
df["Age"].hist(bins=20)

plt.title("Age Distribution")
plt.xlabel("Age")
plt.ylabel("Patients")
plt.show()

# %%
print(df["Gender"].value_counts())

plt.figure(figsize=(6,5))

df["Gender"].value_counts().plot(
    kind="bar"
)

plt.title("Gender Distribution")
plt.ylabel("Count")

plt.show()

# %%
print(df["BMI"].describe())

plt.figure(figsize=(8,5))

df["BMI"].hist(bins=25)

plt.title("BMI Distribution")

plt.xlabel("BMI")

plt.show()

# %%
print(df["Blood_Group"].value_counts())

plt.figure(figsize=(8,5))

df["Blood_Group"].value_counts().plot(
    kind="bar"
)

plt.title("Blood Group Distribution")

plt.show()

# %%
print("=" * 70)
print("DISEASE PREVALENCE")
print("=" * 70)

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

disease_counts = df[disease_columns].sum().sort_values(ascending=False)

print(disease_counts)

plt.figure(figsize=(12,6))

disease_counts.plot(kind="bar")

plt.title("Disease Prevalence")

plt.ylabel("Patients")

plt.xticks(rotation=45)

plt.show()

# %%
severity_columns = [

    c for c in df.columns

    if c.endswith("_Severity")

]

print(f"Total Severity Columns : {len(severity_columns)}")

# %%
disease_percentage = (

    df[disease_columns].mean()*100

).round(2)

print(disease_percentage.sort_values(ascending=False))

# %%
for column in severity_columns:

    print("="*60)

    print(column)

    print("="*60)

    print(

        df[column].value_counts(dropna=False)

    )

    print()

# %%
print("=" * 70)
print("HEART RATE ANALYSIS")
print("=" * 70)

print(df["Heart_Rate"].describe())

plt.figure(figsize=(8,5))

df["Heart_Rate"].hist(bins=30)

plt.title("Heart Rate Distribution")

plt.xlabel("Heart Rate (bpm)")

plt.ylabel("Frequency")

plt.show()

# %%
print("=" * 70)
print("SYSTOLIC BP")
print("=" * 70)

print(df["Systolic_BP"].describe())

print()

print("=" * 70)
print("DIASTOLIC BP")
print("=" * 70)

print(df["Diastolic_BP"].describe())

# %%
print("=" * 70)
print("PULSE PRESSURE")
print("=" * 70)

print(df["Pulse_Pressure"].describe())

print()

print("Negative Pulse Pressure :",

      (df["Pulse_Pressure"] < 0).sum())

# %%
print(df["SpO2"].describe())

plt.figure(figsize=(8,5))

df["SpO2"].hist(bins=25)

plt.title("SpO₂ Distribution")

plt.show()

# %%
print(df["Temperature"].describe())

plt.figure(figsize=(8,5))

df["Temperature"].hist(bins=25)

plt.title("Temperature Distribution")

plt.show()

# %%
print(df["Respiratory_Rate"].describe())

plt.figure(figsize=(8,5))

df["Respiratory_Rate"].hist(bins=25)

plt.title("Respiratory Rate Distribution")

plt.show()

# %%
print(df["Clinical_Score"].describe())

plt.figure(figsize=(8,5))

df["Clinical_Score"].hist(bins=30)

plt.title("Clinical Score Distribution")

plt.xlabel("Clinical Score")

plt.show()

# %%
print(df["Risk_Level"].value_counts())

print()

print(df["Alert_Level"].value_counts())

# %%
import matplotlib.pyplot as plt

numeric_df = df.select_dtypes(include="number")

corr = numeric_df.corr()

plt.figure(figsize=(18,14))

plt.imshow(corr, aspect="auto")

plt.colorbar()

plt.title("Correlation Matrix")

plt.show()

# %%



