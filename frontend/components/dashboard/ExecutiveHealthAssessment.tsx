"use client";

import {
  BrainCircuit,
  ArrowRight,
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  HeartHandshake,
} from "lucide-react";

interface RagSource {
  category?: string;
  source?: string;
  chunk_id?: string;
  distance?: number;
}

interface RagExplanation {
  status?: string;
  summary?: string;
  key_factors?: string[];
  caregiver_guidance?: string[];
  disclaimer?: string;
  sources?: RagSource[];
}

interface Prediction {
  health_risk: string;
  health_confidence: number;

  clinical_event?: string;
  clinical_confidence: number;

  alert_level: string;
  alert_message: string;

  recommendations: string[];

  overall_health_score: number;

  ai_summary?: string | null;

  rag_explanation?: RagExplanation | null;
}

interface ExecutiveHealthAssessmentProps {
  prediction: Prediction | null;
}

export default function ExecutiveHealthAssessment({
  prediction,
}: ExecutiveHealthAssessmentProps) {
  /* =====================================================
     NO PREDICTION STATE
     ===================================================== */

  if (!prediction) {
    return (
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 px-8 py-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
            <BrainCircuit
              className="text-blue-600"
              size={28}
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Executive Health Assessment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              AI-generated clinical overview
            </p>
          </div>
        </div>

        <div className="px-8 py-10 text-center">
          <p className="text-lg font-semibold text-slate-900">
            AI health assessment is not available yet.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Please generate an AI prediction for this patient.
          </p>
        </div>
      </section>
    );
  }

  /* =====================================================
     AI CONFIDENCE
     ===================================================== */

  const aiConfidence =
    (prediction.health_confidence +
      prediction.clinical_confidence) /
    2;

  /* =====================================================
     HEALTH STATUS
     ===================================================== */

  const healthRisk = prediction.health_risk || "Unknown";

  const riskIsHigh =
    healthRisk.toLowerCase() === "high" ||
    healthRisk.toLowerCase() === "critical";

  const riskIsMedium =
    healthRisk.toLowerCase() === "medium";

  /* =====================================================
     CONFIDENCE LABEL
     ===================================================== */

  const confidenceLabel =
    aiConfidence >= 80
      ? "High Confidence"
      : aiConfidence >= 60
      ? "Moderate Confidence"
      : "Low Confidence";

  /* =====================================================
     RAG EXPLANATION
     ===================================================== */

  const rag = prediction.rag_explanation;

  const hasRagContent =
    !!rag &&
    (!!rag.summary ||
      (rag.key_factors?.length ?? 0) > 0 ||
      (rag.caregiver_guidance?.length ?? 0) > 0 ||
      (rag.sources?.length ?? 0) > 0);

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
            <BrainCircuit
              className="text-blue-600"
              size={28}
            />
          </div>

          <div>

            <h2 className="text-2xl font-bold text-slate-900">
              Executive Health Assessment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              AI-generated clinical overview
            </p>

          </div>

        </div>

        <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
          AI Analysis Ready
        </div>

      </div>

      {/* =================================================
          EXECUTIVE SUMMARY
          ================================================= */}

      <div className="px-8 py-8">

        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Executive Summary
        </h3>

        <div className="rounded-2xl bg-slate-50 p-6">

          <p className="text-base leading-7 text-slate-600">
            {rag?.summary ||
              prediction.ai_summary ||
              "No AI explanation is available for this prediction."}
          </p>

        </div>

      </div>

      {/* =================================================
          KEY FINDINGS + RECOMMENDATIONS
          ================================================= */}

      <div className="grid gap-10 border-t border-slate-100 px-8 py-8 lg:grid-cols-2">

        {/* =================================================
            KEY FINDINGS
            ================================================= */}

        <div>

          <h3 className="mb-5 text-lg font-semibold text-slate-900">
            Key Findings
          </h3>

          <div className="space-y-4">

            {/* Health Risk */}

            <div className="flex items-start gap-3">

              <div className="mt-0.5 rounded-xl bg-blue-50 p-2">
                <Activity
                  size={18}
                  className="text-blue-600"
                />
              </div>

              <div>

                <p className="text-sm font-semibold text-slate-900">
                  Health Risk
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {healthRisk}
                </p>

              </div>

            </div>

            {/* Clinical Event */}

            <div className="flex items-start gap-3">

              <div className="mt-0.5 rounded-xl bg-purple-50 p-2">
                <ShieldAlert
                  size={18}
                  className="text-purple-600"
                />
              </div>

              <div>

                <p className="text-sm font-semibold text-slate-900">
                  Clinical Prediction
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {prediction.clinical_event}
                </p>

              </div>

            </div>

            {/* Alert */}

            <div className="flex items-start gap-3">

              <div className="mt-0.5 rounded-xl bg-amber-50 p-2">
                <AlertTriangle
                  size={18}
                  className="text-amber-600"
                />
              </div>

              <div>

                <p className="text-sm font-semibold text-slate-900">
                  Monitoring Alert
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {prediction.alert_message ||
                    "No active alerts."}
                </p>

              </div>

            </div>

            {/* Key Factors (RAG) */}

            {(rag?.key_factors?.length ?? 0) > 0 && (
              <div className="flex items-start gap-3">

                <div className="mt-0.5 rounded-xl bg-indigo-50 p-2">
                  <BookOpen
                    size={18}
                    className="text-indigo-600"
                  />
                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-900">
                    Key Factors
                  </p>

                  <ul className="mt-1 space-y-1">
                    {rag!.key_factors!.map((factor, index) => (
                      <li
                        key={index}
                        className="text-sm leading-6 text-slate-500"
                      >
                        • {factor}
                      </li>
                    ))}
                  </ul>

                </div>

              </div>
            )}

          </div>

        </div>

        {/* =================================================
            RECOMMENDED ACTIONS
            ================================================= */}

        <div>

          <h3 className="mb-5 text-lg font-semibold text-slate-900">
            Recommended Actions
          </h3>

          <div className="space-y-3">

            {prediction.recommendations?.length > 0 ? (
              prediction.recommendations.map(
                (recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >

                    <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5">

                      <CheckCircle2
                        size={16}
                        className="text-emerald-600"
                      />

                    </div>

                    <p className="text-sm leading-6 text-slate-600">
                      {recommendation}
                    </p>

                  </div>
                )
              )
            ) : (
              <p className="text-sm text-slate-500">
                No recommendations available.
              </p>
            )}

          </div>

        </div>

      </div>

      {/* =================================================
          MEDICAL AI CONTEXT (RAG)
          ================================================= */}

      {hasRagContent && (
        <div className="border-t border-slate-100 px-8 py-8">

          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">

            <div className="flex items-center gap-2">
              <BookOpen
                size={18}
                className="text-blue-700"
              />

              <p className="text-sm font-semibold text-blue-900">
                Medical AI Context
              </p>

              {rag?.status && (
                <span className="ml-auto rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                  {rag.status}
                </span>
              )}
            </div>

            {/* Caregiver Guidance */}

            {(rag?.caregiver_guidance?.length ?? 0) > 0 && (
              <div className="mt-5">

                <div className="flex items-center gap-2">
                  <HeartHandshake
                    size={16}
                    className="text-blue-700"
                  />

                  <p className="text-sm font-semibold text-blue-900">
                    Caregiver Guidance
                  </p>
                </div>

                <ul className="mt-2 space-y-1.5">
                  {rag!.caregiver_guidance!.map((tip, index) => (
                    <li
                      key={index}
                      className="text-sm leading-6 text-slate-600"
                    >
                      • {tip}
                    </li>
                  ))}
                </ul>

              </div>
            )}

            {/* Sources */}

            {(rag?.sources?.length ?? 0) > 0 && (
              <div className="mt-5">

                <p className="text-sm font-semibold text-blue-900">
                  Medical Sources
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {rag!.sources!.map((src, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm"
                      title={
                        src.distance !== undefined
                          ? `Relevance distance: ${src.distance}`
                          : undefined
                      }
                    >
                      {src.source ||
                        src.category ||
                        src.chunk_id ||
                        "Unnamed source"}
                    </span>
                  ))}
                </div>

              </div>
            )}

            {/* Disclaimer */}

            {rag?.disclaimer && (
              <p className="mt-5 text-xs leading-5 text-slate-500">
                {rag.disclaimer}
              </p>
            )}

          </div>

        </div>
      )}

      {/* =================================================
          FOOTER
          ================================================= */}

      <div className="flex flex-col gap-6 border-t border-slate-100 bg-slate-50 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">

        {/* Confidence */}

        <div>

          <div className="flex items-center justify-between gap-6">

            <div>

              <p className="text-sm text-slate-500">
                AI Confidence
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {aiConfidence.toFixed(2)}%
              </p>

            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              {confidenceLabel}
            </span>

          </div>

          <div className="mt-3 h-2 w-64 overflow-hidden rounded-full bg-slate-200">

            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-700"
              style={{
                width: `${Math.min(aiConfidence, 100)}%`,
              }}
            />

          </div>

        </div>

        {/* Health Score */}

        <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">

          <p className="text-xs font-medium text-slate-500">
            Overall Health Score
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {Number(
              prediction.overall_health_score
            ).toFixed(1)}
          </p>

        </div>

      </div>

    </section>
  );
}
