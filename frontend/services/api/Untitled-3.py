# %%
# ==========================================================
# Imports
# ==========================================================

import warnings
warnings.filterwarnings("ignore")

from pathlib import Path

import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

pd.set_option("display.max_columns", None)

# %%
# ==========================================================
# Load Dataset
# ==========================================================

DATASET_PATH = Path("../data/generated/master_dataset.csv")

df = pd.read_csv(DATASET_PATH)

print("Dataset Loaded Successfully")
print(df.shape)

df.head()

# %%
print("=" * 60)

print("DATASET INFORMATION")

print("=" * 60)

print(f"Rows    : {df.shape[0]}")
print(f"Columns : {df.shape[1]}")

print()

print("Missing Values :", df.isnull().sum().sum())

print("Duplicate Rows :", df.duplicated().sum())

# %%
DROP_COLUMNS = [

    "Patient_ID",

    "Timestamp"

]

df = df.drop(columns=DROP_COLUMNS)

print(df.shape)

# %%
health_target = "Risk_Level"

# %%
alert_target = "Alert_Level"

# %%
X = df.drop(

    columns=[

        health_target,

        alert_target

    ]

)

y_health = df[health_target]

y_alert = df[alert_target]

# %%
categorical_columns = X.select_dtypes(

    include="object"

).columns.tolist()

print(categorical_columns)

print()

print("Total :", len(categorical_columns))

# %%
encoders = {}

for column in categorical_columns:

    encoder = LabelEncoder()

    X[column] = encoder.fit_transform(
        X[column].astype(str)
    )

    encoders[column] = encoder

# %%
health_encoder = LabelEncoder()

alert_encoder = LabelEncoder()

y_health = health_encoder.fit_transform(y_health)

y_alert = alert_encoder.fit_transform(y_alert)

# %%
X_train_health, X_test_health, y_train_health, y_test_health = train_test_split(

    X,

    y_health,

    test_size=0.20,

    random_state=42,

    stratify=y_health

)

# %%
X_train_alert, X_test_alert, y_train_alert, y_test_alert = train_test_split(

    X,

    y_alert,

    test_size=0.20,

    random_state=42,

    stratify=y_alert

)

# %%
OUTPUT_DIR = Path("../data/processed")

OUTPUT_DIR.mkdir(

    parents=True,

    exist_ok=True

)

# %%
joblib.dump(

    (

        X_train_health,

        X_test_health,

        y_train_health,

        y_test_health

    ),

    OUTPUT_DIR / "health_dataset.pkl"

)

joblib.dump(

    (

        X_train_alert,

        X_test_alert,

        y_train_alert,

        y_test_alert

    ),

    OUTPUT_DIR / "alert_dataset.pkl"

)

print("Processed datasets saved successfully.")

# %%
ENCODER_DIR = Path("../models/encoders")

ENCODER_DIR.mkdir(

    parents=True,

    exist_ok=True

)

joblib.dump(

    encoders,

    ENCODER_DIR / "feature_encoders.pkl"

)

joblib.dump(

    health_encoder,

    ENCODER_DIR / "health_label_encoder.pkl"

)

joblib.dump(

    alert_encoder,

    ENCODER_DIR / "alert_label_encoder.pkl"

)

print("Encoders saved successfully.")

# %%
print("=" * 60)

print("PREPROCESSING COMPLETED")

print("=" * 60)

print("Health Train :", X_train_health.shape)
print("Health Test  :", X_test_health.shape)

print()

print("Alert Train  :", X_train_alert.shape)
print("Alert Test   :", X_test_alert.shape)

print()

print("Feature Columns :", X.shape[1])

# %%
print("=" * 60)

print("PREPROCESSING COMPLETED")

print("=" * 60)

print("Health Train :", X_train_health.shape)
print("Health Test  :", X_test_health.shape)

print()

print("Alert Train  :", X_train_alert.shape)
print("Alert Test   :", X_test_alert.shape)

print()

print("Feature Columns :", X.shape[1])

# %%
# ==========================================================
# AI-Powered Elderly Healthcare
# Preprocessing Pipeline V2
# ==========================================================

import warnings
warnings.filterwarnings("ignore")

from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import StandardScaler

print("Libraries Loaded Successfully")

# %%
# ==========================================================
# Load Dataset
# ==========================================================

DATASET_PATH = Path("../data/generated/master_dataset.csv")

