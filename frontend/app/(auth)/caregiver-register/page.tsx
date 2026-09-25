"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleCheck,
  HeartHandshake,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import { registerCaregiverFromInvitation } from "@/services/api/auth";
import {
  getInvitationPreview,
  InvitationPreview,
} from "@/services/api/patient";

type RegistrationForm = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const initialForm: RegistrationForm = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function CaregiverRegisterPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationPreview | null>(null);
  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setToken(new URLSearchParams(window.location.search).get("invitation") || "");
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!token) return;

    getInvitationPreview(token)
      .then((preview) => {
        setInvitation(preview);
        setForm((current) => ({
          ...current,
          email: preview.invited_email,
        }));
      })
      .catch((requestError: unknown) => {
        setError(
          getErrorMessage(
            requestError,
            "This invitation is unavailable or has expired."
          )
        );
      })
  }, [token]);

  const loadingInvitation = token === null || Boolean(token && !invitation && !error);
  const displayError = token === "" ? "This invitation link is incomplete." : error;
  const invitationToken = token ?? "";

  const updateField = <Field extends keyof RegistrationForm>(
    field: Field,
    value: RegistrationForm[Field]
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !invitation) {
      setError("This invitation is unavailable or has expired.");
      return;
    }

    if (form.password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await registerCaregiverFromInvitation({
        full_name: form.full_name.trim(),
        email: form.email,
        phone: form.phone.trim(),
        password: form.password,
        invitation_token: token,
      });
      router.replace("/dashboard");
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(requestError, "Unable to create the caregiver account.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F8F5FF]">
      <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-violet-400/20 blur-[150px]" />
      <div className="absolute -right-40 top-10 h-[500px] w-[500px] rounded-full bg-fuchsia-400/20 blur-[160px]" />
      <div className="absolute bottom-[-250px] left-1/3 h-[600px] w-[600px] rounded-full bg-purple-300/20 blur-[180px]" />
      <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(#7C3AED_1px,transparent_1px)] [background-size:30px_30px]" />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-8 sm:py-7">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/20">
            <HeartHandshake className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Elderly Care AI
            </h1>
            <p className="text-xs text-slate-500">Intelligent Elderly Healthcare</p>
          </div>
        </Link>

        <Link
          href={token ? `/caregiver-invitation?token=${encodeURIComponent(token)}` : "/"}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 backdrop-blur transition hover:bg-white hover:text-violet-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Invitation
        </Link>
      </header>

      <section className="relative z-10 flex min-h-[calc(100vh-92px)] items-center justify-center px-5 pb-10 sm:px-6 sm:pb-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/75 shadow-2xl shadow-violet-900/10 backdrop-blur-2xl md:grid-cols-2">
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-600 p-12 text-white md:flex md:flex-col md:justify-between">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-fuchsia-300/10 blur-3xl" />

            <div className="relative">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <HeartHandshake className="h-8 w-8" />
              </div>
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-violet-200">
                Caregiver invitation
              </p>
              <h2 className="max-w-md text-4xl font-bold leading-tight">
                You&apos;re joining a care team.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-violet-100">
                Create your own secure account to monitor the patient&apos;s health,
                medication schedule, and important alerts.
              </p>
            </div>

            <div className="relative space-y-4 text-sm text-violet-100">
              <Feature text="Your password stays private" />
              <Feature text="Your email is verified by this invitation" />
              <Feature text="Patient access is linked automatically" />
            </div>
          </aside>

          <div className="p-7 sm:p-10 md:p-12">
            {loadingInvitation ? (
              <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-violet-600" />
                <p className="mt-4 text-sm text-slate-500">Verifying your invitation…</p>
              </div>
            ) : displayError && !invitation ? (
              <div className="flex min-h-[430px] flex-col justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <HeartHandshake className="h-7 w-7" />
                </div>
                <p className="mt-6 text-sm font-semibold text-red-600">Invitation unavailable</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  We couldn&apos;t verify this link.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">{displayError}</p>
              </div>
            ) : (
              <div className="mx-auto max-w-md">
                <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 md:hidden">
                  <HeartHandshake className="h-7 w-7" />
                </div>
                <p className="mb-2 text-sm font-semibold text-violet-600">Create caregiver account</p>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Welcome to the care team
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  You&apos;re joining {invitation?.patient_name}&apos;s care team as a {invitation?.relationship}.
                </p>

                {error && (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={submit} className="mt-7 space-y-4">
                  <InputField
                    label="Your name"
                    icon={<UserRound className="h-5 w-5" />}
                    value={form.full_name}
                    onChange={(value) => updateField("full_name", value)}
                    autoComplete="name"
                  />
                  <InputField
                    label="Invitation email"
                    icon={<Mail className="h-5 w-5" />}
                    type="email"
                    value={form.email}
                    disabled
                    hint="This verified email is tied to your invitation."
                    autoComplete="email"
                  />
                  <InputField
                    label="Phone number"
                    icon={<Phone className="h-5 w-5" />}
                    type="tel"
                    value={form.phone}
                    onChange={(value) => updateField("phone", value)}
                    autoComplete="tel"
                  />
                  <InputField
                    label="Create password"
                    icon={<LockKeyhole className="h-5 w-5" />}
                    type="password"
                    value={form.password}
                    onChange={(value) => updateField("password", value)}
                    hint="Use at least 8 characters."
                    autoComplete="new-password"
                  />
                  <InputField
                    label="Confirm password"
                    icon={<LockKeyhole className="h-5 w-5" />}
                    type="password"
                    value={form.confirmPassword}
                    onChange={(value) => updateField("confirmPassword", value)}
                    autoComplete="new-password"
                  />

                  <button
                    type="submit"
                    disabled={submitting || !invitation}
                    className="mt-3 flex h-13 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] hover:shadow-xl hover:shadow-violet-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-3">
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                        Creating secure account…
                      </span>
                    ) : (
                      "Create account & join care team"
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                  Already have a caregiver account?{" "}
                  <Link
                    href={`/caregiver-login?invitation=${encodeURIComponent(invitationToken)}`}
                    className="font-semibold text-violet-700 transition hover:text-violet-900 hover:underline"
                  >
                    Sign in and accept invitation
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
        <CircleCheck className="h-5 w-5" />
      </div>
      <span>{text}</span>
    </div>
  );
}

function InputField({
  label,
  icon,
  value,
  onChange,
  hint,
  type = "text",
  disabled = false,
  autoComplete,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange?: (value: string) => void;
  hint?: string;
  type?: string;
  disabled?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-500">
          {icon}
        </span>
        <input
          required
          type={type}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          className="h-13 w-full rounded-2xl border border-slate-200 bg-white px-4 pl-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        />
      </span>
      {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "response" in error) {
    const response = error.response;
    if (typeof response === "object" && response && "data" in response) {
      const data = response.data;
      if (typeof data === "object" && data && "detail" in data && typeof data.detail === "string") {
        return data.detail;
      }
    }
  }
  return fallback;
}
