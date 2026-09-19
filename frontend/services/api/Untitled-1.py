# %%
# ==========================================================
# Health Risk Model Training V2
# ==========================================================

import warnings

warnings.filterwarnings("ignore")

import time
import joblib
import numpy as np
import pandas as pd

from pathlib import Path

from sklearn.metrics import (

    accuracy_score,

    precision_score,

    recall_score,

    f1_score,

    classification_report,

    confusion_matrix

)

from sklearn.ensemble import RandomForestClassifier

from lightgbm import LGBMClassifier

from xgboost import XGBClassifier

from catboost import CatBoostClassifier

print("=" * 70)

print("Health Risk Model Training V2")

print("=" * 70)

# %%
from pathlib import Path
import joblib

DATA_DIR = Path("../data/processed")

data = joblib.load(DATA_DIR / "health_dataset.pkl")

print(type(data))
print()

if isinstance(data, tuple):
    print("Tuple Length:", len(data))
    for i, item in enumerate(data):
        print(f"Item {i}: {type(item)}")

elif isinstance(data, dict):
    print("Keys:")
    print(data.keys())

else:
    print(data)

# %%
# ==========================================================
# Load Processed Dataset
# ==========================================================

from pathlib import Path
import joblib

DATA_DIR = Path("../data/processed")

data = joblib.load(
    DATA_DIR / "health_dataset.pkl"
)

X_train = data["X_train"]
X_test = data["X_test"]
y_train = data["y_train"]
y_test = data["y_test"]

print("=" * 70)
print("Processed Dataset Loaded")
print("=" * 70)

print()

print("Train Shape :", X_train.shape)
print("Test Shape  :", X_test.shape)

print()

print("Total Features :", X_train.shape[1])

# %%
feature_df.to_csv("feature_list.csv", index=False)

print(feature_df)

# %%
feature_df.to_csv("feature_list.csv", index=False)

# %%
feature_list = pd.DataFrame({
    "Feature": X_train.columns
})

feature_list.to_csv("feature_list.csv", index=False)

print("Saved!")

# %%
# ==========================================================
# Remove Leakage Features
# ==========================================================

DROP_COLUMNS = [

    "Clinical_Score",

    "Cardiovascular_Risk",
    "Respiratory_Risk",
    "Neurological_Risk",
    "Metabolic_Risk",
    "Lifestyle_Risk",
    "Trend_Risk"

]

X_train = X_train.drop(
    columns=DROP_COLUMNS,
    errors="ignore"
)

X_test = X_test.drop(
    columns=DROP_COLUMNS,
    errors="ignore"
)

print("=" * 60)
print("Leakage Features Removed")
print("=" * 60)

print("Train Shape :", X_train.shape)
print("Test Shape  :", X_test.shape)

print("Total Features :", X_train.shape[1])

# %%
print(X_train.columns.tolist())

# %%
# ==========================================================
# Initialize Models
# ==========================================================

MODELS = {

    "Random Forest": RandomForestClassifier(

        n_estimators=300,
        max_depth=20,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1

    ),

    "XGBoost": XGBClassifier(

        n_estimators=300,
        learning_rate=0.05,
        max_depth=8,
        random_state=42,
        eval_metric="mlogloss",
        tree_method="hist"

    ),

    "LightGBM": LGBMClassifier(

        n_estimators=300,
        learning_rate=0.05,
        class_weight="balanced",
        random_state=42

    ),

    "CatBoost": CatBoostClassifier(

        iterations=300,
        learning_rate=0.05,
        depth=8,
        random_seed=42,
        verbose=False

    )

}

print("Models Initialized Successfully")

# %%
# ==========================================================
# Train Models
# ==========================================================

results = {}

trained_models = {}

for model_name, model in MODELS.items():

    print("=" * 70)
    print(f"TRAINING {model_name.upper()}")
    print("=" * 70)

    start = time.time()

    model.fit(
        X_train,
        y_train
    )

    training_time = time.time() - start

    predictions = model.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        average="weighted"
    )

    recall = recall_score(
        y_test,
        predictions,
        average="weighted"
    )

    f1 = f1_score(
        y_test,
        predictions,
        average="weighted"
    )

    results[model_name] = {

        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1": f1,
        "Training_Time": training_time

    }

    trained_models[model_name] = model

    print()

    print(f"Accuracy : {accuracy:.4f}")
    print(f"Precision : {precision:.4f}")
    print(f"Recall : {recall:.4f}")
    print(f"F1 : {f1:.4f}")
    print(f"Training Time : {training_time:.2f} sec")

    print()

# %%
# ==========================================================
# Model Comparison
# ==========================================================

comparison = pd.DataFrame(results).T

comparison = comparison.sort_values(

    by="Accuracy",

    ascending=False

)

comparison

# %%
# ==========================================================
# Best Model
# ==========================================================

best_model_name = comparison.index[0]

best_model = trained_models[best_model_name]

print("=" * 60)
print("BEST MODEL")
print("=" * 60)

print(best_model_name)

# %%
# ==========================================================
# Save Final Health Risk Model
# ==========================================================

from pathlib import Path
import joblib

MODEL_DIR = Path("../models")

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

# Best model
best_model_name = comparison.index[0]
best_model = trained_models[best_model_name]

# Save model
joblib.dump(
    best_model,
    MODEL_DIR / "health_risk_model_v2.pkl"
)

# Save feature order
joblib.dump(
    list(X_train.columns),
    MODEL_DIR / "health_feature_columns_v2.pkl"
)

print("=" * 60)
print("FINAL HEALTH MODEL SAVED")
print("=" * 60)
print("Best Model :", best_model_name)
print("Accuracy   :", comparison.iloc[0]["Accuracy"])

# %%
joblib.dump(
    health_encoder,
    MODEL_DIR / "health_label_encoder_v2.pkl"
)

# %%
import os

print(os.listdir("../models"))

# %%
# ==========================================================
# Classification Report
# ==========================================================

from sklearn.metrics import classification_report

predictions = best_model.predict(X_test)

print("=" * 70)
print(f"{best_model_name.upper()} CLASSIFICATION REPORT")
print("=" * 70)

print(
    classification_report(
        y_test,
        predictions
    )
)

# %%
# ==========================================================
# Confusion Matrix
# ==========================================================

from sklearn.metrics import confusion_matrix

cm = confusion_matrix(
    y_test,
    predictions
)

cm_df = pd.DataFrame(cm)

cm_df

# %%
# ==========================================================
# Confusion Matrix Heatmap
# ==========================================================

import matplotlib.pyplot as plt

plt.figure(figsize=(8,6))

plt.imshow(cm, interpolation="nearest")

plt.title(f"{best_model_name} Confusion Matrix")

plt.colorbar()

plt.xlabel("Predicted")

plt.ylabel("Actual")

plt.show()

# %%
# ==========================================================
# Feature Importance
# ==========================================================

importance = pd.DataFrame({

    "Feature": X_train.columns,

    "Importance": best_model.feature_importances_

})

importance = importance.sort_values(

    by="Importance",

    ascending=False

)

importance.head(25)

# %%



