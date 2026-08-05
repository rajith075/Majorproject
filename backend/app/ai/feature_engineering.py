"""
==========================================================
Feature Engineering

Mathematical feature calculations
==========================================================
"""


class FeatureEngineering:

    @staticmethod
    def pulse_pressure(
        systolic_bp,
        diastolic_bp,
    ):
        return systolic_bp - diastolic_bp

    @staticmethod
    def mean_arterial_pressure(
        systolic_bp,
        diastolic_bp,
    ):
        return (
            systolic_bp +
            (2 * diastolic_bp)
        ) / 3

    @staticmethod
    def deviation(
        current,
        baseline,
    ):
        return abs(current - baseline)

    @staticmethod
    def sleep_deficit(
        sleep_hours,
    ):
        return max(0, 8 - sleep_hours)

    @staticmethod
    def activity_deficit(
        steps,
    ):
        return max(0, 8000 - steps)

    @staticmethod
    def fever_flag(
        temperature,
    ):
        return int(temperature >= 38)

    @staticmethod
    def low_oxygen_flag(
        spo2,
    ):
        return int(spo2 < 92)

    @staticmethod
    def tachycardia_flag(
        heart_rate,
    ):
        return int(heart_rate > 100)

    @staticmethod
    def hypertension_flag(
        systolic_bp,
    ):
        return int(systolic_bp >= 140)