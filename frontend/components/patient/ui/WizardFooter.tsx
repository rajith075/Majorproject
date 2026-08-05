interface Props {
  onNext?: () => void;
  onBack?: () => void;
  nextText?: string;
}

export default function WizardFooter({
  onBack,
  onNext,
  nextText = "Continue",
}: Props) {
  return (
    <div className="mt-12 flex justify-between">

      <button
        type="button"
        onClick={onBack}
        className="
          rounded-2xl
          border
          border-slate-300
          px-8
          py-4
          font-semibold
          text-slate-700
          hover:bg-slate-100
        "
      >
        Back
      </button>

      <button
        type="button"
        onClick={onNext}
        className="
          rounded-2xl
          bg-gradient-to-r
          from-violet-600
          to-purple-600
          px-10
          py-4
          font-semibold
          text-white
          shadow-lg
          hover:scale-105
        "
      >
        {nextText}
      </button>

    </div>
  );
}