df = pd.read_csv(
    DATASET_PATH,
    keep_default_na=False
)

print("="*60)
print("DATASET LOADED")
print("="*60)

print("Shape :", df.shape)

df.head()

# %%
# ==========================================================
# Dataset Summary
# ==========================================================

print("="*60)
print("DATASET INFORMATION")
print("="*60)

print(f"Rows    : {df.shape[0]:,}")
print(f"Columns : {df.shape[1]}")

print()

print("Missing Values :", df.isnull().sum().sum())

print("Duplicate Rows :", df.duplicated().sum())

print()

print(df.dtypes.value_counts())

# %%
# ==========================================================
# Remove Non-ML Columns
# ==========================================================

DROP_COLUMNS = [

    "Patient_ID",

    "Timestamp"

]

df = df.drop(columns=DROP_COLUMNS)

print("="*60)
print("AFTER COLUMN REMOVAL")
print("="*60)

print(df.shape)

# %%
# ==========================================================
# Save Clean Dataset
# ==========================================================

clean_df = df.copy()

print(clean_df.shape)

# %%
# ==========================================================
# Health Risk Model Dataset
# ==========================================================

health_df = clean_df.copy()

HEALTH_TARGET = "Risk_Level"

HEALTH_DROP = [

    "Risk_Level",

    "Alert_Level",

    "Recommendation",

    "Possible_Event",

    "Confidence",

    "Clinical_Score"

]

X_health = health_df.drop(columns=HEALTH_DROP)

y_health = health_df[HEALTH_TARGET]

print("=" * 60)
print("HEALTH MODEL DATASET")
print("=" * 60)

print("Features :", X_health.shape)
print("Target   :", y_health.shape)

# %%
# ==========================================================
# Alert Prediction Dataset
# ==========================================================

alert_df = clean_df.copy()

ALERT_TARGET = "Alert_Level"

ALERT_DROP = [

    "Alert_Level",

    "Recommendation",

    "Confidence"

]

X_alert = alert_df.drop(columns=ALERT_DROP)

y_alert = alert_df[ALERT_TARGET]

print("=" * 60)
print("ALERT MODEL DATASET")
print("=" * 60)

print("Features :", X_alert.shape)
print("Target   :", y_alert.shape)

# %%
# ==========================================================
# Verify Target Distribution
# ==========================================================

print("=" * 60)
print("HEALTH TARGET")
print("=" * 60)

print(y_health.value_counts())

print()

print("=" * 60)
print("ALERT TARGET")
print("=" * 60)

print(y_alert.value_counts())

# %%
print("=" * 60)

print("HEALTH FEATURES")

print("=" * 60)

print(len(X_health.columns))

print()

print("=" * 60)

print("ALERT FEATURES")

print("=" * 60)

print(len(X_alert.columns))

# %%
# ==========================================================
# Encode Categorical Features
# ==========================================================

health_encoders = {}
alert_encoders = {}

# ---------- Health Dataset ----------

health_categorical = X_health.select_dtypes(
    include="object"
).columns

for column in health_categorical:

    encoder = LabelEncoder()

    X_health[column] = encoder.fit_transform(
        X_health[column].astype(str)
    )

    health_encoders[column] = encoder


# ---------- Alert Dataset ----------

alert_categorical = X_alert.select_dtypes(
    include="object"
).columns

for column in alert_categorical:

    encoder = LabelEncoder()

    X_alert[column] = encoder.fit_transform(
        X_alert[column].astype(str)
    )

    alert_encoders[column] = encoder

print("Health categorical columns :", len(health_categorical))
print("Alert categorical columns  :", len(alert_categorical))

# %%
# ==========================================================
# Encode Target Labels
# ==========================================================

health_label_encoder = LabelEncoder()
alert_label_encoder = LabelEncoder()

y_health = health_label_encoder.fit_transform(y_health)
y_alert = alert_label_encoder.fit_transform(y_alert)

print("Health Classes")
print(health_label_encoder.classes_)

print()

print("Alert Classes")
print(alert_label_encoder.classes_)

# %%
# ==========================================================
# Train Test Split
# ==========================================================

X_train_health, X_test_health, y_train_health, y_test_health = train_test_split(

    X_health,

    y_health,

    test_size=0.20,

    random_state=42,

    stratify=y_health

)

