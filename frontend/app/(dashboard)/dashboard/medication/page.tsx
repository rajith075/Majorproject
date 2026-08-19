import MedicationSummary from "@/components/dashboard/medication/MedicationSummary";
import MedicationTimeline from "@/components/dashboard/medication/MedicationTimeline";

export default function MedicationPage() {
  return (
    <main className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold">
          Medication
        </h1>

        <p className="mt-2 text-muted-foreground">
          Monitor medication schedules, caregiver updates and adherence.
        </p>
      </div>

      <MedicationSummary />

      <MedicationTimeline />

    </main>
  );
}