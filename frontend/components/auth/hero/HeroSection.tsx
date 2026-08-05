"use client";

import { motion } from "framer-motion";
import FloatingStats from "./FloatingStats";
import FloatingIcons from "./FloatingIcons";
import AnimatedLogo from "./AnimatedLogo";
import FloatingHealthcareCards from "./FloatingHealthcareCards";
import AnimatedHeading from "./AnimatedHeading";

import {
  Activity,
  Bell,
  Brain,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "AI Health Monitoring",
    description:
      "Monitor health metrics in real time with intelligent analysis.",
  },
  {
    icon: Brain,
    title: "AI Predictions",
    description:
      "Predict health risks before they become emergencies.",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description:
      "SOS, fall detection and emergency notifications.",
  },
  {
    icon: ShieldCheck,
    title: "Military Grade Security",
    description:
      "End-to-end encrypted healthcare platform.",
  },
];

export default function HeroSection() {
  return (
    <section className="relative flex h-full items-center">

      <FloatingStats />
      <FloatingIcons />
      <FloatingHealthcareCards />

      <div className="max-w-2xl">

        <AnimatedLogo />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex rounded-full border border-violet-200 bg-white/60 px-5 py-2 backdrop-blur-xl"
        >
          ❤️ Elderly Care AI
        </motion.div>

        <AnimatedHeading />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 max-w-xl text-xl leading-9 text-slate-600"
        >
          Monitor your loved ones from anywhere with AI-powered health
          monitoring, emergency alerts, medication tracking and predictive
          healthcare.
        </motion.p>

        <div className="mt-16 grid gap-5">

          {features.map((item, index) => {

            const Icon = item.icon;

            return (

              <motion.div
                key={item.title}
                initial={{
                  opacity: 0,
                  x: -40,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.5 + index * 0.12,
                }}
                whileHover={{
                  y: -5,
                  scale: 1.02,
                }}
                className="
                  group
                  flex
                  items-start
                  gap-5
                  rounded-3xl
                  border
                  border-white/40
                  bg-white/55
                  p-6
                  backdrop-blur-2xl
                  transition-all
                  duration-300
                  hover:border-violet-300
                  hover:shadow-[0_20px_50px_rgba(124,58,237,.15)]
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
                    from-violet-600
                    to-fuchsia-500
                    text-white
                    transition-transform
                    group-hover:rotate-6
                  "
                >
                  <Icon size={26} />
                </div>

                <div>

                  <h3 className="text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 leading-7 text-slate-500">
                    {item.description}
                  </p>

                </div>

              </motion.div>

            );

          })}

        </div>

      </div>

    </section>
  );
}