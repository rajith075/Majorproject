"use client";

import { useEffect, useState } from "react";
import { usePatientStore } from "@/store/patient-store";
import { getLatestPrediction } from "@/services/api/ai";

interface AIPrediction {
  overall_health_score: number;
  health_risk: string;
  clinical_event?: string;
}

export default function FamilyOverview() {
  const patient = usePatientStore((state) => state.patient);

  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patient?.id) return;

    const loadPrediction = async () => {
      try {
        setLoading(true);

        const data = await getLatestPrediction(patient.id);

        console.log("FAMILY AI PREDICTION:", data);

        setPrediction(data);
      } catch (error) {
        console.error(
          "FAMILY: Failed to load AI prediction:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadPrediction();
  }, [patient?.id]);

  if (!patient) return null;

  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-2xl bg-slate-200"
          />
        ))}
      </section>
    );
  }

  const healthRisk =
    prediction?.health_risk?.toUpperCase() ?? "N/A";

  const clinicalStatus =
    prediction?.clinical_event?.toUpperCase() ?? "N/A";

  const healthScore =
    prediction?.overall_health_score ?? 0;

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">
          Health Overview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          AI-powered summary of the current health condition.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Health Risk */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Health Risk
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />

            <h3 className="text-2xl font-bold text-emerald-600">
              {healthRisk}
            </h3>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            AI risk assessment
          </p>
        </div>

        {/* Clinical Status */}
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Clinical Status
          </p>

          <h3 className="mt-4 text-2xl font-bold text-blue-600">
            {clinicalStatus}
          </h3>

          <p className="mt-2 text-xs text-slate-400">
            Current AI assessment
          </p>
        </div>

        {/* Overall Score */}
        <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Overall Health Score
          </p>

          <div className="mt-3 flex items-end gap-2">
            <h3 className="text-4xl font-bold text-violet-600">
              {healthScore.toFixed(1)}
            </h3>

            <span className="mb-1 text-sm text-slate-400">
              / 100
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{
                width: `${Math.min(
                  Math.max(healthScore, 0),
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}