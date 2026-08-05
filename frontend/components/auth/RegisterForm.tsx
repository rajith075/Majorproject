"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  Sparkles,
} from "lucide-react";

import { toast } from "sonner";

import { register } from "@/services/api/auth";

import FloatingInput from "@/components/auth/form/FloatingInput";
import PasswordStrength from "@/components/auth/form/PasswordStrength";
import PasswordRules from "@/components/auth/form/PasswordRules";

export default function RegisterForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [acceptTerms, setAcceptTerms] =
    useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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

  const handleRegister = async () => {
    if (
      !formData.full_name ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      toast.warning("Please fill all required fields.");
      return;
    }

    if (!acceptTerms) {
      toast.warning("Please accept Terms & Privacy Policy.");
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await register({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      toast.success("Account created successfully!");

      router.push("/login");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ??
          "Registration failed."
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
          Family Registration
        </span>

      </div>

      {/* Heading */}

      <h2 className="mt-8 text-4xl font-black tracking-tight text-slate-900">

        Create Your Account

      </h2>

      <p className="mt-3 text-base leading-7 text-slate-500">

        Join thousands of families using AI-powered healthcare
        to remotely monitor elderly loved ones.

      </p>

      {/* Form */}

      <div className="mt-10 space-y-6">

        <FloatingInput
          label="Full Name"
          icon={<User size={20} />}
          value={formData.full_name}
          onChange={(value) =>
            updateField("full_name", value)
          }
        />

        <FloatingInput
          label="Email Address"
          icon={<Mail size={20} />}
          type="email"
          value={formData.email}
          onChange={(value) =>
            updateField("email", value)
          }
        />

        <FloatingInput
          label="Phone Number"
          icon={<Phone size={20} />}
          value={formData.phone}
          onChange={(value) =>
            updateField("phone", value)
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
              placeholder="Create Password"
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

          <PasswordStrength
            password={formData.password}
          />

          <PasswordRules
            password={formData.password}
          />

        </div>

        {/* Confirm Password */}

        <FloatingInput
          label="Confirm Password"
          icon={<Lock size={20} />}
          type={showPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={(value) =>
            updateField(
              "confirmPassword",
              value
            )
          }
        />

      </div>

      {/* Divider */}

      <div className="my-10 flex items-center gap-4">

        <div className="h-px flex-1 bg-slate-200" />

        <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
          Security
        </span>

        <div className="h-px flex-1 bg-slate-200" />

      </div>

      {/* Terms */}

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-100 p-4 transition-all duration-300 hover:border-violet-200 hover:bg-violet-50/50">

        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) =>
            setAcceptTerms(e.target.checked)
          }
          className="
            mt-1
            h-5
            w-5
            accent-violet-600
          "
        />

        <span className="text-sm leading-6 text-slate-500">

          I agree to the{" "}

          <span className="font-semibold text-violet-700">
            Terms of Service
          </span>

          {" "}and{" "}

          <span className="font-semibold text-violet-700">
            Privacy Policy
          </span>

        </span>

      </label>
          {/* Register Button */}

      <button
        type="button"
        onClick={handleRegister}
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
          hover:shadow-[0_25px_60px_rgba(124,58,237,.35)]
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-70
        "
      >
        <span className="transition-transform duration-300 group-hover:scale-105">
          {loading ? "Creating Account..." : "Create Account"}
        </span>
      </button>

      {/* Login */}

      <div className="mt-8 text-center">

        <p className="text-slate-500">

          Already have an account?

          <Link
            href="/login"
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
            Sign In
          </Link>

        </p>

      </div>

      {/* Footer */}

      <div className="mt-10 border-t border-slate-200 pt-6">

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">

          <div className="h-2 w-2 rounded-full bg-emerald-500" />

          Protected with enterprise-grade security

        </div>

      </div>

    </div>
  );
}