X_train_alert, X_test_alert, y_train_alert, y_test_alert = train_test_split(

    X_alert,

    y_alert,

    test_size=0.20,

    random_state=42,

    stratify=y_alert

)

print("Health Train :", X_train_health.shape)
print("Health Test  :", X_test_health.shape)

print()

print("Alert Train :", X_train_alert.shape)
print("Alert Test  :", X_test_alert.shape)

# %%
# ==========================================================
# Verify Class Balance
# ==========================================================

print("=" * 60)
print("Health Training Distribution")
print("=" * 60)

print(pd.Series(y_train_health).value_counts())

print()

print("=" * 60)
print("Health Testing Distribution")
print("=" * 60)

print(pd.Series(y_test_health).value_counts())

print()

print("=" * 60)
print("Alert Training Distribution")
print("=" * 60)

print(pd.Series(y_train_alert).value_counts())

print()

print("=" * 60)
print("Alert Testing Distribution")
print("=" * 60)

print(pd.Series(y_test_alert).value_counts())

# %%
# ==========================================================
# Scale Numerical Features
# ==========================================================

health_scaler = StandardScaler()
alert_scaler = StandardScaler()

# ---------- Health ----------

X_train_health_scaled = pd.DataFrame(
    health_scaler.fit_transform(X_train_health),
    columns=X_train_health.columns,
    index=X_train_health.index
)

X_test_health_scaled = pd.DataFrame(
    health_scaler.transform(X_test_health),
    columns=X_test_health.columns,
    index=X_test_health.index
)

# ---------- Alert ----------

X_train_alert_scaled = pd.DataFrame(
    alert_scaler.fit_transform(X_train_alert),
    columns=X_train_alert.columns,
    index=X_train_alert.index
)

X_test_alert_scaled = pd.DataFrame(
    alert_scaler.transform(X_test_alert),
    columns=X_test_alert.columns,
    index=X_test_alert.index
)

print("Scaling Completed Successfully")

# %%
# ==========================================================
# Create Output Directories
# ==========================================================

PROCESSED_DIR = Path("../data/processed")
MODEL_DIR = Path("../models")

PROCESSED_DIR.mkdir(
    parents=True,
    exist_ok=True
)

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

print("Folders Created Successfully")

# %%
# ==========================================================
# Save Preprocessing Objects
# ==========================================================

joblib.dump(
    health_encoders,
    MODEL_DIR / "health_feature_encoders.pkl"
)

joblib.dump(
    alert_encoders,
    MODEL_DIR / "alert_feature_encoders.pkl"
)

joblib.dump(
    health_label_encoder,
    MODEL_DIR / "health_label_encoder.pkl"
)

joblib.dump(
    alert_label_encoder,
    MODEL_DIR / "alert_label_encoder.pkl"
)

joblib.dump(
    health_scaler,
    MODEL_DIR / "health_scaler.pkl"
)

joblib.dump(
    alert_scaler,
    MODEL_DIR / "alert_scaler.pkl"
)

print("Encoders & Scalers Saved Successfully")

# %%
# ==========================================================
# Save Feature Columns
# ==========================================================

joblib.dump(
    X_train_health.columns.tolist(),
    MODEL_DIR / "health_features.pkl"
)

joblib.dump(
    X_train_alert.columns.tolist(),
    MODEL_DIR / "alert_features.pkl"
)

print("Feature Lists Saved")

# %%
# ==========================================================
# Save Processed Datasets
# ==========================================================

joblib.dump(

    {

        "X_train": X_train_health_scaled,
        "X_test": X_test_health_scaled,
        "y_train": y_train_health,
        "y_test": y_test_health

    },

    PROCESSED_DIR / "health_dataset.pkl"

)

joblib.dump(

    {

        "X_train": X_train_alert_scaled,
        "X_test": X_test_alert_scaled,
        "y_train": y_train_alert,
        "y_test": y_test_alert

    },

    PROCESSED_DIR / "alert_dataset.pkl"

)

print("Processed Datasets Saved Successfully")

# %%
# ==========================================================
# Final Verification
# ==========================================================

print("=" * 70)
print("PREPROCESSING COMPLETED SUCCESSFULLY")
print("=" * 70)

print()

print("Health Train :", X_train_health_scaled.shape)
print("Health Test  :", X_test_health_scaled.shape)

print()

print("Alert Train :", X_train_alert_scaled.shape)
print("Alert Test  :", X_test_alert_scaled.shape)

