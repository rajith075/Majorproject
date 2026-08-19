"use client";

import { useEffect, useState } from "react";

import { PatientService } from "@/services/patient.service";

export default function PatientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        console.log("🔵 Loading patient...");

        const patient = await PatientService.loadPatient();

        console.log("🟢 Patient loaded:", patient);
      } catch (error) {
        console.error("🔴 Failed to load patient:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading patient information...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}