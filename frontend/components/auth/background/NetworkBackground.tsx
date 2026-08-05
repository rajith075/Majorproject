"use client";

import { motion } from "framer-motion";

const nodes = [
  { x: "8%", y: "18%" },
  { x: "28%", y: "45%" },
  { x: "58%", y: "22%" },
  { x: "82%", y: "35%" },
  { x: "72%", y: "75%" },
  { x: "35%", y: "82%" },
];

export default function NetworkBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">

      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        {nodes.map((start, i) =>
          nodes.slice(i + 1).map((end, j) => (
            <motion.line
              key={`${i}-${j}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="rgba(139,92,246,.10)"
              strokeWidth="1"
              initial={{ opacity: 0.1 }}
              animate={{ opacity: [0.05, 0.3, 0.05] }}
              transition={{
                duration: 5,
                delay: i * 0.3,
                repeat: Infinity,
              }}
            />
          ))
        )}
      </svg>

      {nodes.map((node, index) => (
        <motion.div
          key={index}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: index * 0.4,
          }}
          className="
            absolute
            h-3
            w-3
            rounded-full
            bg-violet-500
            shadow-[0_0_18px_rgba(124,58,237,.8)]
          "
          style={{
            left: node.x,
            top: node.y,
          }}
        />
      ))}
    </div>
  );
}