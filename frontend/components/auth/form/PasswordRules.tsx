"use client";

import {
  CheckCircle2,
  Circle,
} from "lucide-react";

interface Props {
  password: string;
}

export default function PasswordRules({
  password,
}: Props) {

  const rules = [
    {
      label: "Minimum 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One number",
      valid: /[0-9]/.test(password),
    },
    {
      label: "One special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  return (
    <div className="mt-5 space-y-2">

      {rules.map((rule)=>(
        <div
          key={rule.label}
          className="flex items-center gap-2 text-sm"
        >

          {rule.valid ? (

            <CheckCircle2
              size={18}
              className="text-emerald-500"
            />

          ) : (

            <Circle
              size={18}
              className="text-slate-300"
            />

          )}

          <span
            className={
              rule.valid
                ? "text-emerald-600"
                : "text-slate-500"
            }
          >
            {rule.label}
          </span>

        </div>
      ))}

    </div>
  );
}