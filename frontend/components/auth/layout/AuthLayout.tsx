"use client";

import AuroraBackground from "../background/AuroraBackground";
import FloatingParticles from "../background/FloatingParticles";
import GlassCard from "../shared/GlassCard";
import MouseGlow from "../background/MouseGlow";
import NetworkBackground from "../background/NetworkBackground";

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: Props) {
  return (
    <div className="relative flex min-h-screen overflow-hidden">

      <AuroraBackground />
      <MouseGlow />
      <NetworkBackground />
      <FloatingParticles />

      {/* LEFT */}

      <section className="relative z-10 hidden w-1/2 items-center justify-center px-20 lg:flex">

        <div className="max-w-xl">

          <div className="mb-8 inline-flex rounded-full bg-violet-100 px-5 py-2 text-sm font-semibold text-violet-700">
            AI Powered Healthcare
          </div>

          <h1 className="text-6xl font-black leading-tight text-slate-900">
            Elderly Care
            <span className="block bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              AI Platform
            </span>
          </h1>

          <p className="mt-8 text-xl leading-9 text-slate-600">
            Monitor your loved ones remotely with AI-powered
            healthcare insights, emergency alerts and
            intelligent health tracking.
          </p>

          <div className="mt-14 space-y-5">

            {[
              "AI Health Prediction",
              "Emergency Alerts",
              "Medication Tracking",
              "Health Analytics",
              "24×7 Family Monitoring",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-2xl bg-white/40 p-4 backdrop-blur-xl"
              >
                <div className="h-3 w-3 rounded-full bg-violet-600" />

                <span className="font-medium text-slate-700">
                  {item}
                </span>
              </div>
            ))}

          </div>

        </div>

      </section>

      {/* RIGHT */}

      <section className="relative z-10 flex flex-1 items-center justify-center p-10">

        <GlassCard>

          <div className="mb-10">

            <h2 className="text-5xl font-bold text-slate-900">
              {title}
            </h2>

            <p className="mt-4 text-lg leading-8 text-slate-500">
              {subtitle}
            </p>

          </div>

          {children}

        </GlassCard>

      </section>

    </div>
  );
}