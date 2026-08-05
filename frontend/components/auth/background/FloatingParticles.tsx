"use client";

import { motion } from "framer-motion";

const particles = Array.from({ length: 30 });

export default function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, index) => {
        const size = Math.random() * 8 + 4;
        const left = Math.random() * 100;
        const duration = 12 + Math.random() * 15;
        const delay = Math.random() * 10;

        return (
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              y: 80,
            }}
            animate={{
              opacity: [0, 0.7, 0],
              y: [-1000],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "linear",
            }}
            style={{
              left: `${left}%`,
              width: size,
              height: size,
            }}
            className="
              absolute
              bottom-[-20px]
              rounded-full
              bg-white/50
              shadow-[0_0_20px_rgba(255,255,255,0.8)]
            "
          />
        );
      })}
    </div>
  );
}