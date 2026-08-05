"use client";

import { useEffect, useState } from "react";
import { Loader2, HeartPulse } from "lucide-react";

interface Props {
  open: boolean;
}

const messages = [
  "Saving patient information...",
  "Processing medical history...",
  "Assigning healthcare team...",
  "Generating AI health profile...",
  "Finalizing patient registration...",
];

export default function LoadingOverlay({ open }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setIndex((prev) =>
        prev < messages.length - 1 ? prev + 1 : prev
      );
    }, 600);

    return () => clearInterval(interval);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-md">

      <div className="w-full max-w-lg rounded-[36px] border border-violet-200 bg-white p-10 shadow-2xl">

        <div className="flex flex-col items-center">

          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-xl">
            <HeartPulse size={44} />
          </div>

          <Loader2
            size={38}
            className="animate-spin text-violet-600"
          />

          <h2 className="mt-8 text-3xl font-bold text-slate-900">
            AI Processing
          </h2>

          <p className="mt-4 text-center text-slate-500">
            {messages[index]}
          </p>

          <div className="mt-10 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-500"
              style={{
                width: `${((index + 1) / messages.length) * 100}%`,
              }}
            />
          </div>

        </div>

      </div>

    </div>
  );
}