print()

print("Health Features :", len(X_train_health.columns))
print("Alert Features :", len(X_train_alert.columns))

print()

print("Files Saved In :", PROCESSED_DIR)

print("=" * 70)

# %%
from pathlib import Path

print("Processed Files")
print(list(Path("../data/processed").glob("*")))

print()

print("Model Files")
print(list(Path("../models").glob("*")))

# %%
# ==========================================================
# Health Risk Model Dataset (Leakage-Free)
# ==========================================================

HEALTH_TARGET = "Risk_Level"

HEALTH_DROP = [

    # Target
    "Risk_Level",

    # Outputs from the rule engine
    "Alert_Level",
    "Recommendation",
    "Possible_Event",
    "Confidence",
    "Clinical_Score",

    # Intermediate risk scores (remove leakage)
    "Cardiovascular_Risk",
    "Respiratory_Risk",
    "Neurological_Risk",
    "Metabolic_Risk",
    "Lifestyle_Risk",
    "Trend_Risk"

]

health_df = clean_df.copy()

X_health = health_df.drop(columns=HEALTH_DROP)

y_health = health_df[HEALTH_TARGET]

print("Health Features :", X_health.shape)
print("Target :", y_health.shape)

# %%
# ==========================================================
# Save Processed Datasets
# ==========================================================

joblib.dump(

    {

        "X_train": X_train_health_scaled,
        "X_test": X_test_health_scaled,
        "y_train": y_train_health,
        "y_test": y_test_health

    },

    PROCESSED_DIR / "health_dataset.pkl"

)

joblib.dump(

    {

        "X_train": X_train_alert_scaled,
        "X_test": X_test_alert_scaled,
        "y_train": y_train_alert,
        "y_test": y_test_alert

    },

    PROCESSED_DIR / "alert_dataset.pkl"

)

print("Processed Datasets Saved Successfully")

# %%
# ==========================================================
# Save Feature Columns
# ==========================================================

joblib.dump(
    X_train_health.columns.tolist(),
    MODEL_DIR / "health_features.pkl"
)

joblib.dump(
    X_train_alert.columns.tolist(),
    MODEL_DIR / "alert_features.pkl"
)

print("Feature Lists Saved")

# %%
# ==========================================================
# Save Processed Datasets
# ==========================================================

joblib.dump(

    {

        "X_train": X_train_health_scaled,
        "X_test": X_test_health_scaled,
        "y_train": y_train_health,
        "y_test": y_test_health

    },

    PROCESSED_DIR / "health_dataset.pkl"

)

joblib.dump(

    {

        "X_train": X_train_alert_scaled,
        "X_test": X_test_alert_scaled,
        "y_train": y_train_alert,
        "y_test": y_test_alert

    },

    PROCESSED_DIR / "alert_dataset.pkl"

)

print("Processed Datasets Saved Successfully")

# %%
# ==========================================================
# Drop Unnecessary Columns
# ==========================================================

DROP_COLUMNS = [

    "Patient_ID",

    "Timestamp"

]

clean_df = df.drop(

    columns=DROP_COLUMNS

)

print(clean_df.shape)

# %%
# ==========================================================
# Save Processed Datasets
# ==========================================================

joblib.dump(

    {

        "X_train": X_train_health_scaled,
        "X_test": X_test_health_scaled,
        "y_train": y_train_health,
        "y_test": y_test_health

    },

    PROCESSED_DIR / "health_dataset.pkl"

)

joblib.dump(

    {

        "X_train": X_train_alert_scaled,
        "X_test": X_test_alert_scaled,
        "y_train": y_train_alert,
        "y_test": y_test_alert

    },

    PROCESSED_DIR / "alert_dataset.pkl"

)

print("Processed Datasets Saved Successfully")

# %%
# ==========================================================
# Save Feature Columns
# ==========================================================

joblib.dump(
    X_train_health.columns.tolist(),
    MODEL_DIR / "health_features.pkl"
)

joblib.dump(
    X_train_alert.columns.tolist(),
    MODEL_DIR / "alert_features.pkl"
)

print("Feature Lists Saved")

# %%
# ==========================================================
# Drop Unnecessary Columns
# ==========================================================

DROP_COLUMNS = [

    "Patient_ID",

    "Timestamp"

]

clean_df = df.drop(

    columns=DROP_COLUMNS

)

print(clean_df.shape)

# %%



