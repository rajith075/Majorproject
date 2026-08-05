"use client";

import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
}

export default function GlassCard({ children }: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.7,
      }}
      className="
        relative
        w-full
        max-w-xl
        overflow-hidden
        rounded-[36px]
        border
        border-white/30
        bg-white/60
        p-10
        shadow-[0_25px_80px_rgba(124,58,237,0.18)]
        backdrop-blur-3xl
      "
    >
      {/* Gradient Border */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-[36px]
          border
          border-violet-200/30
        "
      />

      {children}
    </motion.div>
  );
}