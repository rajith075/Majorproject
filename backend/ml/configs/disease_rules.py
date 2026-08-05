"""
==========================================================
Disease Knowledge Base
AI-Powered Elderly Healthcare Monitoring System
==========================================================
This file contains configurable disease prevalence and
dependency rules used by the synthetic dataset generator.
"""

DISEASE_RULES = {

    "Diabetes": {
        "age_probability": {
            "60-69": 0.22,
            "70-79": 0.32,
            "80-89": 0.42,
            "90+": 0.48,
        },
        "dependencies": {
            "Hypertension": 0.45,
            "Kidney_Disease": 0.35,
            "Heart_Disease": 0.18,
        },
    },

    "Hypertension": {
        "age_probability": {
            "60-69": 0.35,
            "70-79": 0.55,
            "80-89": 0.70,
            "90+": 0.78,
        },
        "dependencies": {
            "Heart_Disease": 0.35,
            "Stroke": 0.18,
        },
    },

    "Heart_Disease": {
        "age_probability": {
            "60-69": 0.12,
            "70-79": 0.22,
            "80-89": 0.35,
            "90+": 0.45,
        },
        "dependencies": {
            "Stroke": 0.22,
        },
    },

    "Stroke": {
        "age_probability": {
            "60-69": 0.04,
            "70-79": 0.08,
            "80-89": 0.15,
            "90+": 0.22,
        },
        "dependencies": {},
    },

    "COPD": {
        "age_probability": {
            "60-69": 0.08,
            "70-79": 0.12,
            "80-89": 0.18,
            "90+": 0.24,
        },
        "dependencies": {},
    },

    "Asthma": {
        "age_probability": {
            "60-69": 0.09,
            "70-79": 0.09,
            "80-89": 0.09,
            "90+": 0.09,
        },
        "dependencies": {},
    },

    "Parkinsons": {
        "age_probability": {
            "60-69": 0.03,
            "70-79": 0.06,
            "80-89": 0.10,
            "90+": 0.14,
        },
        "dependencies": {},
    },

    "Alzheimers": {
        "age_probability": {
            "60-69": 0.02,
            "70-79": 0.08,
            "80-89": 0.18,
            "90+": 0.30,
        },
        "dependencies": {},
    },

    "Kidney_Disease": {
        "age_probability": {
            "60-69": 0.05,
            "70-79": 0.08,
            "80-89": 0.12,
            "90+": 0.18,
        },
        "dependencies": {},
    },

    "Arthritis": {
        "age_probability": {
            "60-69": 0.35,
            "70-79": 0.45,
            "80-89": 0.58,
            "90+": 0.70,
        },
        "dependencies": {},
    },
}