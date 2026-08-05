"use client";

import { motion } from "framer-motion";

interface Props {
  label: string;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function PremiumInput({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
}: Props) {
  return (
    <motion.div
      whileFocus={{ scale: 1.02 }}
      className="group relative"
    >
      <label
        className="
          mb-3
          block
          text-sm
          font-semibold
          text-slate-700
        "
      >
        {label}
      </label>

      <div
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-violet-100
          bg-white/70
          backdrop-blur-xl
          transition-all
          duration-300
          group-focus-within:border-violet-500
          group-focus-within:shadow-[0_0_35px_rgba(124,58,237,.18)]
        "
      >
        <div
          className="
            absolute
            left-5
            top-1/2
            -translate-y-1/2
            text-violet-500
          "
        >
          {icon}
        </div>

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            h-16
            w-full
            bg-transparent
            pl-16
            pr-5
            text-lg
            outline-none
            placeholder:text-slate-400
          "
        />

        <motion.div
          layoutId="inputGlow"
          className="
            absolute
            bottom-0
            left-0
            h-[3px]
            w-full
            origin-left
            scale-x-0
            bg-gradient-to-r
            from-violet-500
            via-fuchsia-500
            to-sky-500
            transition-transform
            duration-300
            group-focus-within:scale-x-100
          "
        />
      </div>
    </motion.div>
  );
}