"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useState } from "react";

import {
  Activity,
  Bell,
  Brain,
  Cloud,
  HeartPulse,
  Pill,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

/* =========================================================
   TOKENS
   Signature move: a rotating conic "aura" behind the core,
   plus signal pulses that travel outward along each
   connection line — the hero reads as a living system,
   not a static illustration.
========================================================= */

const CENTER = { top: 42, left: 42 };

type OrbitIcon = {
  Icon: typeof HeartPulse;
  top: number;
  left: number;
  color: string;
  glow: string;
  size: number;
  floatDuration: number;
  floatDelay: number;
  rotateRange: number;
  pulseDelay: number;
};

const orbitIcons: OrbitIcon[] = [
  { Icon: HeartPulse, top: 4, left: 46, color: "text-rose-500", glow: "rgba(244,63,94,0.35)", size: 26, floatDuration: 6, floatDelay: 0, rotateRange: 6, pulseDelay: 0 },
  { Icon: Pill, top: 20, left: 84, color: "text-fuchsia-500", glow: "rgba(217,70,239,0.35)", size: 24, floatDuration: 7, floatDelay: 0.6, rotateRange: 8, pulseDelay: 0.8 },
  { Icon: ShieldCheck, top: 14, left: 4, color: "text-emerald-500", glow: "rgba(16,185,129,0.35)", size: 24, floatDuration: 6.5, floatDelay: 1.2, rotateRange: 5, pulseDelay: 1.6 },
  { Icon: Activity, top: 60, left: 90, color: "text-sky-500", glow: "rgba(14,165,233,0.35)", size: 26, floatDuration: 5.5, floatDelay: 1.8, rotateRange: 7, pulseDelay: 2.4 },
  { Icon: Stethoscope, top: 68, left: 8, color: "text-indigo-500", glow: "rgba(99,102,241,0.35)", size: 24, floatDuration: 7.5, floatDelay: 0.3, rotateRange: 6, pulseDelay: 3.2 },
  { Icon: Bell, top: 90, left: 60, color: "text-amber-500", glow: "rgba(245,158,11,0.35)", size: 22, floatDuration: 6, floatDelay: 2.2, rotateRange: 9, pulseDelay: 4.0 },
  { Icon: Cloud, top: 86, left: 20, color: "text-violet-400", glow: "rgba(167,139,250,0.35)", size: 24, floatDuration: 8, floatDelay: 1, rotateRange: 5, pulseDelay: 4.8 },
];

type Particle = {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  depth: number; // 0 = far/blurry, 1 = near/sharp
};

const particleColors = ["#8B5CF6", "#D946EF", "#60A5FA"];

export default function HeroAnimation() {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  /* ---------- mouse parallax ---------- */
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const springX = useSpring(mvX, { stiffness: 40, damping: 18, mass: 0.6 });
  const springY = useSpring(mvY, { stiffness: 40, damping: 18, mass: 0.6 });

  const farX = useTransform(springX, (v) => v * 6);
  const farY = useTransform(springY, (v) => v * 6);
  const nearX = useTransform(springX, (v) => v * -16);
  const nearY = useTransform(springY, (v) => v * -16);

  useEffect(() => {
    setMounted(true);
    const generated: Particle[] = Array.from({ length: 26 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 3.5,
      duration: 9 + Math.random() * 7,
      delay: Math.random() * 5,
      color: particleColors[i % particleColors.length],
      depth: i % 2,
    }));
    setParticles(generated);

    if (prefersReducedMotion) return;

    const handleMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mvX.set(nx);
      mvY.set(ny);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mvX, mvY, prefersReducedMotion]);

  const containerVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.09, delayChildren: 0.15 },
    },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.4, y: 12 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 140, damping: 14 },
    },
  };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* =========================
          FAR LAYER — blobs, slow parallax
      ========================== */}
      <motion.div style={{ x: farX, y: farY }} className="absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.1, 0.22, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "8%", left: "6%" }}
          className="absolute h-[400px] w-[400px] rounded-full bg-violet-500/30 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "3%", right: "4%" }}
          className="absolute h-[330px] w-[330px] rounded-full bg-fuchsia-400/25 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.16, 0.06] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "2%", left: "18%" }}
          className="absolute h-[320px] w-[320px] rounded-full bg-sky-400/20 blur-[120px]"
        />

        {/* far particle layer — soft, slow, blurred */}
        {particles
          .filter((p) => p.depth === 0)
          .map((p) => (
            <motion.span
              key={p.id}
              animate={{
                y: [-10, 10, -10],
                x: [-3, 3, -3],
                opacity: [0.1, 0.5, 0.1],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: p.delay,
              }}
              className="absolute rounded-full blur-[1px]"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.left}%`,
                top: `${p.top}%`,
                background: p.color,
              }}
            />
          ))}
      </motion.div>

      {/* =========================
          MID LAYER — lines, rings, core, icons, near particles
      ========================== */}
      <motion.div
        style={{ x: nearX, y: nearY }}
        variants={containerVariants}
        initial="hidden"
        animate={mounted ? "show" : "hidden"}
        className="absolute inset-0"
      >
        {/* connection lines */}
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#D946EF" />
            </linearGradient>
          </defs>
          {orbitIcons.map((pos, i) => (
            <motion.line
              key={i}
              x1={`${CENTER.left}%`}
              y1={`${CENTER.top}%`}
              x2={`${pos.left}%`}
              y2={`${pos.top}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1.25"
              strokeDasharray="3 7"
              strokeLinecap="round"
              animate={{ opacity: [0.06, 0.35, 0.06] }}
              transition={{
                duration: 4 + i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}
        </svg>

        {/* signal pulses — small comets traveling from core to each icon */}
        {orbitIcons.map((pos, i) => (
          <motion.span
            key={`pulse-${i}`}
            animate={{
              left: [`${CENTER.left}%`, `${pos.left}%`, `${CENTER.left}%`],
              top: [`${CENTER.top}%`, `${pos.top}%`, `${CENTER.top}%`],
              opacity: [0, 0.9, 0],
              scale: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: pos.pulseDelay,
              times: [0, 0.55, 1],
            }}
            className="absolute h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: pos.glow.replace("0.35", "0.9"),
              boxShadow: `0 0 10px 2px ${pos.glow}`,
            }}
          />
        ))}

        {/* pulse rings expanding from core */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 2.3], opacity: [0.4, 0] }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 1.2,
            }}
            style={{ top: `${CENTER.top}%`, left: `${CENTER.left}%` }}
            className="absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/50"
          />
        ))}

        {/* rotating particle orbits around core */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ top: `${CENTER.top}%`, left: `${CENTER.left}%` }}
          className="absolute h-[270px] w-[270px] -translate-x-1/2 -translate-y-1/2"
        >
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <span
              key={deg}
              style={{ transform: `rotate(${deg}deg) translate(135px) rotate(-${deg}deg)` }}
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-400/70 blur-[0.5px]"
            />
          ))}
        </motion.div>

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
          style={{ top: `${CENTER.top}%`, left: `${CENTER.left}%` }}
          className="absolute h-[195px] w-[195px] -translate-x-1/2 -translate-y-1/2"
        >
          {[30, 150, 270].map((deg) => (
            <span
              key={deg}
              style={{ transform: `rotate(${deg}deg) translate(97px) rotate(-${deg}deg)` }}
              className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300/70 blur-[0.5px]"
            />
          ))}
        </motion.div>

        {/* =========================
            CORE — rotating aura + glass rings + glowing brain
        ========================== */}
        <motion.div
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: `${CENTER.top}%`, left: `${CENTER.left}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
        >
          {/* rotating conic aura — the signature element */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-2xl"
            style={{
              background:
                "conic-gradient(from 0deg, #8B5CF6, #D946EF, #60A5FA, #8B5CF6)",
            }}
          />

          {/* breathing halo */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-2xl"
          />

          {/* outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/40"
          />
          {/* inner rotating ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-300/40"
          />

          {/* glowing core */}
          <motion.div
            animate={{
              scale: [1, 1.07, 1],
              boxShadow: [
                "0 0 50px rgba(139,92,246,0.45)",
                "0 0 85px rgba(217,70,239,0.55)",
                "0 0 50px rgba(139,92,246,0.45)",
              ],
            }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-indigo-600"
          >
            <motion.div
              animate={{ rotate: [0, 6, 0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Brain className="h-9 w-9 text-white" strokeWidth={1.75} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* =========================
            FLOATING ICON CIRCLES
        ========================== */}
        {orbitIcons.map(({ Icon, color, glow, size, top, left, floatDuration, floatDelay, rotateRange }, i) => (
          <motion.div
            key={i}
            variants={iconVariants}
            style={{ top: `${top}%`, left: `${left}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              animate={{
                y: [-10, 10, -10],
                rotate: [-rotateRange, rotateRange, -rotateRange],
              }}
              transition={{
                duration: floatDuration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: floatDelay,
              }}
            >
              <motion.div
                animate={{
                  opacity: [0.85, 1, 0.85],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: floatDelay,
                }}
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.15) 70%, rgba(255,255,255,0) 100%)",
                }}
                className="flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-xl"
              >
                <Icon className={color} size={size} strokeWidth={1.75} />
              </motion.div>
            </motion.div>
          </motion.div>
        ))}

        {/* near particle layer — sharper, faster drift */}
        {particles
          .filter((p) => p.depth === 1)
          .map((p) => (
            <motion.span
              key={p.id}
              animate={{
                y: [-16, 16, -16],
                x: [-5, 5, -5],
                opacity: [0.15, 0.85, 0.15],
              }}
              transition={{
                duration: p.duration * 0.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: p.delay,
              }}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.left}%`,
                top: `${p.top}%`,
                background: p.color,
              }}
            />
          ))}
      </motion.div>
    </div>
  );
}
