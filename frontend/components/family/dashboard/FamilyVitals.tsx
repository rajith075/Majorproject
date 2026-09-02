"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  HeartPulse,
  Thermometer,
  Wind,
} from "lucide-react";

import { getMyLatestVitals } from "@/services/api/vitals";

interface VitalData {
  heart_rate: number;
  spo2: number;
  respiratory_rate: number;
  temperature: number;
}

export default function FamilyVitals() {
  const [vitals, setVitals] = useState<VitalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVitals = async () => {
      try {
        setLoading(true);

        const data = await getMyLatestVitals();

        console.log("FAMILY VITALS:", data);

        setVitals(data);
      } catch (error) {
        console.error(
          "FAMILY: Failed to load vitals:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadVitals();
  }, []);

  if (loading) {
    return (
      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Current Health
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest recorded patient vitals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!vitals) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-2">
            <Activity className="h-5 w-5 text-violet-600" />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Current Health
            </h2>

            <p className="text-sm text-slate-500">
              No vital readings have been recorded yet.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const vitalCards = [
    {
      title: "Heart Rate",
      value: vitals.heart_rate,
      unit: "BPM",
      icon: HeartPulse,
      description: "Current heart rate",
    },
    {
      title: "SpO₂",
      value: vitals.spo2,
      unit: "%",
      icon: Activity,
      description: "Blood oxygen level",
    },
    {
      title: "Respiration",
      value: vitals.respiratory_rate,
      unit: "/min",
      icon: Wind,
      description: "Breathing rate",
    },
    {
      title: "Temperature",
      value: vitals.temperature,
      unit: "°C",
      icon: Thermometer,
      description: "Body temperature",
    },
  ];

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Current Health
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Latest recorded patient vitals.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {vitalCards.map((vital) => {
          const Icon = vital.icon;

          return (
            <div
              key={vital.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-violet-50 p-3">
                  <Icon className="h-5 w-5 text-violet-600" />
                </div>

                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Recorded
                </span>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-slate-500">
                  {vital.title}
                </p>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">
                    {vital.value}
                  </span>

                  <span className="text-sm font-medium text-slate-400">
                    {vital.unit}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {vital.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}