export interface HealthTrendPoint {
  day: string;
  score: number;
}

export const healthTrend: HealthTrendPoint[] = [
  {
    day: "Mon",
    score: 87,
  },
  {
    day: "Tue",
    score: 89,
  },
  {
    day: "Wed",
    score: 88,
  },
  {
    day: "Thu",
    score: 90,
  },
  {
    day: "Fri",
    score: 91,
  },
  {
    day: "Sat",
    score: 92,
  },
  {
    day: "Sun",
    score: 91,
  },
];

export const healthTrendSummary = {
  currentScore: 91,
  weeklyChange: 3.4,
  previousWeekScore: 88,
};