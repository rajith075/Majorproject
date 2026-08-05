"use client";

import {
  Check,
  User,
  HeartPulse,
  Pill,
  Phone,
  Hospital,
  Brain,
  ClipboardCheck,
} from "lucide-react";

interface Props {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  {
    title: "Basic",
    icon: User,
  },
  {
    title: "Medical",
    icon: HeartPulse,
  },
  {
    title: "Medication",
    icon: Pill,
  },
  {
    title: "Emergency",
    icon: Phone,
  },
  {
    title: "Care Team",
    icon: Hospital,
  },
  {
    title: "Lifestyle",
    icon: Brain,
  },
  {
    title: "Review",
    icon: ClipboardCheck,
  },
];

export default function StepIndicator({
  currentStep,
}: Props) {
  return (
    <div className="mb-12">

      <div className="flex items-center justify-between">

        {steps.map((step, index) => {
          const Icon = step.icon;

          const completed = index + 1 < currentStep;
          const active = index + 1 === currentStep;

          return (
            <div
              key={step.title}
              className="flex flex-1 items-center"
            >
              <div className="flex flex-col items-center">

                <div
                  className={`
                    flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300

                    ${
                      completed
                        ? "border-green-500 bg-green-500 text-white"
                        : active
                        ? "border-violet-600 bg-violet-600 text-white shadow-lg shadow-violet-300"
                        : "border-slate-300 bg-white text-slate-400"
                    }
                  `}
                >
                  {completed ? (
                    <Check size={22} />
                  ) : (
                    <Icon size={22} />
                  )}
                </div>

                <span
                  className={`
                    mt-3 text-sm font-semibold

                    ${
                      active
                        ? "text-violet-700"
                        : completed
                        ? "text-green-600"
                        : "text-slate-400"
                    }
                  `}
                >
                  {step.title}
                </span>

              </div>

              {index < steps.length - 1 && (
                <div className="mx-4 h-1 flex-1 rounded-full bg-slate-200 overflow-hidden">

                  <div
                    className={`
                      h-full rounded-full transition-all duration-500

                      ${
                        completed
                          ? "w-full bg-green-500"
                          : "w-0 bg-violet-500"
                      }
                    `}
                  />

                </div>
              )}

            </div>
          );
        })}

      </div>

      <div className="mt-8">

        <div className="h-2 overflow-hidden rounded-full bg-slate-200">

          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-500"
            style={{
              width: `${(currentStep / steps.length) * 100}%`,
            }}
          />

        </div>

        <div className="mt-2 flex justify-between">

          <p className="text-sm text-slate-500">
            Step {currentStep} of {steps.length}
          </p>

          <p className="text-sm font-semibold text-violet-700">
            {Math.round((currentStep / steps.length) * 100)}% Complete
          </p>

        </div>

      </div>

    </div>
  );
}