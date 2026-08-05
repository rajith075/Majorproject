"use client";

import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
}

export default function PageTransition({
  children,
}: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: -20,
        scale: 0.98,
      }}
      transition={{
        duration: 0.55,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}