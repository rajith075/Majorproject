"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { HeartPulse } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="
        relative
        flex
        h-screen
        w-72
        flex-col
        overflow-hidden
        border-r
        border-violet-100
        bg-gradient-to-b
        from-[#F7F3FF]
        via-[#F5F0FF]
        to-[#F8F5FF]
      "
    >
      {/* Soft Background Glow */}

      <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-violet-300/20 blur-[120px]" />

      <div className="absolute bottom-[-120px] right-[-80px] h-72 w-72 rounded-full bg-fuchsia-300/15 blur-[120px]" />

      {/* Logo */}

      <div className="relative border-b border-violet-100 p-8">
        <div className="flex items-center gap-4">
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-violet-500
              to-purple-600
              text-white
              shadow-lg
            "
          >
            <HeartPulse size={28} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Elderly Care
            </h1>

            <p className="text-sm text-slate-500">
              AI Health Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}

      <nav className="relative flex-1 space-y-2 p-5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                `
                group
                flex
                items-center
                gap-4
                rounded-2xl
                px-5
                py-4
                text-slate-600
                transition-all
                duration-300
                hover:bg-violet-50
                hover:text-violet-700
                `,
                active &&
                  `
                  bg-gradient-to-r
                  from-violet-500
                  to-purple-500
                  text-white
                  shadow-lg
                  `
              )}
            >
              <Icon
                size={20}
                className={cn(
                  "transition-transform duration-300 group-hover:scale-110",
                  active && "scale-110"
                )}
              />

              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Card */}

      <div className="relative p-5">
        <div className="rounded-3xl border border-violet-100 bg-white/80 p-5 shadow-lg backdrop-blur-xl">
          <p className="text-sm text-slate-500">
            AI Health Assistant
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            Online
          </p>

          <div className="mt-4 h-2 w-full rounded-full bg-violet-100">
            <div className="h-2 w-4/5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
          </div>
        </div>
      </div>
    </aside>
  );
}