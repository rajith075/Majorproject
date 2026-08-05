"""
=========================================================
Medical Rules Configuration
=========================================================
Central clinical configuration for the synthetic
elderly healthcare simulation.

These are clinically plausible engineering values
used for simulation, not medical advice.
"""

# =====================================================
# Physiological Reference Ranges
# =====================================================

VITAL_LIMITS = {

    "Heart_Rate": {
        "min": 45,
        "max": 180,
        "normal_low": 60,
        "normal_high": 100
    },

    "Systolic_BP": {
        "min": 80,
        "max": 220,
        "normal_low": 100,
        "normal_high": 140
    },

    "Diastolic_BP": {
        "min": 40,
        "max": 130,
        "normal_low": 60,
        "normal_high": 90
    },

    "SpO2": {
        "min": 75,
        "max": 100,
        "normal_low": 95,
        "normal_high": 100
    },

    "Temperature": {
        "min": 35.0,
        "max": 41.5,
        "normal_low": 36.1,
        "normal_high": 37.5
    },

    "Respiratory_Rate": {
        "min": 8,
        "max": 40,
        "normal_low": 12,
        "normal_high": 20
    }

}
DISEASE_WEIGHTS = {

    "Heart_Disease": 3,

    "Stroke": 3,

    "COPD": 3,

    "Kidney_Disease": 2,

    "Diabetes": 2,

    "Hypertension": 2,

    "Parkinsons": 2,

    "Alzheimers": 2,

    "Asthma": 2,

    "Arthritis": 1,

    "Thyroid": 1,

    "Liver_Disease": 2,

    "Cancer": 3,

    "Osteoporosis": 1,

    "Depression": 1,

    "Anemia": 2

}
LIFESTYLE_WEIGHTS = {

    "Smoking": 2,

    "Alcohol": 1,

    "Poor_Sleep": 2,

    "Low_Activity": 2,

    "Memory_Impairment": 2,

    "Limited_Mobility": 2

}
SCENARIOS = {

    "Stable": 0.30,

    "Improving": 0.15,

    "Mild_Deterioration": 0.25,

    "Rapid_Deterioration": 0.20,

    "Acute_Event": 0.10

}
RISK_LEVELS = {

    "Stable": (0, 4),

    "Low": (5, 8),

    "Moderate": (9, 13),

    "High": (14, 18),

    "Critical": (19, 100)

}
ALERT_MAPPING = {

    "Stable": "None",

    "Low": "Watch",

    "Moderate": "Notify Caregiver",

    "High": "Urgent",

    "Critical": "Emergency"

}