"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import {
  Activity,
  HeartPulse,
  Users,
} from "lucide-react";

export default function FloatingStats() {
  return (
    <>
      {/* Families */}

      <motion.div
        animate={{
          y: [0, -18, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          top-20
          right-10
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
          shadow-2xl
          backdrop-blur-3xl
        "
      >
        <div className="rounded-2xl bg-violet-600 p-3 text-white">
          <Users />
        </div>

        <div>
          <p className="text-3xl font-black text-slate-900">
            <AnimatedCounter end={10000} suffix="+" />
          </p>

          <p className="text-slate-500">
            Families Protected
          </p>
        </div>
      </motion.div>

      {/* Accuracy */}

      <motion.div
        animate={{
          y: [0, 20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          bottom-40
          left-[-20px]
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
          shadow-2xl
          backdrop-blur-3xl
        "
      >
        <div className="rounded-2xl bg-emerald-500 p-3 text-white">
          <Activity />
        </div>

        <div>
          <p className="text-3xl font-black text-slate-900">
            <AnimatedCounter end={99} suffix="%" />
          </p>

          <p className="text-slate-500">
            AI Prediction Accuracy
          </p>
        </div>
      </motion.div>

      {/* Monitoring */}

      <motion.div
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          bottom-12
          right-0
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
          shadow-2xl
          backdrop-blur-3xl
        "
      >
        <div className="rounded-2xl bg-pink-500 p-3 text-white">
          <HeartPulse />
        </div>

        <div>
          <p className="text-3xl font-black text-slate-900">
            24×7
          </p>

          <p className="text-slate-500">
            Health Monitoring
          </p>
        </div>
      </motion.div>
    </>
  );
}