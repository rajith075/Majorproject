"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HeartPulse,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock3,
} from "lucide-react";

export default function FamilySuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/family-coming-soon");
    }, 3500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F8F5FF]">

      {/* Ambient background */}

      <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-violet-400/25 blur-[180px]" />

      <div className="absolute -right-40 top-10 h-[600px] w-[600px] rounded-full bg-fuchsia-400/20 blur-[180px]" />

      <div className="absolute bottom-[-300px] left-1/3 h-[650px] w-[650px] rounded-full bg-purple-400/20 blur-[200px]" />

      <div
        className="
          absolute inset-0
          opacity-[0.035]
          [background-image:radial-gradient(#7C3AED_1px,transparent_1px)]
          [background-size:30px_30px]
        "
      />

      <div className="relative z-10 min-h-screen">

        {/* Header */}

        <header className="flex items-center justify-between px-8 py-7 lg:px-14">

          <div className="flex items-center gap-3">

            <div
              className="
                flex h-11 w-11 items-center justify-center
                rounded-2xl
                bg-gradient-to-br
                from-violet-600
                to-fuchsia-500
                shadow-lg
                shadow-violet-500/25
              "
            >
              <HeartPulse
                className="h-6 w-6 text-white"
                strokeWidth={2.5}
              />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Elderly Care AI
              </h1>

              <p className="text-xs font-medium text-slate-500">
                Intelligent care. Better living.
              </p>
            </div>

          </div>

          <div
            className="
              hidden items-center gap-2
              rounded-full
              border border-violet-100
              bg-white/70
              px-4 py-2
              text-sm font-medium
              text-slate-600
              shadow-sm
              backdrop-blur-md
              sm:flex
            "
          >
            <ShieldCheck className="h-4 w-4 text-violet-600" />
            Secure Healthcare Platform
          </div>

        </header>

        {/* Success content */}

        <section className="flex min-h-[calc(100vh-100px)] items-center justify-center px-6 pb-20">

          <div className="w-full max-w-2xl text-center">

            {/* Success icon */}

            <div
              className="
                mx-auto mb-8
                flex h-24 w-24
                items-center justify-center
                rounded-[30px]
                bg-gradient-to-br
                from-violet-600
                to-fuchsia-500
                shadow-2xl
                shadow-violet-500/30
              "
            >
              <CheckCircle2
                className="h-12 w-12 text-white"
                strokeWidth={2}
              />
            </div>

            {/* Badge */}

            <div
              className="
                mb-6 inline-flex items-center gap-2
                rounded-full
                border border-emerald-200
                bg-emerald-50
                px-4 py-2
                text-xs font-bold
                text-emerald-700
              "
            >
              <Sparkles className="h-3.5 w-3.5" />
              Caregiver Assigned Successfully
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">

              Your loved one's care
              <span
                className="
                  ml-2
                  bg-gradient-to-r
                  from-violet-600
                  via-purple-600
                  to-fuchsia-500
                  bg-clip-text
                  text-transparent
                "
              >
                is connected.
              </span>

            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              The selected caregiver has been successfully assigned
              to your elderly care profile. Your care connection is now
              securely established.
            </p>

            {/* Status card */}

            <div
              className="
                mx-auto mt-10 max-w-lg
                rounded-[28px]
                border border-violet-100
                bg-white/80
                p-6
                shadow-xl
                shadow-violet-500/10
                backdrop-blur-xl
              "
            >

              <div className="flex items-center gap-4 text-left">

                <div
                  className="
                    flex h-12 w-12 shrink-0
                    items-center justify-center
                    rounded-2xl
                    bg-violet-50
                  "
                >
                  <ShieldCheck className="h-6 w-6 text-violet-600" />
                </div>

                <div className="flex-1">

                  <p className="text-sm font-bold text-slate-900">
                    Care connection secured
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your assigned caregiver can now access the
                    patient's care dashboard after signing in.
                  </p>

                </div>

                <CheckCircle2 className="h-5 w-5 text-emerald-500" />

              </div>

            </div>

            {/* Redirect */}

            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">

              <Clock3 className="h-4 w-4 text-violet-500" />

              Taking you to your Family Member experience...

            </div>

            <div className="mx-auto mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-violet-100">

              <div
                className="
                  h-full
                  w-full
                  origin-left
                  animate-[successProgress_3.5s_linear]
                  rounded-full
                  bg-gradient-to-r
                  from-violet-600
                  to-fuchsia-500
                "
              />

            </div>

            <button
              type="button"
              onClick={() => router.replace("/family-coming-soon")}
              className="
                group mt-8
                inline-flex items-center gap-2
                rounded-2xl
                border border-violet-200
                bg-white/70
                px-6 py-3
                text-sm font-semibold
                text-violet-700
                shadow-sm
                transition-all
                hover:-translate-y-0.5
                hover:bg-white
                hover:shadow-lg
              "
            >
              Continue

              <ArrowRight
                className="
                  h-4 w-4
                  transition-transform
                  group-hover:translate-x-1
                "
              />

            </button>

          </div>

        </section>

      </div>

      <style jsx>{`
        @keyframes successProgress {
          from {
            transform: scaleX(0);
          }

          to {
            transform: scaleX(1);
          }
        }
      `}</style>

    </main>
  );
}