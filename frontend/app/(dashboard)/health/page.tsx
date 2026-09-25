"use client";
import { Activity } from "lucide-react";

import HealthSection from "@/components/dashboard/health/HealthSection";

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

      <HealthSection />

    </main>
  );
}
