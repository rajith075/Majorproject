"""
=========================================================
Sensor Generator V4
=========================================================
Simulates realistic IoT / wearable vitals time-series for
elderly patients, driven by:

    Baseline -> Disease Effect -> Medication Effect
             -> Scenario Effect (nonlinear) -> Noise -> Reading

Public interface is unchanged from V3 (`apply(df)`), so this
drops into the existing pipeline without touching any other file.

ASSUMPTIONS ABOUT INPUT COLUMNS
--------------------------------
Required (same as V3):
    Baseline_Heart_Rate, Baseline_Systolic_BP, Baseline_Diastolic_BP,
    Baseline_SpO2, Baseline_Temperature, Baseline_Respiratory_Rate,
    Scenario

Optional disease flags - if a column is missing it is simply
treated as "patient doesn't have this condition" (0), so the
generator will still run even if your dataframe doesn't have all
of them yet:
    Has_COPD, Has_Asthma, Has_Diabetes, Has_Hypertension,
    Has_Heart_Disease, Has_Arthritis, Has_Parkinsons

Optional medication flags (same treatment):
    Uses_Amlodipine, Uses_Losartan, Uses_Beta_Blocker, Uses_Insulin

If your real column names differ from these, you only need to
edit the two dictionaries below (DISEASE_EFFECTS /
MEDICATION_EFFECTS) - nothing else in the file needs to change.
Flags are read leniently: 1/0, True/False, or "Yes"/"No" strings
all work.
"""

import random
import pandas as pd
from datetime import datetime, timedelta

random.seed(42)


