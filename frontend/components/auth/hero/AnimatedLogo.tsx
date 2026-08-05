"use client";

import { motion } from "framer-motion";
import { HeartPulse } from "lucide-react";

export default function AnimatedLogo() {
  return (
    <div className="flex items-center gap-5">

      {/* Logo */}

      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          relative
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-3xl
          bg-gradient-to-br
          from-violet-600
          via-fuchsia-500
          to-sky-500
          shadow-[0_20px_50px_rgba(124,58,237,.35)]
        "
      >

        {/* Pulse Ring */}

        <motion.div
          animate={{
            scale: [1, 1.6],
            opacity: [0.4, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="
            absolute
            inset-0
            rounded-3xl
            border-2
            border-violet-400
          "
        />

        <HeartPulse
          size={36}
          className="text-white"
        />

      </motion.div>

      {/* Text */}

      <div>

        <motion.h2
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: .2,
          }}
          className="
            text-3xl
            font-black
            text-slate-900
          "
        >
          Elderly Care
        </motion.h2>

        <motion.p
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: .4,
          }}
          className="
            mt-1
            bg-gradient-to-r
            from-violet-600
            via-fuchsia-500
            to-sky-500
            bg-clip-text
            text-lg
            font-bold
            text-transparent
          "
        >
          AI Healthcare Platform
        </motion.p>

      </div>

    </div>
  );
}