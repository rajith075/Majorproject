"use client";

import VitalCard from "./VitalCard";

import { healthMetrics } from "@/constants/mock/health";

export default function HealthSection() {
  return (
    <section className="space-y-6">
      {/* Section Header */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Health Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Real-time health metrics and patient vitals.
          </p>
        </div>
      </div>

      {/* Health Cards */}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {healthMetrics.map((metric) => (
          <VitalCard
            key={metric.id}
            metric={metric}
          />
        ))}
      </div>
    </section>
  );
}