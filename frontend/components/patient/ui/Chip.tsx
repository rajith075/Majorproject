interface Props {
  label: string;
}

export default function Chip({
  label,
}: Props) {
  return (
    <span
      className="
        rounded-full
        bg-violet-100
        px-4
        py-2
        text-sm
        font-medium
        text-violet-700
      "
    >
      {label}
    </span>
  );
}