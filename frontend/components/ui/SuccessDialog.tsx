"use client";

import { CheckCircle2 } from "lucide-react";

interface Props {
  open: boolean;
}

export default function SuccessDialog({ open }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md">

      <div className="w-full max-w-md rounded-[36px] bg-white p-10 text-center shadow-2xl">

        <CheckCircle2
          className="mx-auto text-green-500"
          size={80}
        />

        <h2 className="mt-6 text-3xl font-bold text-slate-900">
          Patient Registered
        </h2>

        <p className="mt-4 text-slate-500">
          Patient profile created successfully.
        </p>

        <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-200">

          <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-green-500 to-emerald-500"/>

        </div>

        <p className="mt-4 text-sm text-slate-400">
          Redirecting...
        </p>

      </div>

    </div>
  );
}