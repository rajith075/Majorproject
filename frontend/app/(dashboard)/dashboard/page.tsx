"use client";

import { useEffect } from "react";

import DashboardHeader from "@/components/dashboard/dashboard-header";
import OverviewSection from "@/components/dashboard/OverviewSection";
import HealthScoreTrend from "@/components/dashboard/HealthScoreTrend";

import { PatientService } from "@/services/patient.service";

export default function DashboardPage() {
  useEffect(() => {
    const loadPatient = async () => {
      console.log("DASHBOARD: Loading patient...");

      const patient = await PatientService.loadPatient();

      console.log(
        "DASHBOARD: Patient result:",
        patient
      );
    };

    loadPatient();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8F5FF]">

      {/* Large Ambient Glow - Top Left */}
      <div className="absolute -top-56 -left-48 h-[650px] w-[650px] rounded-full bg-violet-400/25 blur-[180px]" />

      {/* Top Right Glow */}
      <div className="absolute -top-20 right-[-180px] h-[550px] w-[550px] rounded-full bg-fuchsia-400/20 blur-[180px]" />

      {/* Bottom Glow */}
      <div className="absolute bottom-[-300px] left-1/4 h-[700px] w-[700px] rounded-full bg-purple-300/25 blur-[220px]" />

      {/* Large Diagonal Gradient Shape */}
      <div
        className="
          absolute
          -top-24
          right-[-220px]
          h-[720px]
          w-[900px]
          rotate-[-18deg]
          rounded-[120px]
          bg-gradient-to-br
          from-violet-600/20
          via-fuchsia-400/15
          to-transparent
        "
      />

      {/* Secondary Shape */}
      <div
        className="
          absolute
          bottom-[-180px]
          left-[-180px]
          h-[550px]
          w-[700px]
          rotate-[18deg]
          rounded-[120px]
          bg-gradient-to-tr
          from-purple-300/20
          via-violet-200/15
          to-transparent
        "
      />

      {/* Soft Mesh Pattern */}
      <div
        className="
          absolute
          inset-0
          opacity-[0.035]
          [background-image:radial-gradient(#7C3AED_1px,transparent_1px)]
          [background-size:30px_30px]
        "
      />

      {/* Content */}
      <main className="relative z-10 mx-auto max-w-[1600px] space-y-8 px-8 py-8">

        {/* Patient Header */}
        <DashboardHeader />

        {/* AI Health Score + AI Risk Assessment
            + Executive Health Assessment */}
        <OverviewSection />

        {/* Health Trend */}
        <HealthScoreTrend />

      </main>

    </div>
  );
}
