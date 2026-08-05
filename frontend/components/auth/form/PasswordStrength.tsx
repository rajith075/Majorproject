"use client";

interface Props {
  password: string;
}

export default function PasswordStrength({
  password,
}: Props) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const colors = [
    "bg-slate-200",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-emerald-500",
  ];

  const labels = [
    "",
    "Weak",
    "Fair",
    "Good",
    "Strong",
  ];

  return (
    <div className="mt-3">

      <div className="flex gap-2">

        {[1,2,3,4].map((i)=>(
          <div
            key={i}
            className={`
              h-2
              flex-1
              rounded-full
              ${
                i<=score
                  ? colors[score]
                  : "bg-slate-200"
              }
            `}
          />
        ))}

      </div>

      {password.length>0 && (

        <p
          className="
            mt-2
            text-sm
            font-semibold
            text-slate-600
          "
        >
          Password Strength :
          {" "}
          <span className="text-violet-600">
            {labels[score]}
          </span>
        </p>

      )}

    </div>
  );
}