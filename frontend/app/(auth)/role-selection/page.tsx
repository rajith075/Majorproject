import {
  HeartHandshake,
  Stethoscope,
  ShieldPlus,
  ArrowRight,
} from "lucide-react";

import Link from "next/link";

export default function RoleSelectionPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8F5FF]">

      {/* Background Glow */}

      <div className="absolute -top-56 -left-48 h-[650px] w-[650px] rounded-full bg-violet-400/25 blur-[180px]" />

      <div className="absolute -top-20 right-[-180px] h-[550px] w-[550px] rounded-full bg-fuchsia-400/20 blur-[180px]" />

      <div className="absolute bottom-[-250px] left-1/4 h-[700px] w-[700px] rounded-full bg-purple-300/20 blur-[220px]" />

      {/* Mesh */}

      <div
        className="
          absolute
          inset-0
          opacity-[0.035]
          [background-image:radial-gradient(#7C3AED_1px,transparent_1px)]
          [background-size:30px_30px]
        "
      />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-8 py-16">

        {/* Header */}

        <div className="mx-auto max-w-3xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
            ❤️ Elderly Care AI
          </div>

          <h1 className="mt-8 text-6xl font-bold tracking-tight text-slate-900">
            Caring Beyond
            <span className="block bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Distance
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-xl leading-9 text-slate-500">
            Stay connected with your loved ones through AI-powered remote
            healthcare monitoring, real-time alerts, and intelligent insights.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          {/* Family */}

          <Link
            href="/register"
            className="
              group
              rounded-[32px]
              border
              border-violet-100
              bg-white/70
              p-8
              backdrop-blur-xl
              shadow-lg
              transition-all
              duration-300
              hover:-translate-y-2
              hover:shadow-2xl
            "
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
              <HeartHandshake size={38} />
            </div>

            <h2 className="mt-8 text-3xl font-bold text-slate-900">
              Family Dashboard
            </h2>

            <p className="mt-4 leading-8 text-slate-500">
              Monitor your parents remotely, receive emergency alerts, track
              medications, health reports and AI recommendations.
            </p>

            <div className="mt-8 flex items-center gap-2 font-semibold text-violet-700">
              Continue

              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </div>

          </Link>

          {/* Caregiver */}

          <div
            className="
              rounded-[32px]
              border
              border-violet-100
              bg-white/70
              p-8
              backdrop-blur-xl
              opacity-80
            "
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-violet-600">
              <ShieldPlus size={38} />
            </div>

            <h2 className="mt-8 text-3xl font-bold text-slate-900">
              Caregiver Portal
            </h2>

            <p className="mt-4 leading-8 text-slate-500">
              Manage medications, record vitals, maintain daily care and update
              patient health information.
            </p>

            <div className="mt-8 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
              Coming Soon
            </div>

          </div>

          {/* Doctor */}

          <div
            className="
              rounded-[32px]
              border
              border-violet-100
              bg-white/70
              p-8
              backdrop-blur-xl
              opacity-80
            "
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-violet-600">
              <Stethoscope size={38} />
            </div>

            <h2 className="mt-8 text-3xl font-bold text-slate-900">
              Doctor Portal
            </h2>

            <p className="mt-4 leading-8 text-slate-500">
              Review patient history, prescribe medications and monitor
              AI-generated clinical insights.
            </p>

            <div className="mt-8 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
              Coming Soon
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}