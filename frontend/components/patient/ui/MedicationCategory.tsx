"use client";

import OptionCard from "./OptionCard";

interface Props {
  title: string;
  icon: React.ElementType;
  medicines: string[];
  selected: string[];
  onChange: (items: string[]) => void;
}

export default function MedicationCategory({
  title,
  icon: Icon,
  medicines,
  selected,
  onChange,
}: Props) {
  const toggle = (medicine: string) => {
    if (selected.includes(medicine)) {
      onChange(
        selected.filter((m) => m !== medicine)
      );
    } else {
      onChange([...selected, medicine]);
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-3">

        <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
          <Icon size={22} />
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          {title}
        </h2>

      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">

        {medicines.map((medicine) => (
          <OptionCard
            key={medicine}
            title={medicine}
            icon={<Icon size={26} />}
            selected={selected.includes(medicine)}
            onClick={() => toggle(medicine)}
          />
        ))}

      </div>

    </div>
  );
}