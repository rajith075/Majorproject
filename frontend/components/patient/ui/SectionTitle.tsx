interface Props {
  title: string;
  subtitle: string;
}

export default function SectionTitle({
  title,
  subtitle,
}: Props) {
  return (
    <div className="mb-10">

      <h2 className="text-4xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-3 text-lg text-slate-500">
        {subtitle}
      </p>

    </div>
  );
}