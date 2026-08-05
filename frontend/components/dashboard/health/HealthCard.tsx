"use client";

import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Clock,
} from "lucide-react";

import type { HealthMetric } from "@/types/health";

interface VitalCardProps {
  metric: HealthMetric;
}

const statusStyles = {
  excellent: {
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  good: {
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  normal: {
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  warning: {
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  critical: {
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
};

const colorStyles: Record<string, string> = {
  rose: "from-rose-400 to-rose-500",
  violet: "from-violet-400 to-violet-500",
  sky: "from-sky-400 to-sky-500",
  amber: "from-amber-400 to-orange-500",
  indigo: "from-indigo-400 to-indigo-500",
  emerald: "from-emerald-400 to-emerald-500",
  cyan: "from-cyan-400 to-cyan-500",
  purple: "from-purple-400 to-purple-500",
};

export default function VitalCard({
  metric,
}: VitalCardProps) {
  const Icon = metric.icon;

  const TrendIcon =
    metric.trendDirection === "up"
      ? ArrowUp
      : metric.trendDirection === "down"
      ? ArrowDown
      : ArrowRight;

  const trendColor =
    metric.trendDirection === "up"
      ? "text-emerald-600"
      : metric.trendDirection === "down"
      ? "text-red-500"
      : "text-slate-500";

  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      transition={{
        duration: 0.25,
      }}
      className="group rounded-3xl border border-violet-100 bg-white/90 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-xl"
    >
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${colorStyles[metric.color]} text-white shadow-lg`}
        >
          <Icon className="h-7 w-7" />
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[metric.status].badge}`}
        >
          {metric.status}
        </span>
      </div>

      {/* Title */}

      <p className="text-sm font-medium text-slate-500">
        {metric.title}
      </p>

      {/* Value */}

      <div className="mt-2 flex items-end gap-2">
        <h2 className="text-4xl font-bold text-slate-900">
          {metric.value}
        </h2>

        {metric.unit && (
          <span className="mb-1 text-sm text-slate-500">
            {metric.unit}
          </span>
        )}
      </div>

      {/* Trend */}

      <div className="mt-5 flex items-center justify-between">
        <div
          className={`flex items-center gap-1 text-sm font-semibold ${trendColor}`}
        >
          <TrendIcon className="h-4 w-4" />

          <span>
            {metric.trend > 0 && "+"}
            {metric.trend}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />

          <span>{metric.lastUpdated}</span>
        </div>
      </div>

      {/* Bottom Accent */}

      <div className="mt-6 h-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorStyles[metric.color]} transition-all duration-700 group-hover:w-full`}
          style={{ width: "65%" }}
        />
      </div>
    </motion.div>
  );
}