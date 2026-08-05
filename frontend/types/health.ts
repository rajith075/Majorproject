import { LucideIcon } from "lucide-react";

export type HealthStatus =
  | "excellent"
  | "good"
  | "normal"
  | "warning"
  | "critical";

export type TrendDirection =
  | "up"
  | "down"
  | "stable";

export interface HealthMetric {
  id: string;

  title: string;

  description: string;

  icon: LucideIcon;

  value: number | string;

  unit?: string;

  status: HealthStatus;

  trend: number;

  trendDirection: TrendDirection;

  lastUpdated: string;

  color: string;

  chartType: "line" | "bars" | "dots" | "progress";

  history: number[];
}