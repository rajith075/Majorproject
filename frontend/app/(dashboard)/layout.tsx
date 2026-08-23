"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { AuthService } from "@/services/auth.service";
import { PatientService } from "@/services/patient.service";
import { useAuthStore } from "@/store/auth.store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    let mounted = true;

    const initializeDashboard = async () => {
      console.log("🔵 DASHBOARD INITIALIZATION STARTED");

      try {
        // ==================================================
        // 1. CHECK AUTHENTICATION
        // ==================================================

        const token = AuthService.getToken();

        console.log("🔑 TOKEN EXISTS:", !!token);

        if (!token) {
          console.log("❌ NO TOKEN → REDIRECTING TO LOGIN");

          router.replace("/login");
          return;
        }

        // ==================================================
        // 2. LOAD CURRENT USER
        // ==================================================

        console.log("🔵 LOADING CURRENT USER...");

        const user = await AuthService.loadCurrentUser();

        console.log("👤 CURRENT USER:", user);

        if (!user) {
          console.log("❌ USER NOT FOUND");

          AuthService.removeToken();

          router.replace("/login");
          return;
        }

        // Save user in Zustand
        setUser(user);

        console.log("✅ USER LOADED");
        console.log("🆔 USER ID:", user.id);
        console.log("👤 USER NAME:", user.full_name);
        console.log("🎭 USER ROLE:", user.role);

        // ==================================================
        // 3. FAMILY USER
        // ==================================================

        if (user.role === "family") {
          console.log("👨‍👩‍👧 FAMILY USER DETECTED");

          console.log("🔵 LOADING FAMILY PATIENT...");

          const patient = await PatientService.loadPatient();

          console.log("👴 FAMILY PATIENT:", patient);

          // ------------------------------------------------
          // Patient not created yet
          // ------------------------------------------------

          if (!patient) {
            console.log("❌ PATIENT NOT FOUND");

            router.replace("/patient-registration");
            return;
          }

          console.log("✅ FAMILY PATIENT LOADED");
          console.log("🆔 PATIENT ID:", patient.id);
          console.log("👤 PATIENT NAME:", patient.full_name);
        }

        // ==================================================
        // 4. CAREGIVER USER
        // ==================================================

        else if (user.role === "caregiver") {
          console.log("🩺 CAREGIVER USER DETECTED");

          console.log("🔵 LOADING ASSIGNED PATIENT...");

          const patient =
            await PatientService.loadCaregiverPatient();

          console.log(
            "👴 CAREGIVER PATIENT:",
            patient
          );

          // ------------------------------------------------
          // No patient assigned
          // ------------------------------------------------

          if (!patient) {
            console.log(
              "⚠️ NO PATIENT ASSIGNED TO CAREGIVER"
            );

            if (mounted) {
              setLoading(false);
            }

            return;
          }

          // ------------------------------------------------
          // Patient successfully loaded
          // ------------------------------------------------

          console.log(
            "✅ CAREGIVER PATIENT LOADED"
          );

          console.log(
            "🆔 PATIENT ID:",
            patient.id
          );

          console.log(
            "👤 PATIENT NAME:",
            patient.full_name
          );
        }

        // ==================================================
        // 5. OTHER ROLES
        // ==================================================

        else {
          console.log(
            "⚠️ UNKNOWN USER ROLE:",
            user.role
          );
        }

        // ==================================================
        // 6. FINISH INITIALIZATION
        // ==================================================

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
  }, [router, setUser]);

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