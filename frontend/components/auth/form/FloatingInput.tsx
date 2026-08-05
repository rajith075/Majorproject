"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface FloatingInputProps {
  label: string;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function FloatingInput({
  label,
  icon,
  type = "text",
  value,
  onChange,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);

  const active = focused || value.length > 0;

  return (
    <div className="relative">

      <div
        className="
          group
          relative
          h-16
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white/80
          backdrop-blur-xl
          transition-all
          duration-300
          focus-within:border-violet-500
          focus-within:shadow-[0_0_35px_rgba(124,58,237,.18)]
        "
      >

        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-violet-500">
          {icon}
        </div>

        <motion.label
          animate={{
            y: active ? -18 : 0,
            scale: active ? 0.82 : 1,
          }}
          transition={{ duration: 0.2 }}
          className="
            absolute
            left-14
            top-1/2
            origin-left
            -translate-y-1/2
            text-slate-500
            pointer-events-none
          "
        >
          {label}
        </motion.label>

        <input
          type={type}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          className="
            h-full
            w-full
            bg-transparent
            pt-5
            pl-14
            pr-5
            outline-none
            text-slate-900
          "
        />

      </div>

    </div>
  );
}