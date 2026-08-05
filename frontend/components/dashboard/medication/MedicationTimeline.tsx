import { Clock3, Pill, UserRound } from "lucide-react";
import { todaySchedule } from "@/constants/mock/medication";

const statusStyles = {
  taken: {
    label: "Taken",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  upcoming: {
    label: "Upcoming",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700 border border-slate-200",
  },
};

export default function MedicationTimeline() {
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

      <div className="space-y-5">
        {todaySchedule.map((medicine) => {
          const status = statusStyles[medicine.status];

          return (
            <div
              key={medicine.id}
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
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
                    {medicine.time}
                  </p>
                </div>

                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
                  <Pill className="h-6 w-6 text-violet-700" />
                </div>

                {/* Medicine */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {medicine.medicine}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {medicine.dosage}
                  </p>
                </div>

              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-end">

                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${status.badge}`}
                >
                  <span className={`h-2 w-2 rounded-full ${status.dot}`} />

                  {status.label}
                </span>

                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">

                  <UserRound className="h-4 w-4" />

                  {medicine.givenBy
                    ? `Given by ${medicine.givenBy}`
                    : "Waiting for caregiver"}

                </div>

              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}