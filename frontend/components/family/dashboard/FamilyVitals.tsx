"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Gauge,
  HeartPulse,
  Thermometer,
  Wind,
} from "lucide-react";

import DeviceConnectionControl from "./DeviceConnectionControl";
import {
  getMyLatestVitals,
  VitalLog,
} from "@/services/api/vitals";

const LIVE_READING_WINDOW_MS = 15_000;

export default function FamilyVitals() {
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
        const latestVitals = await getMyLatestVitals();

        if (!cancelled) {
          setVitals(latestVitals);
          setCheckedAt(Date.now());
        }
      } catch (error) {
        console.error("FAMILY: Failed to load vitals:", error);
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
  }, []);

  if (loading) {
    return (
      <section className="space-y-5">
        <DeviceConnectionControl />
        <div>
          <h2 className="text-xl font-bold text-slate-900">Current Health</h2>
          <p className="mt-1 text-sm text-slate-500">Latest recorded patient vitals.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </section>
    );
  }

  if (!vitals) {
    return (
      <section className="space-y-5">
        <DeviceConnectionControl />
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-2">
              <Activity className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Current Health</h2>
              <p className="text-sm text-slate-500">No vital readings have been recorded yet.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const vitalCards = [
    { title: "Heart Rate", value: vitals.heart_rate ?? "—", unit: "BPM", icon: HeartPulse, description: "Current heart rate" },
    { title: "SpO₂", value: vitals.spo2 ?? "—", unit: "%", icon: Activity, description: "Blood oxygen level" },
    { title: "Temperature", value: vitals.temperature ?? "—", unit: "°C", icon: Thermometer, description: "Body temperature" },
    { title: "Systolic Pressure", value: vitals.systolic_bp ?? "—", unit: "mmHg", icon: Gauge, description: "Upper blood pressure reading" },
    { title: "Diastolic Pressure", value: vitals.diastolic_bp ?? "—", unit: "mmHg", icon: Gauge, description: "Lower blood pressure reading" },
    { title: "Respiration", value: vitals.respiratory_rate ?? "—", unit: "/min", icon: Wind, description: "Breathing rate" },
  ];
  const isLive =
    new Date(vitals.created_at).getTime() > checkedAt - LIVE_READING_WINDOW_MS;
  const recordedAt = new Date(vitals.created_at).toLocaleString("en-IN");

  return (
    <section className="space-y-5">
      <DeviceConnectionControl />
      <div>
        <h2 className="text-xl font-bold text-slate-900">Current Health</h2>
        <p className="mt-1 text-sm text-slate-500">
          {isLive
            ? `Live Arduino readings · updated ${recordedAt}`
            : `Last recorded ${recordedAt} · waiting for a new Arduino reading.`}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {vitalCards.map((vital) => {
          const Icon = vital.icon;
          return (
            <div key={vital.title} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-violet-50 p-3"><Icon className="h-5 w-5 text-violet-600" /></div>
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isLive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}><span className={`h-1.5 w-1.5 rounded-full ${isLive ? "animate-pulse bg-emerald-500" : "bg-slate-400"}`} />{isLive ? "Live" : "Last recorded"}</span>
              </div>
              <div className="mt-5">
                <p className="text-sm font-medium text-slate-500">{vital.title}</p>
                <div className="mt-1 flex items-baseline gap-2"><span className="text-3xl font-bold tracking-tight text-slate-900">{vital.value}</span><span className="text-sm font-medium text-slate-400">{vital.unit}</span></div>
                <p className="mt-2 text-xs text-slate-400">{vital.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
