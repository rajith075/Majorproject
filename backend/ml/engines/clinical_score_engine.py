"""
=========================================================
Clinical Score Engine V2
=========================================================

Generates clinical scores and ML labels for the
elderly healthcare AI platform.

Same architecture as V1 (targeted logic fixes only, no
structural rewrite):
    - Recommendation text is now separate from Alert_Level
      (V1 reused the same "Watch/Urgent/Emergency" strings
      for both, so Recommendation was really just a second
      Alert column).
    - Confidence now reflects how much evidence backs the
      score (comorbidities, abnormal vitals, scenario),
      not just the score's own magnitude.
    - Event detection uses combinations of disease + vital
      abnormality instead of disease presence alone.
    - Weights shifted slightly toward Cardiovascular/Trend,
      per the elderly-monitoring rationale discussed.

Author: Rajith Elderly AI
"""

import numpy as np


class ClinicalScoreEngine:

    # Domain -> weight in the final Clinical_Score. Sums to 1.0.
    WEIGHTS = {
        "cardio": 0.30,
        "resp": 0.20,
        "trend": 0.20,
        "metabolic": 0.10,
        "neuro": 0.10,
        "lifestyle": 0.10,
    }

    RECOMMENDATIONS = {
        "Stable": "Continue routine monitoring.",
        "Low": "Increase hydration, encourage rest, and monitor vitals.",
        "Moderate": "Contact caregiver and repeat vital assessment within 30 minutes.",
        "High": "Immediate medical review is recommended. Closely monitor the patient.",
        "Critical": "Seek emergency medical assistance immediately.",
    }

    ALERTS = {
        "Stable": "None",
        "Low": "Watch",
        "Moderate": "Notify Caregiver",
        "High": "Urgent",
        "Critical": "Emergency",
    }

    # Disease/lifestyle columns counted toward comorbidity load for confidence.
    COMORBIDITY_COLUMNS = [
        "Heart_Disease", "Hypertension", "COPD", "Asthma", "Stroke",
        "Parkinsons", "Alzheimers", "Diabetes", "Kidney_Disease",
        "Thyroid", "Smoking", "Alcohol",
    ]

    SCENARIO_CONFIDENCE_BONUS = {
        "Stable": 0,
        "Improving": 0,
        "Mild_Deterioration": 5,
        "Moderate_Deterioration": 10,
        "Acute_Event": 15,
    }

    def __init__(self):
        pass

    # --------------------------------------------------

    @staticmethod
    def normalize(value, low=0, high=100):
        return max(low, min(high, value))

    # --------------------------------------------------

    def cardiovascular_score(self, row):

        score = 0

        hr_dev = abs(row["Heart_Rate"] - row["Baseline_Heart_Rate"])
        sbp_dev = abs(row["Systolic_BP"] - row["Baseline_Systolic_BP"])

        score += min(hr_dev * 1.5, 35)
        score += min(sbp_dev * 1.2, 35)

        if row["Heart_Disease"]:
            score += 15

        if row["Hypertension"]:
            score += 10

        return self.normalize(score)

    # --------------------------------------------------

    def respiratory_score(self, row):

        score = 0

        if row["SpO2"] < row["Baseline_SpO2"]:

            score += (row["Baseline_SpO2"] - row["SpO2"]) * 8

        rr_dev = abs(
            row["Respiratory_Rate"]
            - row["Baseline_Respiratory_Rate"]
        )

        score += rr_dev * 2

        if row["COPD"]:
            score += 15

        if row["Asthma"]:
            score += 10

        return self.normalize(score)

    # --------------------------------------------------

    def neurological_score(self, row):

        score = 0

        if row["Stroke"]:
            score += 20

        if row["Parkinsons"]:
            score += 20

        if row["Alzheimers"]:
            score += 20

        return self.normalize(score)

    # --------------------------------------------------

    def metabolic_score(self, row):

        score = 0

        if row["Diabetes"]:
            score += 20

        if row["Kidney_Disease"]:
            score += 15

        if row["Thyroid"]:
            score += 10

        return self.normalize(score)

    # --------------------------------------------------

    def lifestyle_score(self, row):

        score = 0

        if row["Smoking"]:
            score += 20

        if row["Alcohol"]:
            score += 10

        if row["Sleep_Hours"] < 5:
            score += 20

        if row["Activity_Steps"] < 1500:
            score += 20

        return self.normalize(score)

    # --------------------------------------------------

    def trend_score(self, row):

        score = 0

        if row["Scenario"] == "Mild_Deterioration":
            score = 40

        elif row["Scenario"] == "Moderate_Deterioration":
            score = 70

        elif row["Scenario"] == "Acute_Event":
            score = 100

        elif row["Scenario"] == "Improving":
            score = 10

        return score

    # --------------------------------------------------
    # Helpers for confidence + event detection
    # --------------------------------------------------

    def _comorbidity_count(self, row):
        return sum(1 for col in self.COMORBIDITY_COLUMNS if row.get(col, 0))

    def _abnormal_vital_count(self, row):
        """
        Count vitals that are meaningfully out of range for this row,
        used both for confidence and for gating event detection so a
        single disease flag doesn't trigger an event on its own.
        """
        abnormal = 0

        if abs(row["Heart_Rate"] - row["Baseline_Heart_Rate"]) > 15:
            abnormal += 1

        if abs(row["Systolic_BP"] - row["Baseline_Systolic_BP"]) > 20:
            abnormal += 1

        if row["SpO2"] < 92:
            abnormal += 1

        if abs(row["Respiratory_Rate"] - row["Baseline_Respiratory_Rate"]) > 5:
            abnormal += 1

        if row["Temperature"] > 37.8:
            abnormal += 1

        if row["Sleep_Hours"] < 5:
            abnormal += 1

        if row["Activity_Steps"] < 1500:
            abnormal += 1

        return abnormal

    def _compute_confidence(self, score, comorbidity_count, abnormal_count, scenario):
        """
        Confidence = how much evidence backs the Clinical_Score, not
        just the score's own size. A high score with no supporting
        abnormal vitals/comorbidities is treated as less confident
        than a high score backed by multiple converging signals.
        """
        confidence = 50
        confidence += score * 0.25
        confidence += min(abnormal_count * 4, 20)
        confidence += min(comorbidity_count * 2, 12)
        confidence += self.SCENARIO_CONFIDENCE_BONUS.get(scenario, 0)

        return round(min(99, max(30, confidence)), 1)

    def _detect_event(self, row, abnormal_count):
        """
        Events now require disease + a genuinely abnormal vital,
        not disease presence alone (e.g. a diabetic with normal
        vitals no longer gets flagged "Metabolic Risk").
        """
        hr_dev = row["Heart_Rate"] - row["Baseline_Heart_Rate"]

        if row["COPD"] and row["SpO2"] < 90:
            return "Respiratory Distress"

        if row["Asthma"] and row["SpO2"] < 90:
            return "Respiratory Distress"

        if row["Hypertension"] and row["Systolic_BP"] > 180:
            return "Hypertensive Crisis"

        if row["Stroke"] and row["Systolic_BP"] > 170:
            return "Possible Stroke"

        if row["Heart_Disease"] and hr_dev > 15 and row["SpO2"] < 94:
            return "Cardiac Event Risk"

        if row["Diabetes"] and abnormal_count >= 2:
            return "Metabolic Risk"

        return "Stable"

    # --------------------------------------------------

    def apply(self, df):

        cardio = []
        resp = []
        neuro = []
        metabolic = []
        lifestyle = []
        trend = []

        clinical = []

        risk = []
        alert = []
        event = []
        recommendation = []
        confidence = []

        for _, row in df.iterrows():

            c = self.cardiovascular_score(row)
            r = self.respiratory_score(row)
            n = self.neurological_score(row)
            m = self.metabolic_score(row)
            l = self.lifestyle_score(row)
            t = self.trend_score(row)

            score = (
                c * self.WEIGHTS["cardio"] +
                r * self.WEIGHTS["resp"] +
                n * self.WEIGHTS["neuro"] +
                m * self.WEIGHTS["metabolic"] +
                l * self.WEIGHTS["lifestyle"] +
                t * self.WEIGHTS["trend"]
            )

            score = round(score, 1)

            cardio.append(c)
            resp.append(r)
            neuro.append(n)
            metabolic.append(m)
            lifestyle.append(l)
            trend.append(t)

            clinical.append(score)

            if score < 20:
                rl = "Stable"
            elif score < 40:
                rl = "Low"
            elif score < 60:
                rl = "Moderate"
            elif score < 80:
                rl = "High"
            else:
                rl = "Critical"

            risk.append(rl)
            alert.append(self.ALERTS[rl])
            recommendation.append(self.RECOMMENDATIONS[rl])

            # -------------------------
            abnormal_count = self._abnormal_vital_count(row)
            comorbidity_count = self._comorbidity_count(row)

            event.append(self._detect_event(row, abnormal_count))

            confidence.append(
                self._compute_confidence(
                    score, comorbidity_count, abnormal_count, row["Scenario"]
                )
            )

        df["Cardiovascular_Risk"] = cardio
        df["Respiratory_Risk"] = resp
        df["Neurological_Risk"] = neuro
        df["Metabolic_Risk"] = metabolic
        df["Lifestyle_Risk"] = lifestyle
        df["Trend_Risk"] = trend

        df["Clinical_Score"] = clinical

        df["Risk_Level"] = risk
        df["Alert_Level"] = alert
        df["Possible_Event"] = event
        df["Recommendation"] = recommendation
        df["Confidence"] = confidence

        return df