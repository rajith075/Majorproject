"use client";

import OptionCard from "./OptionCard";
import Chip from "./Chip";

interface Item {
  name: string;
  icon: React.ElementType;
}

interface Props {
  title: string;
  subtitle: string;
  items: Item[];
  selected: string[];
  onChange: (items: string[]) => void;
}

export default function MultiSelectGrid({
  title,
  subtitle,
  items,
  selected,
  onChange,
}: Props) {
  const toggleItem = (item: string) => {
    if (selected.includes(item)) {
      onChange(
        selected.filter((value) => value !== item)
      );
    } else {
      onChange([...selected, item]);
    }
  };

  return (
    <div className="space-y-8">

      <div>

        <h2 className="text-2xl font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-2 text-slate-500">
          {subtitle}
        </p>

      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-3">

          {selected.map((item) => (
            <Chip
              key={item}
              label={item}
            />
          ))}

        </div>
      )}

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">

        {items.map((item) => {
          const Icon = item.icon;

          return (
            <OptionCard
              key={item.name}
              title={item.name}
              icon={<Icon size={28} />}
              selected={selected.includes(item.name)}
              onClick={() => toggleItem(item.name)}
            />
          );
        })}

      </div>

    </div>
  );
}