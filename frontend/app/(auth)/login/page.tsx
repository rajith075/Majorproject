import LoginForm from "@/components/auth/LoginForm";
import GlassCard from "@/components/auth/layout/GlassCard";
import PageTransition from "@/components/auth/layout/PageTransition";

import {
  Activity,
  Bell,
  Brain,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden bg-[#F8F5FF]">

        {/* Background Glow */}

        <div className="absolute -top-56 -left-48 h-[700px] w-[700px] rounded-full bg-violet-400/20 blur-[180px]" />

        <div className="absolute bottom-[-220px] right-[-120px] h-[620px] w-[620px] rounded-full bg-fuchsia-300/15 blur-[180px]" />

        {/* Grid */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.035]
            [background-image:radial-gradient(#8B5CF6_1px,transparent_1px)]
            [background-size:30px_30px]
          "
        />

        <main
          className="
            relative
            z-10
            mx-auto
            flex
            min-h-screen
            max-w-[1600px]
            items-center
            justify-between
            gap-24
            px-10
            py-16
            lg:flex-row
            flex-col
          "
        >

          {/* LEFT */}

          <section className="max-w-2xl">

            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-5 py-2 backdrop-blur-xl shadow-sm">

              <span className="text-lg">
                ❤️
              </span>

              <span className="text-sm font-semibold text-violet-700">
                AI Elderly Care Platform
              </span>

            </div>

            <h1 className="mt-10 text-7xl font-black leading-[1] tracking-tight text-slate-900">

              Welcome

              <span className="mt-3 block bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-700 bg-clip-text text-transparent">
                Back
              </span>

            </h1>

            <p className="mt-8 max-w-xl text-xl leading-9 text-slate-500">

              Continue monitoring your loved ones with AI-powered
              healthcare insights, medication reminders,
              emergency alerts and live health monitoring.

            </p>

            <div className="mt-10 flex items-center gap-5">

              <button
                className="
                  flex
                  items-center
                  gap-2
                  rounded-2xl
                  bg-gradient-to-r
                  from-violet-600
                  to-fuchsia-600
                  px-8
                  py-4
                  font-semibold
                  text-white
                  shadow-xl
                  transition-all
                  duration-300
                  hover:-translate-y-1
                "
              >

                Explore Features

                <ArrowRight size={18} />

              </button>

              <p className="text-sm text-slate-500">
                Trusted by families worldwide.
              </p>

            </div>

            <div className="mt-16 grid gap-8">

              <Feature
                icon={<Activity className="h-6 w-6" />}
                title="Live Health Monitoring"
                description="Monitor vitals and health status in real time."
              />

              <Feature
                icon={<Brain className="h-6 w-6" />}
                title="AI Healthcare"
                description="Smart health predictions and recommendations."
              />

              <Feature
                icon={<Bell className="h-6 w-6" />}
                title="Emergency Alerts"
                description="Instant notifications during emergencies."
              />

              <Feature
                icon={<ShieldCheck className="h-6 w-6" />}
                title="Secure Platform"
                description="Built with enterprise-grade healthcare security."
              />

            </div>

          </section>

          {/* RIGHT */}

          <section
            className="
              relative
              flex
              w-full
              max-w-[600px]
              justify-center
            "
          >

            <div
              className="
                absolute
                -inset-10
                rounded-[48px]
                bg-gradient-to-br
                from-violet-500/10
                via-fuchsia-400/5
                to-transparent
                blur-3xl
              "
            />

            <GlassCard>

              <LoginForm />

            </GlassCard>

          </section>

        </main>

      </div>

    </PageTransition>
  );
}

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Feature({
  icon,
  title,
  description,
}: FeatureProps) {
  return (
    <div
      className="
        group
        flex
        items-start
        gap-5
        rounded-3xl
        border
        border-transparent
        p-4
        transition-all
        duration-300
        hover:border-violet-100
        hover:bg-white/40
      "
    >
      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-gradient-to-br
          from-violet-100
          to-fuchsia-100
          text-violet-700
          shadow-sm
          transition-all
          group-hover:scale-110
        "
      >
        {icon}
      </div>

      <div>

        <h3 className="text-lg font-bold text-slate-900">
          {title}
        </h3>

        <p className="mt-2 leading-7 text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}