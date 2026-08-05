"use client";

import { motion } from "framer-motion";

export default function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">

      {/* Mesh Background */}

      <div className="absolute inset-0 bg-[#F8F5FF]" />

      {/* Purple Blob */}

      <motion.div
        animate={{
          x: [0, 120, -60, 0],
          y: [0, -80, 60, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          -top-56
          -left-56
          h-[700px]
          w-[700px]
          rounded-full
          bg-violet-500/30
          blur-[160px]
        "
      />

      {/* Pink Blob */}

      <motion.div
        animate={{
          x: [0, -150, 70, 0],
          y: [0, 120, -50, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          top-0
          right-[-200px]
          h-[650px]
          w-[650px]
          rounded-full
          bg-fuchsia-400/30
          blur-[180px]
        "
      />

      {/* Blue Blob */}

      <motion.div
        animate={{
          x: [0, 80, -120, 0],
          y: [0, 100, -40, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          bottom-[-300px]
          left-1/3
          h-[800px]
          w-[800px]
          rounded-full
          bg-sky-300/20
          blur-[220px]
        "
      />

      {/* Grid */}

      <div
        className="
          absolute
          inset-0
          opacity-[0.04]
          [background-image:radial-gradient(#7C3AED_1px,transparent_1px)]
          [background-size:34px_34px]
        "
      />

    </div>
  );
}