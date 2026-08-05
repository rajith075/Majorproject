import { LucideIcon } from "lucide-react";

interface OverviewCardProps {
  title: string;
  value: string;
  status: string;
  description: string;
  trend: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export default function OverviewCard({
  title,
  value,
  status,
  description,
  trend,
  icon: Icon,
  iconBg,
  iconColor,
}: OverviewCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}
        >
          <Icon className={iconColor} size={22} />
        </div>

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          {trend}
        </span>

      </div>

      {/* Content */}

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <h2 className="mt-1 text-4xl font-bold tracking-tight text-slate-900">
        {value}
      </h2>

      <p className="mt-1 text-base font-semibold text-slate-700">
        {status}
      </p>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}