# ==========================================================
# Feature Pipeline
# ==========================================================

import pandas as pd

from app.ai.feature_engineering import FeatureEngineering
from app.ai.model_loader import model_loader


class FeaturePipeline:

    def __init__(self):

        # ==================================================
        # Model Features
        # ==================================================

        self.health_features = (
            model_loader.health_features
        )

        self.clinical_features = (
            model_loader.clinical_features
        )

        # ==================================================
        # Health Preprocessing
        # ==================================================

        self.health_encoders = (
            model_loader.health_feature_encoders
        )

        # ==================================================
        # Feature Engineering
        # ==================================================

        self.engineering = FeatureEngineering()

    # ======================================================
    # MAIN PIPELINE
    # ======================================================

    def build(
        self,
        profile: dict,
    ):

        patient = profile["patient"]

        vitals = profile.get(
            "latest_vitals"
        )

        conditions = profile.get(
            "conditions",
            []
        )

        medications = profile.get(
            "medications",
            []
        )

        # ==================================================
        # Base Patient + Vital Features
        # ==================================================

        features = self._build_base_features(
            patient,
            vitals,
        )

        # ==================================================
        # Disease Features
        # ==================================================

        self._add_condition_features(
            features,
            conditions,
        )

        # ==================================================
        # Medication Features
        # ==================================================

        self._add_medication_features(
            features,
            medications,
        )

        # ==================================================
        # Feature Engineering
        # ==================================================

        self.engineering.calculate(
            features
        )

        # ==================================================
        # Derived / Normalized Application Features
        #
        # Several training features aren't raw patient data —
        # they're derived categories the model expects but
        # the DB doesn't store directly, or app-side values
        # that use different labels than the training data.
        # Centralized here instead of scattered across
        # _build_base_features so every derived feature is
        # generated in one place, in a known order.
        # ==================================================

        self._prepare_derived_features(
            features
        )

        # ==================================================
        # Validate Before Prediction
        #
        # Surfaces every missing/zero health feature at once
        # instead of finding them one ValueError at a time.
        # ==================================================

        self._validate_features(
            features
        )

        # ==================================================
        # Health Model
        # ==================================================

        health_df = (
            self._create_health_dataframe(
                features
            )
        )

        # ==================================================
        # Clinical Model
        # ==================================================

        clinical_df = (
            self._create_dataframe(
                features,
                self.clinical_features,
            )
        )

        # ==================================================
        # Return
        # ==================================================

        return {

            "health_features": health_df,

            "clinical_features": clinical_df,

            "engineered_features": features,

        }

    # ======================================================
    # BASE FEATURES
    # ======================================================

    def _build_base_features(
        self,
        patient,
        vitals,
    ):

        features = {}

        # ==================================================
        # Patient Fields
        # ==================================================

        PATIENT_FIELD_MAP = {

            "Age":
                "age",

            "Gender":
                "gender",

            "Blood_Group":
                "blood_group",

            "Ethnicity":
                "ethnicity",

            "Height_cm":
                "height_cm",

            "Weight_kg":
                "weight_kg",

            "BMI":
                "bmi",

            "Medication_Adherence":
                "medication_adherence",

            "Smoking":
                "smoking",

            "Alcohol":
                "alcohol",

            "Mobility":
                "mobility",

            "Memory_Status":
                "memory_status",

            "Exercise_Level":
                "exercise_level",

            "Diet_Quality":
                "diet_quality",

            "Water_Intake_Liters":
                "water_intake_liters",

            "Baseline_Heart_Rate":
                "baseline_heart_rate",

            "Baseline_Systolic_BP":
                "baseline_systolic_bp",

            "Baseline_Diastolic_BP":
                "baseline_diastolic_bp",

            "Baseline_SpO2":
                "baseline_spo2",

            "Baseline_Temperature":
                "baseline_temperature",

            "Baseline_Respiratory_Rate":
                "baseline_respiratory_rate",

            "Health_Index":
                "health_index",

        }

        # ==================================================
        # Read Patient
        # ==================================================

        for feature_name, attribute in (
            PATIENT_FIELD_MAP.items()
        ):

            value = getattr(
                patient,
                attribute,
                None,
            )

            if value is None:
                value = 0

            features[feature_name] = value

        # ==================================================
        # Vital Fields
        # ==================================================

        VITAL_FIELD_MAP = {

            "Heart_Rate":
                "heart_rate",

            "Systolic_BP":
                "systolic_bp",

            "Diastolic_BP":
                "diastolic_bp",

            "SpO2":
                "spo2",

            "Temperature":
                "temperature",

            "Respiratory_Rate":
                "respiratory_rate",

            "Sleep_Hours":
                "sleep_hours",

            "Activity_Steps":
                "activity_steps",

        }

        # ==================================================
        # Baseline Fallbacks
        # ==================================================

        fallback_values = {

            "Heart_Rate":
                features.get(
                    "Baseline_Heart_Rate",
                    0,
                ),

            "Systolic_BP":
                features.get(
                    "Baseline_Systolic_BP",
                    0,
                ),

            "Diastolic_BP":
                features.get(
                    "Baseline_Diastolic_BP",
                    0,
                ),

            "SpO2":
                features.get(
                    "Baseline_SpO2",
                    0,
                ),

            "Temperature":
                features.get(
                    "Baseline_Temperature",
                    0,
                ),

            "Respiratory_Rate":
                features.get(
                    "Baseline_Respiratory_Rate",
                    0,
                ),

            "Sleep_Hours":
                8,

            "Activity_Steps":
                8000,

        }

        # ==================================================
        # Read Latest Vitals
        # ==================================================

        for feature_name, attribute in (
            VITAL_FIELD_MAP.items()
        ):

            if vitals:

                value = getattr(
                    vitals,
                    attribute,
                    None,
                )

                if value is None:
                    value = fallback_values[
                        feature_name
                    ]

            else:

                value = fallback_values[
                    feature_name
                ]

            features[feature_name] = value

        return features

    # ======================================================
    # CONDITION FEATURES
    # ======================================================

    def _add_condition_features(
        self,
        features,
        conditions,
    ):

        disease_names = [

            "Diabetes",
            "Hypertension",
            "Heart_Disease",
            "Stroke",
            "COPD",
            "Asthma",
            "Kidney_Disease",
            "Parkinsons",
            "Alzheimers",
            "Thyroid",
            "Liver_Disease",
            "Arthritis",
            "Cancer",
            "Osteoporosis",
            "Depression",
            "Anemia",

        ]

        # ==================================================
        # Defaults
        # ==================================================

        for disease in disease_names:

            features[disease] = 0

            features[
                f"{disease}_Severity"
            ] = "None"

        # ==================================================
        # PatientCondition -> Condition
        #
        # PatientCondition only contains:
        #
        # condition_id
        #
        # The router/profile service must provide
        # the related Condition object if possible.
        # ==================================================

        for patient_condition in conditions:

            condition = getattr(
                patient_condition,
                "condition",
                None,
            )

            # ------------------------------------------------
            # If relationship exists
            # ------------------------------------------------

            if condition:

                condition_name = getattr(
                    condition,
                    "name",
                    "",
                )

            else:

                condition_name = ""

            if not condition_name:
                continue

            normalized = (
                str(condition_name)
                .strip()
                .lower()
                .replace(" ", "_")
                .replace("-", "_")
            )

            for disease in disease_names:

                if normalized == disease.lower():

                    features[disease] = 1

                    # No severity exists in current DB.
                    features[
                        f"{disease}_Severity"
                    ] = "None"

                    break

    # ======================================================
    # MEDICATION FEATURES
    # ======================================================

    def _add_medication_features(
        self,
        features,
        medications,
    ):

        medication_map = {

            "insulin":
                "Uses_Insulin",

            "metformin":
                "Uses_Metformin",

            "glimepiride":
                "Uses_Glimepiride",

            "amlodipine":
                "Uses_Amlodipine",

            "losartan":
                "Uses_Losartan",

            "aspirin":
                "Uses_Aspirin",

            "atorvastatin":
                "Uses_Atorvastatin",

            "salbutamol":
                "Uses_Salbutamol",

            "levodopa":
                "Uses_Levodopa",

            "donepezil":
                "Uses_Donepezil",

        }

        # ==================================================
        # Defaults
        # ==================================================

        for feature_name in (
            medication_map.values()
        ):

            features[feature_name] = 0

        # ==================================================
        # Read Medication Table
        # ==================================================

        for medication in medications:

            medicine_name = getattr(
                medication,
                "medicine_name",
                "",
            )

            if not medicine_name:
                continue

            medicine_name = (
                str(medicine_name)
                .lower()
                .strip()
            )

            for medication_name, feature_name in (
                medication_map.items()
            ):

                if medication_name in medicine_name:

                    features[
                        feature_name
                    ] = 1

    # ======================================================
    # DERIVED / NORMALIZED FEATURES
    #
    # Single place for every training feature that isn't
    # raw patient/vital/condition/medication data — either
    # computed from other features, or a DB value that uses
    # different labels than the training data's categories.
    #
    # Runs after base + condition + medication features are
    # populated, since several of these read values (e.g.
    # Sleep_Hours, Activity_Steps) set earlier in the build.
    # ======================================================

    def _prepare_derived_features(
        self,
        features,
    ):

        # ==================================================
        # Age Group
        # ==================================================

        age = features.get("Age")

        if age is None:
            age = 0

        age = float(age)

        if 60 <= age <= 69:
            features["Age_Group"] = "60-69"

        elif 70 <= age <= 79:
            features["Age_Group"] = "70-79"

        elif 80 <= age <= 89:
            features["Age_Group"] = "80-89"

        elif age >= 90:
            features["Age_Group"] = "90+"

        else:
            features["Age_Group"] = "60-69"

        # ==================================================
        # Ethnicity
        #
        # Model encoder was trained on:
        # African, Asian, European, Hispanic, Middle Eastern
        #
        # Map real-world DB values that aren't in that set
        # onto the closest trained category. This is a
        # compatibility mapping, not a medical equivalence —
        # the long-term fix is retraining with the categories
        # the application actually accepts.
        # ==================================================

        ethnicity = features.get("Ethnicity")

        if ethnicity == "Indian":
            features["Ethnicity"] = "Asian"

        # ==================================================
        # Medication Adherence
        #
        # Model encoder was trained on:
        # Excellent, Good, Missed, Poor
        # ==================================================

        medication_adherence = features.get(
            "Medication_Adherence"
        )

        if medication_adherence == "High":
            features["Medication_Adherence"] = "Excellent"

        elif medication_adherence == "Medium":
            features["Medication_Adherence"] = "Good"

        elif medication_adherence == "Low":
            features["Medication_Adherence"] = "Poor"

        # ==================================================
        # Scenario
        #
        # Model encoder was trained on:
        # Acute_Event, Improving, Mild_Deterioration,
        # Moderate_Deterioration, Stable
        #
        # Not currently caregiver-entered or derived from a
        # trend engine — defaulting every patient to "Stable"
        # is a placeholder, not a clinical assessment. Once
        # vitals-trend logic exists, this should be computed
        # instead of defaulted.
        # ==================================================

        scenario = features.get("Scenario")

        if not scenario or scenario == 0:
            features["Scenario"] = "Stable"

        # ==================================================
        # Sleep Quality
        #
        # Model encoder was trained on:
        # Average, Good, Poor
        #
        # Not stored on Patient/VitalLog directly — derived
        # from Sleep_Hours.
        # ==================================================

        sleep_hours = features.get("Sleep_Hours")

        if sleep_hours is None:
            features["Sleep_Quality"] = "Average"

        elif sleep_hours >= 7:
            features["Sleep_Quality"] = "Good"

        elif sleep_hours >= 5:
            features["Sleep_Quality"] = "Average"

        else:
            features["Sleep_Quality"] = "Poor"

        # ==================================================
        # Activity Level
        #
        # Model encoder was trained on:
        # High, Low, Moderate
        #
        # Not stored on Patient/VitalLog directly — derived
        # from Activity_Steps.
        # ==================================================

        activity_steps = features.get("Activity_Steps")

        if activity_steps is None:
            features["Activity_Level"] = "Moderate"

        elif activity_steps >= 8000:
            features["Activity_Level"] = "High"

        elif activity_steps >= 4000:
            features["Activity_Level"] = "Moderate"

        else:
            features["Activity_Level"] = "Low"

        return features

    # ======================================================
    # FEATURE VALIDATION
    #
    # Surfaces every health feature that's missing or still
    # at a placeholder 0 before it reaches the model, instead
    # of failing one encoder ValueError at a time. Doesn't
    # raise — this is a diagnostic pass so all problems show
    # up together; _create_health_dataframe still raises on
    # any value the encoder can't actually accept.
    # ======================================================

    # Features where 0 is a legitimate value, not a sign
    # that the field was never populated.
    _ZERO_IS_VALID_FEATURES = {
        "Age",
        "Height_cm",
        "Weight_kg",
        "BMI",
    }

    def _validate_features(
        self,
        features,
    ):

        problems = []

        for column in self.health_features:

            value = features.get(column)

            if value is None:

                problems.append(
                    f"{column}: MISSING"
                )

            elif (
                value == 0
                and column not in self._ZERO_IS_VALID_FEATURES
            ):

                problems.append(
                    f"{column}: 0"
                )

        if problems:

            print(
                "AI FEATURE VALIDATION — "
                f"{len(problems)} problem(s):",
            )

            for problem in problems:
                print("  -", problem)

        else:

            print(
                "AI FEATURE VALIDATION — "
                "all health features populated"
            )

        return problems

    # ======================================================
    # HEALTH DATAFRAME
    # ======================================================

    def _create_health_dataframe(
        self,
        features,
    ):

        row = {}

        # ==================================================
        # Exact Training Feature Order
        # ==================================================

        for column in self.health_features:

            row[column] = features.get(
                column,
                0,
            )

        df = pd.DataFrame([row])

        # ==================================================
        # Encode Categorical Features
        # ==================================================

        for column, encoder in (
            self.health_encoders.items()
        ):

            if column not in df.columns:
                continue

            value = str(
                df[column].iloc[0]
            )

            # =================================================
            # Validate Category
            # =================================================

            if value not in encoder.classes_:

                raise ValueError(
                    f"Unknown value in health "
                    f"feature '{column}': "
                    f"{value}. "
                    f"Expected one of: "
                    f"{list(encoder.classes_)}"
                )

            df[column] = encoder.transform(
                [value]
            )

        # ==================================================
        # Convert Everything Numeric
        # ==================================================

        df = df.apply(
            pd.to_numeric,
            errors="coerce",
        )

        df = df.fillna(0)

        # ==================================================
        # Return Encoded Features Directly
        #
        # V2 model expects the 99 ordered/encoded features
        # as-is — no scaler in this pipeline, since the
        # training pipeline did not scale the final model
        # input.
        # ==================================================

        return df[self.health_features]

    # ======================================================
    # GENERIC DATAFRAME
    # ======================================================

    def _create_dataframe(
        self,
        features,
        expected_columns,
    ):

        row = {}

        for column in expected_columns:

            row[column] = features.get(
                column,
                0,
            )

        return pd.DataFrame([row])


# ==========================================================
# Singleton
# ==========================================================

feature_pipeline = FeaturePipeline()