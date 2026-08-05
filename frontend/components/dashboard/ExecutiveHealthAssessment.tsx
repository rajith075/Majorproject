"use client";

import { BrainCircuit, ArrowRight } from "lucide-react";

export default function ExecutiveHealthAssessment() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
            <BrainCircuit className="text-blue-600" size={28} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Executive Health Assessment
            </h2>

            
          </div>

        </div>

        <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          Ready
        </div>

      </div>

      {/* Executive Summary */}
      <div className="px-8 py-8">

        <h3 className="mb-5 text-lg font-semibold text-slate-900">
          Executive Summary
        </h3>

        <div className="space-y-3">

          <div className="h-4 w-full rounded-full bg-slate-100" />
          <div className="h-4 w-11/12 rounded-full bg-slate-100" />
          <div className="h-4 w-10/12 rounded-full bg-slate-100" />
          <div className="h-4 w-8/12 rounded-full bg-slate-100" />

        </div>

      </div>

      {/* Findings + Recommendations */}

      <div className="grid gap-10 border-t border-slate-100 px-8 py-8 lg:grid-cols-2">

        {/* Findings */}

        <div>

          <h3 className="mb-5 text-lg font-semibold text-slate-900">
            Key Findings
          </h3>

          <div className="space-y-4">

            <div className="h-4 w-5/6 rounded-full bg-slate-100" />
            <div className="h-4 w-4/5 rounded-full bg-slate-100" />
            <div className="h-4 w-3/4 rounded-full bg-slate-100" />
            <div className="h-4 w-2/3 rounded-full bg-slate-100" />

          </div>

        </div>

        {/* Recommendations */}

        <div>

          <h3 className="mb-5 text-lg font-semibold text-slate-900">
            Recommended Actions
          </h3>

          <div className="space-y-4">

            <div className="h-4 w-5/6 rounded-full bg-slate-100" />
            <div className="h-4 w-4/5 rounded-full bg-slate-100" />
            <div className="h-4 w-3/4 rounded-full bg-slate-100" />
            <div className="h-4 w-2/3 rounded-full bg-slate-100" />

          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-8 py-5">

        <div>

          <p className="text-sm text-slate-500">
            AI Confidence
          </p>

          <div className="mt-2 h-4 w-28 rounded-full bg-slate-100" />

        </div>

        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700">

          View AI Insights

          <ArrowRight size={18} />

        </button>

      </div>

    </section>
  );
}