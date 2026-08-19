"use client";

import { useEffect, useState } from "react";
import { Activity, ShieldAlert } from "lucide-react";

import OverviewCard from "./OverviewCard";
import ExecutiveHealthAssessment from "./ExecutiveHealthAssessment";

import { getLatestPrediction } from "@/services/api/ai";
import { usePatientStore } from "@/store/patient-store";

/* ==========================================================
   RAG Explanation
   ========================================================== */

interface RAGExplanation {
  status?: string;

  summary?: string;

  key_factors?: string[];

  caregiver_guidance?: string[];

  disclaimer?: string;

  sources?: {
    category?: string;
    source?: string;
    chunk_id?: string;
    distance?: number;
  }[];
}

/* ==========================================================
   AI Prediction
   ========================================================== */

interface AIPrediction {
  // =======================================================
  // Health Prediction
  // =======================================================

  overall_health_score: number;

  health_risk: string;

  health_confidence: number;

  // =======================================================
  // Clinical Prediction
  // =======================================================

  clinical_event?: string;

  clinical_confidence?: number;

  // =======================================================
  // Alert Information
  // =======================================================

  alert_level: string;

  alert_message: string;

  // =======================================================
  // AI Explanation
  // =======================================================

  ai_summary: string;

  // =======================================================
  // RAG Explanation
  // =======================================================

  rag_explanation?: RAGExplanation | null;

  // =======================================================
  // AI Recommendations
  // =======================================================

  recommendations?: string[];
}

/* ==========================================================
   Component
   ========================================================== */

export default function OverviewSection() {
  const patient = usePatientStore(
    (state) => state.patient
  );

  // =======================================================
  // DEBUG: Check patient loaded into Zustand
  // =======================================================

  console.log(
    "🔥 OVERVIEW PATIENT:",
    patient
  );

  console.log(
    "🔥 OVERVIEW PATIENT ID:",
    patient?.id
  );

  // =======================================================
  // Prediction State
  // =======================================================

  const [prediction, setPrediction] =
    useState<AIPrediction | null>(null);

  const [loading, setLoading] =
    useState(true);

  // =======================================================
  // Load Latest AI Prediction
  // =======================================================

  useEffect(() => {
    const loadPrediction = async () => {
      // ===================================================
      // Patient not loaded yet
      // ===================================================

      if (!patient?.id) {
        console.log(
          "⚠️ No patient ID available yet."
        );

        setLoading(false);

        return;
      }

      try {
        // =================================================
        // Debug: Prediction request
        // =================================================

        console.log(
          "🔥 CALLING AI FOR PATIENT:",
          patient.id
        );

        // =================================================
        // Get latest prediction from backend
        // =================================================

        const data =
          await getLatestPrediction(patient.id);

        console.log(
          "🔥 AI PREDICTION:",
          data
        );

        // =================================================
        // Debug: RAG response
        // =================================================

        console.log(
          "🔥 RAG EXPLANATION:",
          data?.rag_explanation
        );

        // =================================================
        // Store prediction
        // =================================================

        setPrediction(data);

      } catch (error) {
        console.error(
          "❌ Failed to load AI prediction:",
          error
        );

        setPrediction(null);

      } finally {
        setLoading(false);
      }
    };

    loadPrediction();

  }, [patient?.id]);

  // =======================================================
  // Loading State
  // =======================================================

  if (loading) {
    return (
      <div className="space-y-6">

        {/* KPI Skeletons */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          <div className="h-64 animate-pulse rounded-3xl bg-white/70" />

          <div className="h-64 animate-pulse rounded-3xl bg-white/70" />

        </div>

        {/* Executive Assessment Skeleton */}

        <div className="h-[500px] animate-pulse rounded-[28px] bg-white/70" />

      </div>
    );
  }

  // =======================================================
  // No Prediction
  // =======================================================

  if (!prediction) {
    return (
      <div className="space-y-6">

        {/* No-prediction message */}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <p className="text-lg font-semibold text-slate-700">
            AI health assessment is not available yet.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Please make sure the patient has an AI prediction.
          </p>

        </div>

        {/* Executive Assessment */}

        <ExecutiveHealthAssessment
          prediction={null}
        />

      </div>
    );
  }

  // =======================================================
  // Dashboard
  // =======================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          KPI CARDS
          ================================================= */}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* =================================================
            AI HEALTH SCORE
            ================================================= */}

        <OverviewCard
          title="AI Health Score"
          value={String(
            prediction.overall_health_score
          )}
          status={prediction.health_risk}
          trend={`${prediction.health_confidence}% confidence`}
          description={prediction.ai_summary}
          icon={Activity}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />

        {/* =================================================
            AI RISK ASSESSMENT
            ================================================= */}

        <OverviewCard
          title="AI Risk Assessment"
          value={prediction.health_risk}
          status={prediction.alert_level}
          trend={`${prediction.health_confidence}% confidence`}
          description={prediction.alert_message}
          icon={ShieldAlert}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />

      </section>

      {/* =================================================
          EXECUTIVE HEALTH ASSESSMENT

          RAG explanation is passed as an object.
          ExecutiveHealthAssessment is responsible
          for displaying:
          - summary
          - key factors
          - caregiver guidance
          - disclaimer
          - sources
          ================================================= */}

      <ExecutiveHealthAssessment
        prediction={prediction}
      />

    </div>
  );
}