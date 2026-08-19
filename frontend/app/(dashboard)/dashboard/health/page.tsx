"use client";
import { Activity } from "lucide-react";

import VitalCard from "@/components/dashboard/health/VitalCard";
import { healthMetrics } from "@/constants/mock/health";

export default function HealthPage() {
  return (
    <main className="space-y-10">

      {/* Header */}

      <section className="flex items-center justify-between">

        <div>

          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">

            <Activity className="h-7 w-7"/>

          </div>

          <h1 className="text-4xl font-bold text-slate-900">

            Health Monitor

          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">

            Real-time monitoring of patient vitals, wellness indicators,
            and AI-powered health insights.

          </p>

        </div>

      </section>

      {/* Current Vitals */}

      <section className="space-y-6">

        <div>

          <h2 className="text-2xl font-semibold text-slate-900">

            Current Vital Signs

          </h2>

          <p className="mt-1 text-sm text-slate-500">

            Latest physiological measurements from connected health devices.

          </p>

        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">

          {healthMetrics.map((metric) => (

            <VitalCard

              key={metric.id}

              metric={metric}

            />

          ))}

        </div>

      </section>

    </main>
  );
}