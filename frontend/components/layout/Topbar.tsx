"use client";

import { Bell, CalendarDays, Search } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export default function Topbar() {
  const user = useAuthStore((state) => state.user);

  const fullName = user?.full_name || "User";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel =
    user?.role === "family"
      ? "Family Member"
      : user?.role === "caregiver"
      ? "Caregiver"
      : user?.role === "doctor"
      ? "Doctor"
      : "User";

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">

      {/* Left */}

      <div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard Overview
        </h2>

        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">

          <CalendarDays size={15} />

          <span>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>

        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-5">

        {/* Search */}

        <div className="flex w-96 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all focus-within:border-blue-500 focus-within:bg-white">

          <Search size={18} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search patients, reports..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />

        </div>

        {/* Notification */}

        <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">

          <Bell size={20} className="text-slate-600" />

          <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-500" />

        </button>

        {/* User Profile */}

        <button className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:shadow-md">

          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-violet-500
              to-purple-600
              text-white
              font-bold
              shadow-md
              shadow-violet-500/20
            "
          >
            {initials}
          </div>

          <div className="text-left">

            <p className="text-sm font-semibold text-slate-900">
              {fullName}
            </p>

            <p className="text-xs text-slate-500">
              {roleLabel}
            </p>

          </div>

        </button>

      </div>

    </header>
  );
}