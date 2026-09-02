"use client";

import { usePatientStore } from "@/store/patient-store";

export default function FamilyHeader() {
  const patient = usePatientStore((state) => state.patient);

  if (!patient) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-violet-100 bg-white p-7 shadow-sm">
      {/* Ambient glow */}
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-violet-400/15 blur-3xl" />

      <div className="relative z-10">
        <p className="text-sm font-medium text-violet-600">
          Family Member Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Good Morning 👋
        </h1>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Health information for
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {patient.full_name}
            </h2>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />

            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Health Monitoring Active
              </p>

              <p className="text-xs text-emerald-600">
                Patient profile connected
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
