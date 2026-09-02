"use client";

import {
  CalendarDays,
  Clock3,
  UserRound,
  HeartPulse,
  FileText,
  Pill,
  Stethoscope,
  ClipboardPenLine,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";

export default function DoctorDashboard() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ================= HEADER ================= */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
              <Stethoscope className="h-4 w-4" />
              Doctor Portal
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Good afternoon, Doctor 👋
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review your patient's information and manage today's consultation.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Stethoscope className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Dr. Ananya Rao
              </p>
              <p className="text-xs text-slate-500">
                General Physician
              </p>
            </div>
          </div>
        </section>

        {/* ================= APPOINTMENT ================= */}
        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Today's Consultation
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Lakshmi Devi
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Consultation requested by patient's family
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Date</p>
                  <p className="text-sm font-semibold text-slate-700">
                    Today
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Time</p>
                  <p className="text-sm font-semibold text-slate-700">
                    5:30 PM
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Start Consultation
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ================= PATIENT OVERVIEW ================= */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Patient Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Essential information about your patient.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">

            {/* Patient */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
                  <UserRound className="h-7 w-7 text-violet-600" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Lakshmi Devi
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    68 years • Female
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Blood Group
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    O+
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Medical Conditions
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Hypertension
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Allergies
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    No known allergies
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Caregiver
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Test Caregiver
                  </p>
                </div>

              </div>
            </div>

            {/* Emergency Contact */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
                <Phone className="h-5 w-5 text-rose-600" />
              </div>

              <h3 className="mt-5 text-base font-bold text-slate-900">
                Emergency Contact
              </h3>

              <p className="mt-2 text-sm font-semibold text-slate-700">
                Patient's Family
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Primary family contact
              </p>

              <button
                type="button"
                className="mt-5 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Contact Family
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ================= HEALTH REPORT ================= */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                <HeartPulse className="h-6 w-6 text-emerald-600" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Health Report
                </h2>

                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                  View the patient's recorded health information,
                  vital history and available health trends.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <FileText className="h-4 w-4" />
              View Health Report
            </button>
          </div>
        </section>

        {/* ================= MEDICATION ================= */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Prescribe Medication
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review current medicines or prescribe a new treatment.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                  <Pill className="h-6 w-6 text-amber-600" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Current Medications
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Amlodipine 5mg
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Current prescription
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Pill className="h-4 w-4" />
                Add / Prescribe Medication
              </button>

            </div>
          </div>
        </section>

        {/* ================= DOCTOR NOTES ================= */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50">
              <ClipboardPenLine className="h-6 w-6 text-indigo-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Doctor Notes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Record important observations and consultation notes.
              </p>
            </div>
          </div>

          <textarea
            placeholder="Enter consultation notes..."
            className="mt-6 min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Save Notes
            </button>
          </div>

        </section>

        {/* ================= FOOTER ================= */}
        <div className="flex items-center justify-center gap-2 pb-6 text-xs text-slate-400">
          <MapPin className="h-3.5 w-3.5" />
          ElderlyCare Doctor Portal
        </div>

      </div>
    </main>
  );
}