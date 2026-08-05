"use client";

interface Props {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export default function FormSelect({
  label,
  value,
  options,
  onChange,
}: Props) {
  return (
    <div className="space-y-2">

      <label className="text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          rounded-2xl
          border
          border-slate-200
          bg-white
          px-5
          py-4
          text-slate-900
          shadow-sm
          transition-all
          focus:border-violet-500
          focus:ring-4
          focus:ring-violet-100
        "
      >
        <option value="">Select</option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}