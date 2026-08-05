"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
}

export default function GlassCard({
  children,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 40,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.7,
        ease: "easeOut",
      }}
      whileHover={{
        y: -6,
        transition: {
          duration: 0.25,
        },
      }}
      className="
        relative
        w-full
        max-w-[560px]
        overflow-hidden
        rounded-[36px]
        border
        border-white/70
        bg-white/80
        backdrop-blur-3xl
        shadow-[0_40px_100px_rgba(124,58,237,0.10)]
      "
    >
      {/* Border Highlight */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-[36px]
          border
          border-white/40
        "
      />

      {/* Top Glow */}

      <div
        className="
          absolute
          -top-28
          right-10
          h-56
          w-56
          rounded-full
          bg-violet-300/10
          blur-[90px]
        "
      />

      {/* Bottom Glow */}

      <div
        className="
          absolute
          -bottom-20
          -left-10
          h-44
          w-44
          rounded-full
          bg-fuchsia-300/10
          blur-[90px]
        "
      />

      {/* Noise */}

      <div
        className="
          absolute
          inset-0
          opacity-[0.03]
          [background-image:radial-gradient(#000_1px,transparent_1px)]
          [background-size:18px_18px]
        "
      />

      {/* Content */}

      <div className="relative z-10">
        {children}
      </div>

    </motion.div>
  );
}