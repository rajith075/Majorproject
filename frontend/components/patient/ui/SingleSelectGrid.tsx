"use client";

import OptionCard from "./OptionCard";

interface Item {
  title: string;
  icon: React.ElementType;
  description: string;
}

interface Props {
  title: string;
  subtitle: string;
  items: Item[];
  value: string;
  onChange: (value: string) => void;
}

export default function SingleSelectGrid({
  title,
  subtitle,
  items,
  value,
  onChange,
}: Props) {
  return (
    <div className="space-y-8">

      <div>

        <h2 className="text-3xl font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-2 text-slate-500">
          {subtitle}
        </p>

      </div>

      <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">

        {items.map((item) => {

          const Icon = item.icon;

          return (
            <OptionCard
              key={item.title}
              title={item.title}
              icon={<Icon size={30} />}
              selected={value === item.title}
              onClick={() => onChange(item.title)}
            />
          );

        })}

      </div>

    </div>
  );
}