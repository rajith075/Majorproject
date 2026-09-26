"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Gauge,
  HeartPulse,
  Thermometer,
  Wind,
} from "lucide-react";

import VitalCard from "./VitalCard";
import { useAuthStore } from "@/store/auth.store";
import { usePatientStore } from "@/store/patient-store";
import {
  getCaregiverLatestVitals,
  getMyLatestVitals,
  VitalLog,
} from "@/services/api/vitals";
import type { HealthMetric, HealthStatus } from "@/types/health";

const LIVE_READING_WINDOW_MS = 15_000;

function bloodPressureStatus(
  systolic: number | null,
  diastolic: number | null
): HealthStatus {
  if ((systolic ?? 0) >= 180 || (diastolic ?? 0) >= 120) return "critical";
  if ((systolic ?? 0) >= 140 || (diastolic ?? 0) >= 90) return "warning";
  return "normal";
}

export default function HealthSection() {
  const user = useAuthStore((state) => state.user);
  const patient = usePatientStore((state) => state.patient);
  const [vitals, setVitals] = useState<VitalLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedAt, setCheckedAt] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    let requestInFlight = false;

    const loadVitals = async (isInitialLoad = false) => {
      if (requestInFlight) return;

      requestInFlight = true;

      try {
        if (isInitialLoad) setLoading(true);

        const data =
          user?.role === "caregiver" && patient?.id
            ? await getCaregiverLatestVitals(patient.id)
            : user?.role === "family"
            ? await getMyLatestVitals()
            : null;

        if (!cancelled) {
          setVitals(data);
          setCheckedAt(Date.now());
        }
      } catch (error) {
        console.error("Failed to load linked patient vitals:", error);
        // Keep the most recent successful reading visible during a temporary
        // network failure; only the initial request should show an empty state.
        if (!cancelled && isInitialLoad) setVitals(null);
      } finally {
        requestInFlight = false;
        if (!cancelled && isInitialLoad) setLoading(false);
      }
    };

    void loadVitals(true);
    const interval = window.setInterval(() => void loadVitals(), 5_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [patient?.id, user?.role]);

  const metrics = useMemo<HealthMetric[]>(() => {
    if (!vitals) return [];

    const pressureStatus = bloodPressureStatus(
      vitals.systolic_bp,
      vitals.diastolic_bp
    );
    const updatedAt = new Date(vitals.created_at).toLocaleString("en-IN");

    return [
      {
        id: "heart-rate", title: "Heart Rate", description: "Latest recorded heart rate", icon: HeartPulse,
        value: vitals.heart_rate ?? "—", unit: "BPM", status: "normal", trend: 0, trendDirection: "stable", lastUpdated: updatedAt, color: "rose", chartType: "line", history: [],
      },
      {
        id: "spo2", title: "SpO₂", description: "Latest oxygen saturation", icon: Activity,
        value: vitals.spo2 ?? "—", unit: "%", status: "normal", trend: 0, trendDirection: "stable", lastUpdated: updatedAt, color: "cyan", chartType: "progress", history: [],
      },
      {
        id: "temperature", title: "Temperature", description: "Latest body temperature", icon: Thermometer,
        value: vitals.temperature ?? "—", unit: "°C", status: "normal", trend: 0, trendDirection: "stable", lastUpdated: updatedAt, color: "amber", chartType: "bars", history: [],
      },
      {
        id: "systolic-pressure", title: "Systolic Pressure", description: "Upper blood pressure reading", icon: Gauge,
        value: vitals.systolic_bp ?? "—", unit: "mmHg", status: pressureStatus, trend: 0, trendDirection: "stable", lastUpdated: updatedAt, color: "violet", chartType: "bars", history: [],
      },
      {
        id: "diastolic-pressure", title: "Diastolic Pressure", description: "Lower blood pressure reading", icon: Gauge,
        value: vitals.diastolic_bp ?? "—", unit: "mmHg", status: pressureStatus, trend: 0, trendDirection: "stable", lastUpdated: updatedAt, color: "sky", chartType: "bars", history: [],
      },
      {
        id: "respiration", title: "Respiration", description: "Latest breathing rate", icon: Wind,
        value: vitals.respiratory_rate ?? "—", unit: "/min", status: "normal", trend: 0, trendDirection: "stable", lastUpdated: updatedAt, color: "emerald", chartType: "line", history: [],
      },
    ];
  }, [vitals]);

  const isLive = Boolean(
    vitals && new Date(vitals.created_at).getTime() > checkedAt - LIVE_READING_WINDOW_MS
  );

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Patient Vitals
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {isLive
            ? "Live Arduino readings for your linked patient."
            : "Last recorded vitals. Waiting for the next Arduino reading."}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="h-64 animate-pulse rounded-3xl bg-slate-200" />
          ))}
        </div>
      ) : !metrics.length ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No vital readings have been recorded for this linked patient yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => <VitalCard key={metric.id} metric={metric} />)}
        </div>
      )}
    </section>
  );
}
