# ==========================================================
# Feature Engineering
# ==========================================================


class FeatureEngineering:

    # ======================================================
    # Basic Calculations
    # ======================================================

    @staticmethod
    def pulse_pressure(systolic_bp, diastolic_bp):
        return systolic_bp - diastolic_bp

    @staticmethod
    def mean_arterial_pressure(systolic_bp, diastolic_bp):
        return (
            systolic_bp +
            (2 * diastolic_bp)
        ) / 3

    @staticmethod
    def deviation(current, baseline):
        return abs(current - baseline)

    @staticmethod
    def sleep_deficit(sleep_hours):
        return max(0, 8 - sleep_hours)

    @staticmethod
    def activity_deficit(steps):
        return max(0, 8000 - steps)

    # ======================================================
    # Vital Flags
    # ======================================================

    @staticmethod
    def fever_flag(temperature):
        return int(temperature >= 38)

    @staticmethod
    def low_oxygen_flag(spo2):
        return int(spo2 < 92)

    @staticmethod
    def tachycardia_flag(heart_rate):
        return int(heart_rate > 100)

    @staticmethod
    def hypertension_flag(systolic_bp):
        return int(systolic_bp >= 140)

    # ======================================================
    # Disease Helpers
    # ======================================================

    @staticmethod
    def disease_present(features, disease):
        return int(features.get(disease, 0) == 1)

    # ======================================================
    # Comorbidity Count
    # ======================================================

    @staticmethod
    def calculate_comorbidity_count(features):

        diseases = [
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

        return sum(
            FeatureEngineering.disease_present(
                features,
                disease,
            )
            for disease in diseases
        )

    # ======================================================
    # High Risk Disease Count
    # ======================================================

    @staticmethod
    def calculate_high_risk_disease_count(features):

        high_risk_diseases = [
            "Heart_Disease",
            "Stroke",
            "COPD",
            "Kidney_Disease",
            "Alzheimers",
            "Parkinsons",
            "Cancer",
        ]

        return sum(
            FeatureEngineering.disease_present(
                features,
                disease,
            )
            for disease in high_risk_diseases
        )

    # ======================================================
    # Cardiovascular Score
    # ======================================================

    @staticmethod
    def cardiovascular_score(features):

        score = 0

        if features.get("Heart_Disease", 0) == 1:
            score += 2

        if features.get("Hypertension", 0) == 1:
            score += 1

        if features.get("Stroke", 0) == 1:
            score += 2

        if features.get("Systolic_BP", 0) >= 140:
            score += 1

        if features.get("Heart_Rate", 0) > 100:
            score += 1

        return score

    # ======================================================
    # Respiratory Score
    # ======================================================

    @staticmethod
    def respiratory_score(features):

        score = 0

        if features.get("COPD", 0) == 1:
            score += 2

        if features.get("Asthma", 0) == 1:
            score += 1

        if features.get("SpO2", 0) < 92:
            score += 2

        if features.get("Respiratory_Rate", 0) > 20:
            score += 1

        if features.get("Temperature", 0) >= 38:
            score += 1

        return score

    # ======================================================
    # Neurological Score
    # ======================================================

    @staticmethod
    def neurological_score(features):

        score = 0

        if features.get("Stroke", 0) == 1:
            score += 2

        if features.get("Parkinsons", 0) == 1:
            score += 2

        if features.get("Alzheimers", 0) == 1:
            score += 2

        memory_status = features.get(
            "Memory_Status",
            "Normal",
        )

        if memory_status == "Mild Impairment":
            score += 1

        elif memory_status == "Moderate Impairment":
            score += 2

        elif memory_status == "Severe Impairment":
            score += 3

        return score

    # ======================================================
    # Metabolic Score
    # ======================================================

    @staticmethod
    def metabolic_score(features):

        score = 0

        if features.get("Diabetes", 0) == 1:
            score += 2

        if features.get("Thyroid", 0) == 1:
            score += 1

        if features.get("Liver_Disease", 0) == 1:
            score += 1

        if features.get("BMI", 0) >= 30:
            score += 1

        return score

    # ======================================================
    # Mobility Score
    # ======================================================

    @staticmethod
    def mobility_score(features):

        mobility = features.get(
            "Mobility",
            "Independent",
        )

        if mobility == "Independent":
            return 0

        if mobility == "Assisted":
            return 1

        if mobility == "Wheelchair":
            return 2

        if mobility == "Bedridden":
            return 3

        return 0

    # ======================================================
    # Sleep Score
    # ======================================================

    @staticmethod
    def sleep_score(features):

        sleep_hours = features.get(
            "Sleep_Hours",
            8,
        )

        if sleep_hours >= 7:
            return 0

        if sleep_hours >= 5:
            return 1

        if sleep_hours >= 3:
            return 2

        return 3

    # ======================================================
    # Master Engineering Function
    # ======================================================

    def calculate(self, features):

        # --------------------------------------------------
        # Pulse Pressure
        # --------------------------------------------------

        features["Pulse_Pressure"] = self.pulse_pressure(
            features["Systolic_BP"],
            features["Diastolic_BP"],
        )

        # --------------------------------------------------
        # MAP
        # --------------------------------------------------

        features["MAP"] = self.mean_arterial_pressure(
            features["Systolic_BP"],
            features["Diastolic_BP"],
        )

        # --------------------------------------------------
        # Deviations
        # --------------------------------------------------

        features["Heart_Rate_Deviation"] = self.deviation(
            features["Heart_Rate"],
            features["Baseline_Heart_Rate"],
        )

        features["Systolic_BP_Deviation"] = self.deviation(
            features["Systolic_BP"],
            features["Baseline_Systolic_BP"],
        )

        features["Diastolic_BP_Deviation"] = self.deviation(
            features["Diastolic_BP"],
            features["Baseline_Diastolic_BP"],
        )

        features["SpO2_Deviation"] = self.deviation(
            features["SpO2"],
            features["Baseline_SpO2"],
        )

        features["Temperature_Deviation"] = self.deviation(
            features["Temperature"],
            features["Baseline_Temperature"],
        )

        features["Respiratory_Deviation"] = self.deviation(
            features["Respiratory_Rate"],
            features["Baseline_Respiratory_Rate"],
        )

        # --------------------------------------------------
        # Sleep
        # --------------------------------------------------

        features["Sleep_Deficit"] = self.sleep_deficit(
            features["Sleep_Hours"],
        )

        # --------------------------------------------------
        # Activity
        # --------------------------------------------------

        features["Activity_Deficit"] = self.activity_deficit(
            features["Activity_Steps"],
        )

        # --------------------------------------------------
        # Flags
        # --------------------------------------------------

        features["Fever_Flag"] = self.fever_flag(
            features["Temperature"],
        )

        features["Low_Oxygen_Flag"] = self.low_oxygen_flag(
            features["SpO2"],
        )

        features["Tachycardia_Flag"] = self.tachycardia_flag(
            features["Heart_Rate"],
        )

        features["Hypertension_Flag"] = self.hypertension_flag(
            features["Systolic_BP"],
        )

        # --------------------------------------------------
        # Vital Abnormality Count
        # --------------------------------------------------

        features["Vital_Abnormality_Count"] = (
            features["Fever_Flag"]
            + features["Low_Oxygen_Flag"]
            + features["Tachycardia_Flag"]
            + features["Hypertension_Flag"]
        )

        # ==================================================
        # NEW MODEL FEATURES
        # ==================================================

        # --------------------------------------------------
        # Comorbidities
        # --------------------------------------------------

        features["Comorbidity_Count"] = (
            self.calculate_comorbidity_count(
                features
            )
        )

        # --------------------------------------------------
        # High Risk Diseases
        # --------------------------------------------------

        features["High_Risk_Disease_Count"] = (
            self.calculate_high_risk_disease_count(
                features
            )
        )

        # --------------------------------------------------
        # Clinical Scores
        # --------------------------------------------------

        features["Cardiovascular_Score"] = (
            self.cardiovascular_score(
                features
            )
        )

        features["Respiratory_Score"] = (
            self.respiratory_score(
                features
            )
        )

        features["Neurological_Score"] = (
            self.neurological_score(
                features
            )
        )

        features["Metabolic_Score"] = (
            self.metabolic_score(
                features
            )
        )

        features["Mobility_Score"] = (
            self.mobility_score(
                features
            )
        )

        features["Sleep_Score"] = (
            self.sleep_score(
                features
            )
        )

        return features