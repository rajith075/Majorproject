import { Pill, CheckCircle2, Clock3, AlertTriangle } from "lucide-react";
import { medicationSummary } from "@/constants/mock/medication";

export default function MedicationSummary() {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        icon={<Pill className="h-6 w-6 text-violet-600" />}
        title="Total Medicines"
        value={medicationSummary.total}
      />

      <SummaryCard
        icon={<CheckCircle2 className="h-6 w-6 text-green-600" />}
        title="Taken Today"
        value={medicationSummary.taken}
      />

      <SummaryCard
        icon={<Clock3 className="h-6 w-6 text-amber-600" />}
        title="Pending"
        value={medicationSummary.pending}
      />

      <SummaryCard
        icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
        title="Missed"
        value={medicationSummary.missed}
      />

      <SummaryCard
        icon={<Clock3 className="h-6 w-6 text-violet-600" />}
        title="Next Dose"
        value={medicationSummary.nextDose}
      />
    </section>
  );
}

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

function SummaryCard({ icon, title, value }: SummaryCardProps) {
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