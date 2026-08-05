"""
===========================================================
AI-Powered Elderly Healthcare Monitoring System
Configuration Constants
===========================================================
"""

from pathlib import Path

# ===========================================================
# PROJECT PATHS
# ===========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"

RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
GENERATED_DATA_DIR = DATA_DIR / "generated"

MODELS_DIR = BASE_DIR / "models"

REPORTS_DIR = BASE_DIR / "reports"

# ===========================================================
# DATASET CONFIGURATION
# ===========================================================

RANDOM_SEED = 42

NUMBER_OF_PATIENTS = 2000

OBSERVATIONS_PER_PATIENT = 10

TOTAL_RECORDS = NUMBER_OF_PATIENTS * OBSERVATIONS_PER_PATIENT

# ===========================================================
# PATIENT AGE
# ===========================================================

MIN_AGE = 60

MAX_AGE = 100

# ===========================================================
# CATEGORIES
# ===========================================================

GENDERS = [
    "Male",
    "Female"
]

BLOOD_GROUPS = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-"
]

ETHNICITIES = [
    "Asian",
    "African",
    "European",
    "Hispanic",
    "Middle Eastern"
]

AGE_GROUPS = [
    "60-69",
    "70-79",
    "80-89",
    "90+"
]

# ===========================================================
# DATASET EXPORT FILES
# ===========================================================

MASTER_DATASET_NAME = "master_elderly_dataset.csv"

HEALTH_DATASET_NAME = "health_risk_dataset.csv"

ALERT_DATASET_NAME = "disease_alert_dataset.csv"