class SensorGenerator:

    # Disease -> effects on each vital.
    # '<Vital>_offset' = applied once at the start (chronic baseline shift)
    # '<Vital>_drift'  = applied every single hour (ongoing tendency)
    DISEASE_EFFECTS = {
        "Has_COPD": {
            "SpO2_offset": -3, "RR_offset": +4, "RR_drift": +0.1,
        },
        "Has_Asthma": {
            "SpO2_offset": -1, "RR_offset": +2,
        },
        "Has_Heart_Disease": {
            "HR_offset": +6, "SBP_offset": +4,
        },
        "Has_Hypertension": {
            "SBP_offset": +10, "DBP_offset": +5,
        },
        "Has_Diabetes": {
            "HR_drift": +0.05,
        },
        "Has_Arthritis": {
            # no direct vital effect - handled via mobility (sleep/steps)
        },
        "Has_Parkinsons": {
            # no direct vital effect - handled via mobility (sleep/steps)
        },
    }

    MEDICATION_EFFECTS = {
        "Uses_Amlodipine":   {"SBP_offset": -6, "DBP_offset": -3},
        "Uses_Losartan":     {"SBP_offset": -8, "DBP_offset": -4},
        "Uses_Beta_Blocker": {"HR_offset": -8},
        "Uses_Insulin":      {"HR_drift": -0.02},
    }

    # Conditions that reduce mobility -> less sleep quality, fewer steps
    MOBILITY_LIMITING_CONDITIONS = ["Has_Arthritis", "Has_Parkinsons"]

    def __init__(self, observations=10):
        self.observations = observations

    # ----------------------------------------------------
    # Helpers
    # ----------------------------------------------------

    def _flag(self, patient, column):
        """Read a boolean/0-1/Yes-No flag safely. Missing column -> False."""
        value = patient.get(column, 0)
        if isinstance(value, str):
            return value.strip().lower() in ("1", "true", "yes", "y")
        try:
            return bool(value)
        except Exception:
            return False

    def _sum_effects(self, patient, effects_table, key):
        total = 0
        for column, effects in effects_table.items():
            if self._flag(patient, column):
                total += effects.get(key, 0)
        return total

    def _progression_factor(self, scenario, i, observations):
        """
        Nonlinear progression multiplier for scenario effects.
        Real deterioration/improvement isn't a flat per-hour step -
        it usually starts slow and accelerates (or, for Acute_Event,
        stays flat with an occasional late crisis spike).
        """
        progress = i / max(observations - 1, 1)  # 0.0 -> 1.0

        if scenario == "Mild_Deterioration":
            return 0.5 + 0.5 * progress                 # 0.5 -> 1.0
        elif scenario == "Moderate_Deterioration":
            return 0.4 + 1.1 * (progress ** 1.5)         # 0.4 -> ~1.5, accelerating
        elif scenario == "Acute_Event":
            spike = progress > 0.6 and random.random() < 0.30
            return 3.0 if spike else 1.0
        elif scenario == "Improving":
            return 0.6 + 0.4 * progress
        return 1.0  # Stable

    # ----------------------------------------------------
    # Core vital simulation
    # ----------------------------------------------------

    def apply_scenario(self, scenario, value, increase, step, factor):
        if scenario == "Stable":
            value += random.randint(-increase, increase)
        elif scenario == "Improving":
            value -= step * factor
            value += random.randint(-1, 1)
        elif scenario == "Mild_Deterioration":
            value += step * factor
            value += random.randint(-1, 1)
        elif scenario == "Moderate_Deterioration":
            value += step * factor
            value += random.randint(0, 2)
        elif scenario == "Acute_Event":
            value += step * factor
            value += random.randint(-1, 1)
        return value

    def _generate_bp(self, scenario, sbp, dbp, factor):
        """
        Update SBP and DBP together and enforce a physiologically
        plausible pulse pressure, instead of drifting them
        independently (which could previously produce DBP > SBP).
        """
        sbp = self.apply_scenario(scenario, sbp, 4, 3, factor)
        dbp = self.apply_scenario(scenario, dbp, 3, 2, factor)

        min_gap = 25
        preferred_gap = random.randint(30, 60)

        if sbp - dbp < min_gap:
            if random.random() < 0.7:
                dbp = sbp - preferred_gap
            else:
                sbp = dbp + preferred_gap

        return sbp, dbp

    # ----------------------------------------------------

    def generate_patient_readings(self, patient):
        rows = []
        scenario = patient["Scenario"]
        start = datetime(2026, 1, 1, 8, 0)

        hr = patient["Baseline_Heart_Rate"]
        sbp = patient["Baseline_Systolic_BP"]
        dbp = patient["Baseline_Diastolic_BP"]
        spo2 = patient["Baseline_SpO2"]
        temp = patient["Baseline_Temperature"]
        rr = patient["Baseline_Respiratory_Rate"]

        # ---- One-time chronic offsets from disease + medication ----
        hr += self._sum_effects(patient, self.DISEASE_EFFECTS, "HR_offset")
        hr += self._sum_effects(patient, self.MEDICATION_EFFECTS, "HR_offset")

        sbp += self._sum_effects(patient, self.DISEASE_EFFECTS, "SBP_offset")
        sbp += self._sum_effects(patient, self.MEDICATION_EFFECTS, "SBP_offset")

        dbp += self._sum_effects(patient, self.DISEASE_EFFECTS, "DBP_offset")
        dbp += self._sum_effects(patient, self.MEDICATION_EFFECTS, "DBP_offset")

        spo2 += self._sum_effects(patient, self.DISEASE_EFFECTS, "SpO2_offset")
        rr += self._sum_effects(patient, self.DISEASE_EFFECTS, "RR_offset")

        # Ongoing small per-hour drift from chronic conditions/meds
        hr_drift = (self._sum_effects(patient, self.DISEASE_EFFECTS, "HR_drift")
                    + self._sum_effects(patient, self.MEDICATION_EFFECTS, "HR_drift"))
        rr_drift = self._sum_effects(patient, self.DISEASE_EFFECTS, "RR_drift")

        is_limited_mobility = any(
            self._flag(patient, c) for c in self.MOBILITY_LIMITING_CONDITIONS
        )

        for i in range(self.observations):
            timestamp = start + timedelta(hours=i)
            factor = self._progression_factor(scenario, i, self.observations)
            is_crisis_hour = (scenario == "Acute_Event" and factor > 1.0)

            # -------------------------------
            hr = self.apply_scenario(scenario, hr, 3, 2, factor)
            hr += hr_drift

            sbp, dbp = self._generate_bp(scenario, sbp, dbp, factor)

            rr = self.apply_scenario(scenario, rr, 2, 1, factor)
            rr += rr_drift

            temp = round(
                self.apply_scenario(scenario, temp, 0, 0.15, factor),
                1
            )

            # Oxygen behaves opposite - deterioration lowers it
            if scenario == "Stable":
                spo2 += random.randint(-1, 1)
            elif scenario == "Improving":
                spo2 += random.randint(0, 1)
            elif scenario == "Mild_Deterioration":
                spo2 -= round(random.randint(0, 1) * factor)
            elif scenario == "Moderate_Deterioration":
                spo2 -= round(random.randint(1, 2) * factor)
            elif scenario == "Acute_Event":
                spo2 -= random.randint(3, 5) if is_crisis_hour else random.randint(0, 1)

            # -------------------------------
            # Clamp to physiologically plausible ranges.
            # Temperature ceiling is much tighter than V3 - 41.5 was
            # reachable by anyone, which is medically very rare.
            hr = max(45, min(hr, 180))
            sbp = max(80, min(sbp, 220))
            dbp = max(40, min(dbp, 130))
            spo2 = max(75, min(spo2, 100))
            rr = max(8, min(rr, 40))

            temp_ceiling = 41.0 if is_crisis_hour else 37.8
            temp = max(35.5, min(temp, temp_ceiling))

            # Re-check BP ordering after clamping, in case a clamp
            # pulled SBP/DBP close enough to break the pulse pressure rule
            if sbp - dbp < 20:
                dbp = max(40, sbp - 25)

            # ---- Sleep & activity depend on mobility + scenario ----
            if is_limited_mobility:
                sleep = round(random.uniform(3, 6), 1)
                steps = random.randint(200, 3500)
            else:
                sleep = round(random.uniform(5, 8.5), 1)
                steps = random.randint(1500, 9000)

            if scenario in ("Moderate_Deterioration", "Acute_Event"):
                sleep = round(max(2.0, sleep - random.uniform(1, 2.5)), 1)
                steps = max(100, int(steps * random.uniform(0.2, 0.5)))
            elif scenario == "Improving":
                steps = int(steps * random.uniform(1.0, 1.2))

            row = patient.to_dict()
            row.update({
                "Scenario": scenario,
                "Timestamp": timestamp,
                "Heart_Rate": round(hr),
                "Systolic_BP": round(sbp),
                "Diastolic_BP": round(dbp),
                "SpO2": round(spo2),
                "Temperature": temp,
                "Respiratory_Rate": round(rr),
                "Sleep_Hours": sleep,
                "Activity_Steps": steps
            })
            rows.append(row)

        return rows

    # ----------------------------------------------------

    def apply(self, df):
        dataset = []
        for _, patient in df.iterrows():
            dataset.extend(self.generate_patient_readings(patient))
        return pd.DataFrame(dataset)