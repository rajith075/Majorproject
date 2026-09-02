"use client";

import { useEffect, useState } from "react";
import {
  Pill,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from "lucide-react";

import { getCaregiverMedications } from "@/services/api/medication";

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

export default function MedicationSummary() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMedications = async () => {
      try {
        const data = await getCaregiverMedications();

        console.log("CAREGIVER MEDICATION SUMMARY:", data);

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

    loadMedications();
  }, []);

  const taken = medications.filter(
    (medication) => medication.status === "taken"
  ).length;

  const pending = medications.filter(
    (medication) => medication.status === "pending"
  ).length;

  const upcoming = medications.filter(
    (medication) => medication.status === "upcoming"
  ).length;

  /*
   * Current backend status model provides:
   * taken / pending / upcoming.
   *
   * We do not invent a separate "missed" state here.
   * Pending represents a dose that is due but not yet marked as given.
   */
  const missed = 0;

  const nextDoseMedication = medications.find(
    (medication) => medication.status === "upcoming"
  );

  const nextDose = nextDoseMedication?.reminder_time
    ? formatTime(nextDoseMedication.reminder_time)
    : upcoming > 0
    ? "Upcoming"
    : "—";

  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">

      <SummaryCard
        icon={<Pill className="h-6 w-6 text-violet-600" />}
        title="Total Medicines"
        value={loading ? "—" : medications.length}
      />

      <SummaryCard
        icon={<CheckCircle2 className="h-6 w-6 text-green-600" />}
        title="Taken Today"
        value={loading ? "—" : taken}
      />

      <SummaryCard
        icon={<Clock3 className="h-6 w-6 text-amber-600" />}
        title="Pending"
        value={loading ? "—" : pending}
      />

      <SummaryCard
        icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
        title="Missed"
        value={loading ? "—" : missed}
      />

      <SummaryCard
        icon={<Clock3 className="h-6 w-6 text-violet-600" />}
        title="Next Dose"
        value={loading ? "—" : nextDose}
      />

    </section>
  );
}

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

function SummaryCard({
  icon,
  title,
  value,
}: SummaryCardProps) {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">

      <div className="mb-5 flex items-center justify-between">
        {icon}
      </div>

      <h3 className="text-sm text-muted-foreground">
        {title}
      </h3>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

    </div>
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