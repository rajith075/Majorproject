"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

import { usePatientStore } from "@/store/patient-store";

export default function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());

  const patient = usePatientStore((state) => state.patient);
  console.log("PATIENT STORE:", patient);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hour = currentTime.getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
      ? "Good Afternoon"
      : "Good Evening";

  const formattedTime = currentTime.toLocaleString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <section className="space-y-6">
      {/* Greeting Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
        <span className="text-base">👋</span>
        {greeting}
      </div>

      {/* Patient Details */}
      <div>
        <h1 className="text-5xl font-bold tracking-tight text-slate-900">
          {patient?.full_name ?? "Unknown Patient"}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-6 text-base text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-lg">👴</span>

            <span>
              {patient?.gender ?? "Unknown"} •{" "}
              {patient?.age ? `${patient.age} Years` : "-- Years"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>🩸</span>
            <span>{patient?.blood_group ?? "--"}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{patient?.address ?? "Location not available"}</span>
          </div>

          <div className="flex items-center gap-2">
            <span>📞</span>
            <span>{patient?.phone ?? "--"}</span>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-3 text-sm">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />

        <span className="font-medium text-slate-500">
          Last Updated
        </span>

        <span className="font-semibold text-slate-900">
          {formattedTime}
        </span>
      </div>
    </section>
  );
}