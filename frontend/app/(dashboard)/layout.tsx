"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { AuthService } from "@/services/auth.service";
import { PatientService } from "@/services/patient.service";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeDashboard = async () => {
      console.log("🔵 DASHBOARD INITIALIZATION STARTED");

      try {
        // ==================================================
        // 1. CHECK AUTHENTICATION
        // ==================================================

        const token = AuthService.getToken();

        console.log(
          "🔑 TOKEN EXISTS:",
          !!token
        );

        if (!token) {
          console.log(
            "❌ NO TOKEN → REDIRECTING TO LOGIN"
          );

          router.replace("/login");
          return;
        }

        // ==================================================
        // 2. LOAD PATIENT
        // ==================================================

        console.log(
          "🔵 LOADING PATIENT..."
        );

        const patient =
          await PatientService.loadPatient();

        console.log(
          "👤 DASHBOARD PATIENT:",
          patient
        );

        // ==================================================
        // 3. PATIENT NOT FOUND
        // ==================================================

        if (!patient) {
          console.log(
            "❌ PATIENT NOT FOUND"
          );

          router.replace(
            "/patient-registration"
          );

          return;
        }

        // ==================================================
        // 4. PATIENT SUCCESSFULLY LOADED
        // ==================================================

        console.log(
          "✅ PATIENT LOADED SUCCESSFULLY"
        );

        console.log(
          "🆔 PATIENT ID:",
          patient.id
        );

        console.log(
          "👤 PATIENT NAME:",
          patient.full_name
        );

        if (mounted) {
          setLoading(false);
        }

      } catch (error) {
        console.error(
          "❌ DASHBOARD INITIALIZATION FAILED:",
          error
        );

        AuthService.removeToken();

        router.replace("/login");
      }
    };

    initializeDashboard();

    return () => {
      mounted = false;
    };
  }, [router]);

  // ======================================================
  // LOADING SCREEN
  // ======================================================

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F5FF]">
        <div className="flex flex-col items-center gap-4">

          <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />

          <h2 className="text-lg font-semibold text-violet-700">
            Loading Elderly Care AI...
          </h2>

          <p className="text-sm text-slate-500">
            Loading patient information...
          </p>

        </div>
      </div>
    );
  }

  // ======================================================
  // DASHBOARD
  // ======================================================

  return (
    <div className="flex h-screen bg-slate-50">

      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden">

        <Topbar />

        <section className="flex-1 overflow-y-auto p-8">

          <div className="mx-auto w-full max-w-7xl">

            {children}

          </div>

        </section>

      </main>

    </div>
  );
}