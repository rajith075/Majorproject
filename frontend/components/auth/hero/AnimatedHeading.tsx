"use client";

import { motion } from "framer-motion";

export default function AnimatedHeading() {
  return (
    <div className="relative mt-10">

      {/* Glow */}

      <div
        className="
          absolute
          left-0
          top-12
          h-28
          w-96
          rounded-full
          bg-violet-500/25
          blur-[90px]
        "
      />

      {/* Main */}

      <motion.h1
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: .8,
        }}
        className="
          relative
          text-7xl
          font-black
          leading-[1]
          tracking-tight
          text-slate-900
        "
      >
        Healthcare

        <motion.span
          animate={{
            backgroundPosition: [
              "0%",
              "100%",
              "0%",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundSize: "300%",
          }}
          className="
            mt-2
            block
            bg-gradient-to-r
            from-violet-600
            via-fuchsia-500
            via-sky-500
            to-violet-600
            bg-clip-text
            text-transparent
          "
        >
          Powered by AI
        </motion.span>

      </motion.h1>

    </div>
  );
}