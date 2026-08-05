"use client";

import { motion } from "framer-motion";
import {
  HeartPulse,
  Brain,
  Pill,
} from "lucide-react";

const cards = [
  {
    title: "Live Monitoring",
    subtitle: "Vitals Stable",
    icon: HeartPulse,
    color: "from-red-500 to-pink-500",
    top: "8%",
    right: "-80px",
    delay: 0,
  },
  {
    title: "AI Analysis",
    subtitle: "Healthy",
    icon: Brain,
    color: "from-violet-600 to-fuchsia-500",
    top: "48%",
    right: "-120px",
    delay: 1,
  },
  {
    title: "Medication",
    subtitle: "3 Due Today",
    icon: Pill,
    color: "from-emerald-500 to-teal-500",
    bottom: "5%",
    right: "-40px",
    delay: 2,
  },
];

export default function FloatingHealthcareCards() {
  return (
    <>
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={index}
            animate={{
              y: [0, -15, 0],
              rotate: [-2, 2, -2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: card.delay,
              ease: "easeInOut",
            }}
            style={{
              top: card.top,
              bottom: card.bottom,
              right: card.right,
            }}
            className="
              absolute
              hidden
              xl:flex
              w-72
              items-center
              gap-4
              rounded-3xl
              border
              border-white/40
              bg-white/70
              p-5
              shadow-[0_25px_70px_rgba(124,58,237,.18)]
              backdrop-blur-3xl
            "
          >
            <div
              className={`
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                ${card.color}
                text-white
              `}
            >
              <Icon size={28} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                {card.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {card.subtitle}
              </p>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}