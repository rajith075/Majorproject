"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";

import { toast } from "sonner";

import { login } from "@/services/api/auth";
import { PatientService } from "@/services/patient.service";

import FloatingInput from "@/components/auth/form/FloatingInput";

export default function LoginForm() {

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(true);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const updateField = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = async () => {

    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password.");
      return;
    }

    try {

      setLoading(true);

      await login({
        email: formData.email,
        password: formData.password,
      });

      const patient =
        await PatientService.loadPatient();

      toast.success("Welcome back!");

      if (patient) {
        router.replace("/dashboard");
      } else {
        router.replace("/patient-registration");
      }

    } catch (error: any) {

      toast.error(
        error?.response?.data?.detail ??
          "Invalid email or password."
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="w-full p-10 lg:p-12">

      {/* Badge */}

      <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2">

        <Sparkles
          size={16}
          className="text-violet-600"
        />

        <span className="text-sm font-semibold text-violet-700">
          Family Login
        </span>

      </div>

      {/* Heading */}

      <h2 className="mt-8 text-4xl font-black tracking-tight text-slate-900">

        Welcome Back

      </h2>

      <p className="mt-3 text-base leading-7 text-slate-500">

        Sign in to continue monitoring your loved ones,
        receive AI-powered health insights and emergency
        notifications.

      </p>

      {/* Form */}

      <div className="mt-10 space-y-6">

        <FloatingInput
          label="Email Address"
          icon={<Mail size={20} />}
          type="email"
          value={formData.email}
          onChange={(value) =>
            updateField("email", value)
          }
        />
            {/* Password */}

        <div className="space-y-5">

          <div className="relative">

            <Lock
              size={20}
              className="
                absolute
                left-5
                top-1/2
                z-10
                -translate-y-1/2
                text-violet-500
              "
            />

            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                updateField("password", e.target.value)
              }
              placeholder="Password"
              className="
                h-16
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-white/70
                pl-14
                pr-14
                text-slate-900
                placeholder:text-slate-400
                outline-none
                transition-all
                duration-300
                focus:border-violet-500
                focus:bg-white
                focus:ring-4
                focus:ring-violet-100
              "
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="
                absolute
                right-5
                top-1/2
                -translate-y-1/2
                rounded-lg
                p-1
                text-slate-400
                transition-all
                duration-300
                hover:bg-violet-50
                hover:text-violet-600
              "
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>

          </div>

        </div>

      </div>

      {/* Options */}

      <div className="mt-8 flex items-center justify-between">

        <label className="flex cursor-pointer items-center gap-3">

          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) =>
              setRememberMe(e.target.checked)
            }
            className="
              h-4
              w-4
              accent-violet-600
            "
          />

          <span className="text-sm text-slate-500">
            Remember Me
          </span>

        </label>

        <button
          type="button"
          className="
            text-sm
            font-semibold
            text-violet-700
            transition-colors
            hover:text-violet-900
          "
        >
          Forgot Password?
        </button>

      </div>

      {/* Divider */}

      <div className="my-10 flex items-center gap-4">

        <div className="h-px flex-1 bg-slate-200" />

        <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
          Secure Login
        </span>

        <div className="h-px flex-1 bg-slate-200" />

      </div>
        {/* Login Button */}

      <button
        type="button"
        onClick={handleLogin}
        disabled={loading}
        className="
          group
          mt-8
          flex
          h-16
          w-full
          items-center
          justify-center
          gap-3
          overflow-hidden
          rounded-2xl
          bg-gradient-to-r
          from-violet-600
          via-fuchsia-500
          to-sky-500
          text-lg
          font-semibold
          text-white
          shadow-[0_20px_45px_rgba(124,58,237,.28)]
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-[0_25px_60px_rgba(124,58,237,.38)]
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-70
        "
      >
        <span className="transition-transform duration-300 group-hover:scale-105">
          {loading ? "Signing In..." : "Sign In"}
        </span>
      </button>

      {/* Register */}

      <div className="mt-8 text-center">

        <p className="text-slate-500">

          Don't have an account?

          <Link
            href="/register"
            className="
              ml-2
              font-semibold
              text-violet-700
              transition-all
              duration-300
              hover:text-violet-900
              hover:underline
            "
          >
            Create Account
          </Link>

        </p>

      </div>

      {/* Footer */}

      <div className="mt-10 border-t border-slate-200 pt-6">

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">

          <div className="h-2 w-2 rounded-full bg-emerald-500" />

          Secure authentication • End-to-end encrypted

        </div>

      </div>

    </div>
  );
}