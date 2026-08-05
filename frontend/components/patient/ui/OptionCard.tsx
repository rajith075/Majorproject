"use client";

import { CheckCircle2 } from "lucide-react";

interface Props {
  title: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

export default function OptionCard({
  title,
  icon,
  selected,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative
        rounded-3xl
        border-2
        p-6
        transition-all
        duration-300
        hover:scale-[1.03]
        hover:shadow-xl

        ${
          selected
            ? "border-violet-500 bg-gradient-to-br from-violet-50 to-fuchsia-50 shadow-xl"
            : "border-slate-200 bg-white"
        }
      `}
    >
      {selected && (
        <CheckCircle2
          className="
            absolute
            right-4
            top-4
            text-violet-600
          "
        />
      )}

      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
        {icon}
      </div>

      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>
    </button>
  );
}