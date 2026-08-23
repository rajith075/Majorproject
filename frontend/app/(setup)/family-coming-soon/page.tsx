"use client";

import { useRouter } from "next/navigation";
import {
  HeartPulse,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Clock3,
} from "lucide-react";

export default function FamilyComingSoonPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F8F5FF]">

      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-violet-400/25 blur-[180px]" />

      <div className="absolute -right-40 top-10 h-[600px] w-[600px] rounded-full bg-fuchsia-400/20 blur-[180px]" />

      <div className="absolute bottom-[-300px] left-1/3 h-[650px] w-[650px] rounded-full bg-purple-400/20 blur-[200px]" />

      <div
        className="
          absolute
          inset-0
          opacity-[0.035]
          [background-image:radial-gradient(#7C3AED_1px,transparent_1px)]
          [background-size:30px_30px]
        "
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 flex min-h-screen flex-col">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="flex items-center justify-between px-8 py-7 lg:px-14">

          <div className="flex items-center gap-3">

            <div
              className="
                flex h-11 w-11
                items-center justify-center
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

        {/* =================================================
            MAIN
        ================================================= */}

        <section className="flex flex-1 items-center justify-center px-6 pb-20">

          <div className="w-full max-w-2xl">

            <div
              className="
                rounded-[36px]
                border border-violet-100
                bg-white/80
                px-8 py-14
                text-center
                shadow-[0_30px_100px_-35px_rgba(124,58,237,0.35)]
                backdrop-blur-xl
                sm:px-14
              "
            >

              {/* Icon */}

              <div
                className="
                  mx-auto flex h-20 w-20
                  items-center justify-center
                  rounded-[26px]
                  bg-gradient-to-br
                  from-violet-100
                  to-fuchsia-100
                  shadow-inner
                "
              >
                <Clock3
                  className="h-9 w-9 text-violet-600"
                  strokeWidth={2}
                />
              </div>

              {/* Badge */}

              <div
                className="
                  mx-auto mt-7
                  inline-flex items-center gap-2
                  rounded-full
                  border border-violet-200/70
                  bg-violet-50
                  px-4 py-2
                  text-xs font-semibold
                  text-violet-700
                "
              >
                <Sparkles className="h-3.5 w-3.5" />
                Family Member Experience
              </div>

              {/* Heading */}

              <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Coming
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
                  Soon
                </span>
              </h2>

              {/* Description */}

              <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                The Family Member dashboard is being carefully designed
                to give families a complete and effortless way to stay
                connected with their loved one's care.
              </p>

              {/* Feature Preview */}

              <div className="mx-auto mt-8 max-w-md rounded-2xl border border-violet-100 bg-violet-50/60 p-5 text-left">

                <div className="flex items-start gap-3">

                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <HeartPulse className="h-4 w-4 text-violet-600" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      A better family care experience
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Patient health, medications, alerts, caregiver
                      updates and more — all in one place.
                    </p>
                  </div>

                </div>

              </div>

              {/* Back Button */}

              <button
                type="button"
                onClick={() => router.replace("/role-selection")}
                className="
                  group
                  mt-9
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-violet-200
                  bg-white
                  px-6 py-3.5
                  text-sm
                  font-semibold
                  text-violet-700
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-violet-300
                  hover:bg-violet-50
                  hover:shadow-lg
                "
              >
                <ArrowLeft
                  className="
                    h-4 w-4
                    transition-transform
                    duration-300
                    group-hover:-translate-x-1
                  "
                />

                Back to Role Selection
              </button>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}