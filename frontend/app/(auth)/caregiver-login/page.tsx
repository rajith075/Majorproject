"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { loginUser } from "@/services/auth/login";
import { AuthService } from "@/services/auth.service";
import { acceptCaregiverInvitation } from "@/services/api/patient";

export default function CaregiverLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // ==================================================
      // 1. LOGIN
      // ==================================================

      const response = await loginUser(
  email,
  password
);
      // ==================================================
      // 2. SAVE JWT
      // ==================================================

      localStorage.setItem(
        "token",
        response.access_token
      );

      console.log("✅ CAREGIVER LOGIN SUCCESS");

      // ==================================================
      // 3. LOAD CURRENT USER
      // ==================================================

      const user =
        await AuthService.loadCurrentUser();

      console.log(
        "👤 CAREGIVER USER:",
        user
      );

      // ==================================================
      // 4. VERIFY ROLE
      // ==================================================

      if (!user) {
        throw new Error(
          "Unable to load caregiver account."
        );
      }

      if (user.role !== "caregiver") {
        localStorage.removeItem("token");

        throw new Error(
          "This account is not registered as a caregiver."
        );
      }

      const invitationToken = new URLSearchParams(window.location.search).get("invitation");
      if (invitationToken) {
        await acceptCaregiverInvitation(invitationToken);
      }

      // ==================================================
      // 5. GO TO EXISTING DASHBOARD
      // ==================================================

      router.replace("/dashboard");

    } catch (err: unknown) {
      // Do not leave an authenticated session behind if accepting the
      // invitation failed (for example, when a different email signed in).
      AuthService.removeToken();
      console.error(
        "❌ CAREGIVER LOGIN FAILED:",
        err
      );

      if (
        getStatusCode(err) === 401
      ) {
        setError(
          "Invalid caregiver email or password."
        );
      } else {
        setError(
          getErrorMessage(err, "Unable to sign in. Please try again.")
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F8F5FF]">

      {/* ==================================================
          BACKGROUND
      ================================================== */}

      <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-violet-400/20 blur-[150px]" />

      <div className="absolute -right-40 top-10 h-[500px] w-[500px] rounded-full bg-fuchsia-400/20 blur-[160px]" />

      <div className="absolute bottom-[-250px] left-1/3 h-[600px] w-[600px] rounded-full bg-purple-300/20 blur-[180px]" />

      <div
        className="
          absolute
          inset-0
          opacity-[0.035]
          [background-image:radial-gradient(#7C3AED_1px,transparent_1px)]
          [background-size:30px_30px]
        "
      />

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="relative z-10 flex items-center justify-between px-8 py-7">

        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/20">
            <span className="text-xl font-bold text-white">
              E
            </span>
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Elderly Care AI
            </h1>

            <p className="text-xs text-slate-500">
              Intelligent Elderly Healthcare
            </p>
          </div>
        </Link>

        <Link
          href="/role-selection"
          className="
            rounded-xl
            border
            border-slate-200
            bg-white/70
            px-4
            py-2
            text-sm
            font-medium
            text-slate-600
            backdrop-blur
            transition
            hover:bg-white
            hover:text-violet-700
          "
        >
          ← Change role
        </Link>

      </div>

      {/* ==================================================
          LOGIN CARD
      ================================================== */}

      <section className="relative z-10 flex min-h-[calc(100vh-100px)] items-center justify-center px-6 pb-12">

        <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/75 shadow-2xl shadow-violet-900/10 backdrop-blur-2xl md:grid-cols-2">

          {/* ==================================================
              LEFT SIDE
          ================================================== */}

          <div className="relative hidden overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-600 p-12 text-white md:flex md:flex-col md:justify-between">

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-fuchsia-300/10 blur-3xl" />

            <div className="relative">

              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur">
                🩺
              </div>

              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-violet-200">
                Caregiver Portal
              </p>

              <h2 className="max-w-md text-4xl font-bold leading-tight">
                Care for every moment that matters.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-violet-100">
                Access the elderly patient&apos;s health information,
                vital signs, medication details, alerts and
                AI-powered health insights from one secure dashboard.
              </p>

            </div>

            <div className="relative space-y-4">

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  ✓
                </div>

                <span className="text-sm text-violet-100">
                  Assigned patient information
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  ✓
                </div>

                <span className="text-sm text-violet-100">
                  Real-time health monitoring
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  ✓
                </div>

                <span className="text-sm text-violet-100">
                  AI-powered risk assessment
                </span>
              </div>

            </div>

          </div>

          {/* ==================================================
              RIGHT SIDE
          ================================================== */}

          <div className="p-8 sm:p-12">

            <div className="mx-auto max-w-md">

              {/* Mobile icon */}

              <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl md:hidden">
                🩺
              </div>

              <div className="mb-8">

                <p className="mb-2 text-sm font-semibold text-violet-600">
                  Caregiver access
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in with the caregiver credentials provided
                  by Elderly Care AI.
                </p>

              </div>

              {/* ==================================================
                  ERROR
              ================================================== */}

              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* ==================================================
                  FORM
              ================================================== */}

              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Caregiver Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="caregiver@example.com"
                    required
                    autoComplete="email"
                    className="
                      h-13
                      w-full
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />
                </div>

                {/* PASSWORD */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="
                      h-13
                      w-full
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />
                </div>

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    mt-3
                    flex
                    h-13
                    w-full
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gradient-to-r
                    from-violet-600
                    to-fuchsia-600
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-violet-500/20
                    transition
                    hover:scale-[1.01]
                    hover:shadow-xl
                    hover:shadow-violet-500/25
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In to Caregiver Portal →"
                  )}
                </button>

              </form>

              {/* ==================================================
                  SECURITY NOTE
              ================================================== */}

              <div className="mt-8 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">

                <div className="mt-0.5 text-sm">
                  🔒
                </div>

                <p className="text-xs leading-5 text-slate-500">
                  Your caregiver account is securely authenticated.
                  Patient information is displayed only after your
                  assigned caregiver identity is verified.
                </p>

              </div>

              <p className="mt-6 text-center text-xs text-slate-400">
                New to ElderCare? Open the invitation email to create your caregiver account.
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

function getStatusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || !error || !("response" in error)) {
    return undefined;
  }

  const response = error.response;
  if (typeof response !== "object" || !response || !("status" in response)) {
    return undefined;
  }

  return typeof response.status === "number" ? response.status : undefined;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || !error) {
    return fallback;
  }

  if ("response" in error) {
    const response = error.response;
    if (typeof response === "object" && response && "data" in response) {
      const data = response.data;
      if (typeof data === "object" && data && "detail" in data && typeof data.detail === "string") {
        return data.detail;
      }
    }
  }

  return "message" in error && typeof error.message === "string"
    ? error.message
    : fallback;
}
