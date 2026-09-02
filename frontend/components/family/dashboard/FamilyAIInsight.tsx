"use client";

import { useEffect, useState } from "react";
import { Brain, Eye, ShieldCheck, Sparkles } from "lucide-react";

import { usePatientStore } from "@/store/patient-store";
import { getLatestPrediction } from "@/services/api/ai";

interface RAGExplanation {
  status?: string;
  summary?: string;
  key_factors?: string[];
  caregiver_guidance?: string;
  disclaimer?: string;
  sources?: string[];
}

interface AIPrediction {
  health_risk: string;
  ai_summary: string;
  alert_level: string;
  alert_message: string;
  rag_explanation?: RAGExplanation | null;
}

export default function FamilyAIInsight() {
  const patient = usePatientStore((state) => state.patient);

  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patient?.id) return;

    const loadPrediction = async () => {
      try {
        setLoading(true);

        const data = await getLatestPrediction(patient.id);

        console.log("FAMILY AI INSIGHT:", data);

        setPrediction(data);
      } catch (error) {
        console.error(
          "FAMILY: Failed to load AI insight:",
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
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-5/6 rounded bg-slate-200" />
          <div className="h-20 rounded-2xl bg-slate-100" />
        </div>
      </section>
    );
  }

  if (!prediction) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-2">
            <Brain className="h-5 w-5 text-violet-600" />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              AI Health Insight
            </h2>

            <p className="text-sm text-slate-500">
              AI analysis is not available yet.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const explanation =
    prediction.rag_explanation?.summary ||
    prediction.ai_summary ||
    "No detailed AI explanation is available at the moment.";

  const keyFactors =
    prediction.rag_explanation?.key_factors || [];

  const guidance =
    prediction.rag_explanation?.caregiver_guidance ||
    "Continue regular monitoring and follow the patient's care plan.";

  const risk = prediction.health_risk?.toLowerCase();

  const riskStyles =
    risk === "low"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : risk === "moderate"
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-red-50 text-red-700 border-red-100";

  return (
    <section className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-violet-100 p-3">
              <Brain className="h-6 w-6 text-violet-600" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  AI Health Insight
                </h2>

                <Sparkles className="h-4 w-4 text-violet-500" />
              </div>

              <p className="mt-1 text-sm text-slate-500">
                A simple explanation of the latest AI health assessment.
              </p>
            </div>
          </div>

          <div
            className={`w-fit rounded-full border px-4 py-2 text-sm font-semibold ${riskStyles}`}
          >
            {prediction.health_risk?.toUpperCase() || "UNKNOWN"} RISK
          </div>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="space-y-6 p-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            What the AI says
          </h3>

          <p className="mt-3 max-w-4xl text-base leading-7 text-slate-700">
            {explanation}
          </p>
        </div>

        {/* Key Factors */}
        {keyFactors.length > 0 && (
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-violet-600" />

              <h3 className="font-semibold text-slate-900">
                Key Factors
              </h3>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {keyFactors.slice(0, 4).map((factor, index) => (
                <div
                  key={`${factor}-${index}`}
                  className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600"
                >
                  {factor}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What to Watch */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />

            <h3 className="font-semibold text-blue-900">
              What to Watch
            </h3>
          </div>

          <p className="mt-2 text-sm leading-6 text-blue-800">
            {guidance}
          </p>
        </div>

        {/* Alert */}
        {prediction.alert_level &&
          prediction.alert_level.toLowerCase() !== "none" &&
          prediction.alert_level.toLowerCase() !== "low" && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
              <p className="text-sm font-semibold text-red-700">
                Attention Needed
              </p>

              <p className="mt-1 text-sm leading-6 text-red-600">
                {prediction.alert_message}
              </p>
            </div>
          )}
      </div>
    </section>
  );
}