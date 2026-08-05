"use client";

interface Props {
  label: string;
  value: string | number;
  placeholder?: string;
  type?: string;
  onChange: (value: string) => void;
}

export default function FormInput({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: Props) {
  return (
    <div className="space-y-2">

      <label className="text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
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
          placeholder:text-slate-400
          shadow-sm
          transition-all
          focus:border-violet-500
          focus:ring-4
          focus:ring-violet-100
        "
      />

    </div>
  );
}