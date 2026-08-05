"""
=========================================================
Trend Generator
=========================================================
Computes rolling averages and deviations.
"""

import pandas as pd


class TrendGenerator:

    def apply(self, df):

        df = df.sort_values(
            ["Patient_ID", "Timestamp"]
        )

        grouped = df.groupby("Patient_ID")

        df["HR_1hr_Avg"] = grouped["Heart_Rate"].transform(

            lambda x: x.rolling(2, min_periods=1).mean()

        )

        df["HR_24hr_Avg"] = grouped["Heart_Rate"].transform(

            lambda x: x.expanding().mean()

        )

        df["SpO2_1hr_Avg"] = grouped["SpO2"].transform(

            lambda x: x.rolling(2, min_periods=1).mean()

        )

        df["BP_24hr_Avg"] = grouped["Systolic_BP"].transform(

            lambda x: x.expanding().mean()

        )

        return df