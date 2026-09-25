"use client";

import { useEffect, useState } from "react";
import {
  Clock3,
  Pill,
  UserRound,
  CheckCircle2,
} from "lucide-react";

import {
  getCaregiverMedications,
  markMedicationAsGiven,
} from "@/services/api/medication";

interface Medication {
  id: number;
  patient_id: number;
  medicine_name: string;
  dosage?: string | null;
  reminder_time?: string | null;
  before_food: boolean;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
  active: boolean;
  status: "taken" | "pending" | "upcoming";
  given_by?: string | null;
  given_at?: string | null;
}

const statusStyles = {
  taken: {
    label: "Taken",
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-700 border border-amber-200",
  },
  upcoming: {
    label: "Upcoming",
    dot: "bg-slate-400",
    badge:
      "bg-slate-100 text-slate-700 border border-slate-200",
  },
};

export default function MedicationTimeline() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [givingMedicationId, setGivingMedicationId] =
    useState<number | null>(null);

  const loadMedications = async () => {
    try {
      const data = await getCaregiverMedications();

      console.log("CAREGIVER MEDICATION TIMELINE:", data);

      setMedications(data || []);
    } catch (error) {
      console.error(
        "FAILED TO LOAD CAREGIVER MEDICATIONS:",
        error
      );
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedications();
  }, []);

  const handleMarkAsGiven = async (medicationId: number) => {
    try {
      setGivingMedicationId(medicationId);

      await markMedicationAsGiven(medicationId);

      // Reload real backend data so status,
      // given_by and given_at are immediately updated.
      await loadMedications();
    } catch (error) {
      console.error(
        "FAILED TO MARK MEDICATION AS GIVEN:",
        error
      );
    } finally {
      setGivingMedicationId(null);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm">

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Today's Medication Schedule
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Live updates from the caregiver dashboard.
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="rounded-2xl bg-slate-50 p-6">
          <p className="text-sm text-slate-500">
            Loading medication schedule...
          </p>
        </div>
      ) : medications.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl bg-slate-50 p-6">
          <p className="text-sm font-medium text-slate-600">
            No active medications found.
          </p>
        </div>
      ) : (
        <div className="space-y-5">

          {medications.map((medicine) => {
            const status = statusStyles[medicine.status];

            return (
              <div
                key={medicine.id}
                className="group flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg lg:flex-row lg:items-center lg:justify-between"
              >

                {/* LEFT */}
                <div className="flex items-center gap-6">

                  {/* Time */}
                  <div className="min-w-[90px]">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Time
                    </p>

                    <p className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
                      <Clock3 className="h-4 w-4 text-violet-600" />

                      {medicine.reminder_time
                        ? formatTime(medicine.reminder_time)
                        : "Anytime"}
                    </p>
                  </div>

                  {/* Icon */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-100">
                    <Pill className="h-6 w-6 text-violet-700" />
                  </div>

                  {/* Medicine */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {medicine.medicine_name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {medicine.dosage || "Dosage not specified"}
                    </p>

                    {medicine.before_food && (
                      <p className="mt-1 text-xs font-medium text-violet-600">
                        Take before food
                      </p>
                    )}
                  </div>

                </div>

                {/* RIGHT */}
                <div className="flex flex-col items-start lg:items-end">

                  {/* Status */}
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${status.badge}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${status.dot}`}
                    />

                    {status.label}
                  </span>

                  {/* Given Information */}
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">

                    <UserRound className="h-4 w-4" />

                    {medicine.given_by
                      ? `Given by ${medicine.given_by}`
                      : "Waiting for caregiver"}

                  </div>

                  {/* Given Time */}
                  {medicine.given_at && (
                    <p className="mt-1 text-xs text-slate-400">
                      Given at{" "}
                      {new Date(
                        medicine.given_at
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}

                  {/* Mark as Given */}
                  {medicine.status !== "taken" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleMarkAsGiven(medicine.id)
                      }
                      disabled={
                        givingMedicationId === medicine.id
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />

                      {givingMedicationId === medicine.id
                        ? "Updating..."
                        : "Mark as Given"}
                    </button>
                  )}

                </div>

              </div>
            );
          })}

        </div>
      )}

    </section>
  );
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");

  if (!hours || !minutes) {
    return time;
  }

  const hour = Number(hours);

  if (Number.isNaN(hour)) {
    return time;
  }

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${period}`;
}
