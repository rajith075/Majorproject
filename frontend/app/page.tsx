"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthService } from "@/services/auth.service";
import { PatientService } from "@/services/patient.service";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = AuthService.getToken();

      if (!token) {
        router.replace("/register");
        return;
      }

      const patient = await PatientService.loadPatient();

      if (patient) {
        router.replace("/dashboard");
      } else {
        router.replace("/patient-registration");
      }
    } catch (error) {
      console.error(error);

      AuthService.removeToken();

      router.replace("/login");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#F8F5FF]">
      <div className="flex flex-col items-center gap-4">

        <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />

        <h2 className="text-lg font-semibold text-violet-700">
          Loading Elderly Care AI...
        </h2>

      </div>
    </div>
  );
}