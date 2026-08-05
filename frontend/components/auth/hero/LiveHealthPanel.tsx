"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Brain,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";

const cards = [
  {
    title: "Heart Rate",
    value: "78 BPM",
    status: "LIVE",
    icon: HeartPulse,
    color: "from-red-500 to-pink-500",
  },
  {
    title: "AI Health Score",
    value: "98%",
    status: "Excellent",
    icon: Brain,
    color: "from-violet-600 to-fuchsia-500",
  },
  {
    title: "Blood Pressure",
    value: "120 / 80",
    status: "Normal",
    icon: Activity,
    color: "from-sky-500 to-cyan-500",
  },
  {
    title: "Emergency Status",
    value: "Protected",
    status: "24×7",
    icon: ShieldCheck,
    color: "from-emerald-500 to-green-500",
  },
];

export default function LiveHealthPanel() {
  return (
    <div className="mt-14 grid gap-5">

      {cards.map((card, index) => {

        const Icon = card.icon;

        return (

          <motion.div
            key={card.title}
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15 * index,
            }}
            whileHover={{
              y: -6,
              scale: 1.02,
            }}
            className="
              group
              flex
              items-center
              justify-between
              rounded-[28px]
              border
              border-white/40
              bg-white/70
              p-5
              backdrop-blur-3xl
              shadow-[0_20px_50px_rgba(124,58,237,.12)]
            "
          >

            <div className="flex items-center gap-4">

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
                <Icon size={26} />
              </div>

              <div>

                <p className="font-bold text-slate-900">
                  {card.title}
                </p>

                <p className="text-slate-500">
                  {card.value}
                </p>

              </div>

            </div>

            <motion.div
              animate={{
                scale: [1, 1.08, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
              }}
              className="
                rounded-full
                bg-emerald-100
                px-4
                py-2
                text-sm
                font-bold
                text-emerald-700
              "
            >
              {card.status}
            </motion.div>

          </motion.div>

        );

      })}

    </div>
  );
}