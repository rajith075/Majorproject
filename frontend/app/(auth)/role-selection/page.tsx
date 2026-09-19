"use client";

import { useRouter } from "next/navigation";
import {
  Users,
  HeartPulse,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
  Check,
} from "lucide-react";

export default function RoleSelectionPage() {
  const router = useRouter();

  const roles = [
    {
      title: "Family Member",
      description:
        "Coordinate your loved one's care in one place — health records, medications, and emergency information.",
      icon: Users,
      points: ["Complete care profile", "Medication tracking", "Emergency contacts"],

      action: () => {
        router.push("/register");
      },

      badge: "Available now",
      active: true,
    },

    {
      title: "Caregiver",
      description:
        "View your assigned patients on one dashboard and stay on top of visits, tasks, and alerts.",
      icon: HeartPulse,
      points: ["Real-time patient dashboard", "Visit and task logs", "Instant alerts"],

      action: () => {
        router.push("/caregiver-login");
      },

      badge: "Available now",
      active: true,
    },

    {
      title: "Doctor",
      description:
        "Review patient records, clinical insights, and AI-assisted monitoring to inform every decision.",
      icon: Stethoscope,
      points: ["Clinical insights", "AI-assisted monitoring", "Chart review"],

      action: () => {
        router.push("/doctor-register");
      },

      badge: "Available now",
      active: true,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F8F5FF]">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] animate-[float_16s_ease-in-out_infinite] rounded-full bg-violet-400/25 blur-[180px]" />
        <div className="absolute -right-40 top-10 h-[600px] w-[600px] animate-[float_20s_ease-in-out_infinite_reverse] rounded-full bg-fuchsia-400/20 blur-[180px]" />
        <div className="absolute bottom-[-300px] left-1/3 h-[650px] w-[650px] animate-[float_24s_ease-in-out_infinite] rounded-full bg-purple-400/20 blur-[200px]" />
      </div>

      <div
        className="
          pointer-events-none absolute inset-0
          opacity-[0.035]
          [background-image:radial-gradient(#7C3AED_1px,transparent_1px)]
          [background-size:30px_30px]
        "
      />

      {/* subtle top sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent" />

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
                relative flex h-11 w-11 items-center justify-center
                rounded-2xl
                bg-gradient-to-br
                from-violet-600
                to-fuchsia-500
                shadow-lg
                shadow-violet-500/25
                ring-1 ring-white/40
              "
            >
              <HeartPulse className="h-6 w-6 text-white" strokeWidth={2.5} />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Elder Care AI
              </h1>
              <p className="text-xs font-medium tracking-wide text-slate-500">
                Thoughtful care, backed by intelligence.
              </p>
            </div>
          </div>

          <div
            className="
              hidden items-center gap-2 rounded-full
              border border-violet-100
              bg-white/70 px-4 py-2
              text-sm font-medium text-slate-600
              shadow-sm backdrop-blur-md
              sm:flex
            "
          >
            <ShieldCheck className="h-4 w-4 text-violet-600" />
            A secure healthcare platform
          </div>
        </header>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="flex flex-1 items-center justify-center px-6 pb-16 pt-8">
          <div className="w-full max-w-6xl">
            {/* Heading */}

            <div className="mx-auto mb-14 max-w-2xl text-center">
              <div
                className="
                  mb-5 inline-flex items-center gap-2
                  rounded-full
                  border border-violet-200/70
                  bg-white/70 px-4 py-2
                  text-xs font-semibold
                  tracking-wide
                  text-violet-700
                  shadow-sm
                  backdrop-blur-md
                "
              >
                <Sparkles className="h-3.5 w-3.5" />
                Welcome to Elder Care AI
              </div>

              <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
                How would you like to{" "}
                <span
                  className="
                    bg-gradient-to-r
                    from-violet-600
                    via-purple-600
                    to-fuchsia-500
                    bg-clip-text
                    text-transparent
                  "
                >
                  continue?
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                Select your role below, and we'll take you to the experience built for you.
              </p>
            </div>

            {/* =================================================
                ROLE CARDS
            ================================================= */}

            <div className="grid gap-6 md:grid-cols-3">
              {roles.map((role, i) => {
                const Icon = role.icon;

                return (
                  <button
                    key={role.title}
                    type="button"
                    onClick={role.action}
                    disabled={!role.active}
                    style={{ animationDelay: `${i * 90}ms` }}
                    className={`
                      group relative flex min-h-[400px]
                      animate-[rise_0.6s_ease_both]
                      flex-col overflow-hidden
                      rounded-[28px]
                      border p-7 text-left
                      transition-all duration-300 ease-out
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-violet-500
                      focus-visible:ring-offset-2
                      focus-visible:ring-offset-[#F8F5FF]

                      ${
                        role.active
                          ? `
                            cursor-pointer
                            border-violet-200/80
                            bg-white/85
                            shadow-[0_20px_60px_-25px_rgba(124,58,237,0.35)]
                            backdrop-blur-xl
                            hover:-translate-y-2
                            hover:border-violet-300
                            hover:shadow-[0_30px_80px_-25px_rgba(124,58,237,0.45)]
                          `
                          : `
                            cursor-not-allowed
                            border-slate-200/80
                            bg-white/50
                            opacity-80
                          `
                      }
                    `}
                  >
                    {/* Card Glow */}

                    {role.active && (
                      <>
                        <div
                          className="
                            absolute -right-16 -top-16
                            h-40 w-40 rounded-full
                            bg-violet-400/10
                            blur-3xl
                            transition-all duration-500
                            group-hover:bg-violet-400/25
                          "
                        />
                        {/* gradient border sheen on hover */}
                        <div
                          className="
                            pointer-events-none absolute inset-0 rounded-[28px]
                            opacity-0 transition-opacity duration-500
                            group-hover:opacity-100
                          "
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(124,58,237,0.08), transparent 40%)",
                          }}
                        />
                      </>
                    )}

                    {/* Top Row */}

                    <div className="relative flex items-center justify-between">
                      <div
                        className={`
                          flex h-16 w-16 items-center justify-center
                          rounded-2xl
                          transition-transform duration-300
                          ${
                            role.active
                              ? "bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-600 group-hover:scale-105"
                              : "bg-slate-100 text-slate-400"
                          }
                        `}
                      >
                        <Icon className="h-8 w-8" strokeWidth={1.8} />
                      </div>

                      <div
                        className={`
                          inline-flex items-center gap-1.5 rounded-full px-4 py-2
                          text-xs font-semibold
                          ${
                            role.active
                              ? "bg-violet-50 text-violet-700"
                              : "bg-slate-100 text-slate-400"
                          }
                        `}
                      >
                        {role.active ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        ) : (
                          <Lock className="h-3 w-3" />
                        )}
                        {role.badge}
                      </div>
                    </div>

                    {/* Card Content */}

                    <div className="relative mt-8">
                      <h3
                        className={`
                          text-2xl font-bold tracking-tight
                          ${role.active ? "text-slate-900" : "text-slate-500"}
                        `}
                      >
                        {role.title}
                      </h3>

                      <p
                        className={`
                          mt-3 text-[15px] leading-6
                          ${role.active ? "text-slate-600" : "text-slate-400"}
                        `}
                      >
                        {role.description}
                      </p>

                      <ul className="mt-5 space-y-2">
                        {role.points.map((point) => (
                          <li
                            key={point}
                            className={`
                              flex items-center gap-2 text-sm
                              ${role.active ? "text-slate-600" : "text-slate-400"}
                            `}
                          >
                            <span
                              className={`
                                flex h-4 w-4 shrink-0 items-center justify-center rounded-full
                                ${
                                  role.active
                                    ? "bg-violet-100 text-violet-600"
                                    : "bg-slate-100 text-slate-400"
                                }
                              `}
                            >
                              <Check className="h-2.5 w-2.5" strokeWidth={3} />
                            </span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bottom Action */}

                    <div className="relative mt-auto flex items-center justify-between border-t border-slate-100 pt-6">
                      <span
                        className={`
                          text-sm font-semibold
                          ${role.active ? "text-violet-600" : "text-slate-400"}
                        `}
                      >
                        {role.active ? `Continue as ${role.title}` : "Coming soon"}
                      </span>

                      {role.active ? (
                        <div
                          className="
                            flex h-10 w-10
                            items-center justify-center
                            rounded-full
                            bg-violet-600
                            text-white
                            shadow-lg
                            shadow-violet-500/25
                            transition-transform duration-300
                            group-hover:translate-x-1
                            group-hover:bg-violet-700
                          "
                        >
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <Lock className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}

            <div className="mt-12 flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-8">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
                <ShieldCheck className="h-4 w-4 text-violet-400" />
                HIPAA-compliant data handling
              </div>
              <div className="hidden h-3 w-px bg-slate-300 sm:block" />
              <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
                <Lock className="h-4 w-4 text-violet-400" />
                Secure authentication
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -30px) scale(1.05);
          }
        }
        @keyframes rise {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </main>
  );
}