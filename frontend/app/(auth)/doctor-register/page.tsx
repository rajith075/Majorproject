"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  registerDoctor,
  uploadDoctorDocuments,
} from "@/services/api/doctor";

export default function DoctorRegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [medicalCertificate, setMedicalCertificate] =
    useState<File | null>(null);

  const [clinicLicense, setClinicLicense] =
    useState<File | null>(null);

  const [doctorId, setDoctorId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [submitted, setSubmitted] = useState(false);

  // ==================================================
  // STEP 1 → VALIDATE DOCTOR DETAILS
  // ==================================================

  const handleDetailsSubmit = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStep(2);
  };

  // ==================================================
  // STEP 2 → REGISTER + UPLOAD DOCUMENTS
  // ==================================================

  const handleDocumentSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!medicalCertificate) {
      setError(
        "Please upload your medical certificate."
      );
      return;
    }

    if (!clinicLicense) {
      setError(
        "Please upload your clinic licence."
      );
      return;
    }

    setLoading(true);

    try {
      // ==================================================
      // 1. CREATE DOCTOR ACCOUNT
      // ==================================================

      const registration =
        await registerDoctor({
          full_name: fullName,
          email,
          phone,
          password,
        });

      console.log(
        "✅ DOCTOR REGISTERED:",
        registration
      );

      setDoctorId(registration.doctor_id);

      // ==================================================
      // 2. UPLOAD PROFESSIONAL DOCUMENTS
      // ==================================================

      const uploadResult =
        await uploadDoctorDocuments(
          registration.doctor_id,
          medicalCertificate,
          clinicLicense
        );

      console.log(
        "✅ DOCTOR DOCUMENTS UPLOADED:",
        uploadResult
      );

      // ==================================================
      // 3. SHOW PENDING SCREEN
      // ==================================================

      setSubmitted(true);

    } catch (err: any) {
      console.error(
        "❌ DOCTOR REGISTRATION FAILED:",
        err
      );

      if (err?.response?.status === 400) {
        setError(
          err?.response?.data?.detail ||
            "Unable to complete registration."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // PENDING VERIFICATION SCREEN
  // ==================================================

  if (submitted) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#F8F5FF]">

        {/* BACKGROUND */}

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

        {/* HEADER */}

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

        </div>

        {/* SUCCESS CARD */}

        <section className="relative z-10 flex min-h-[calc(100vh-100px)] items-center justify-center px-6 pb-12">

          <div className="w-full max-w-xl rounded-[32px] border border-white/70 bg-white/80 p-8 text-center shadow-2xl shadow-violet-900/10 backdrop-blur-2xl sm:p-12">

            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-4xl">
              ✓
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
              Registration Submitted
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Your profile is under verification
            </h2>

            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-500">
              Your professional documents have been
              submitted successfully for verification.
              You will be able to access the Doctor Portal
              once your profile has been approved.
            </p>

            <div className="mt-8 rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 text-left">

              <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                Verification Status
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />

                <span className="text-sm font-semibold text-slate-700">
                  Pending Approval
                </span>
              </div>

            </div>

            {doctorId && (
              <p className="mt-5 text-xs text-slate-400">
                Registration ID: #{doctorId}
              </p>
            )}

            <Link
              href="/doctor-login"
              className="
                mt-8
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
              "
            >
              Go to Doctor Login →
            </Link>

            <Link
              href="/"
              className="mt-5 block text-sm font-medium text-slate-500 transition hover:text-violet-600"
            >
              ← Back to Home
            </Link>

          </div>

        </section>

      </main>
    );
  }

  // ==================================================
  // MAIN REGISTRATION PAGE
  // ==================================================

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
          href="/"
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
          ← Home
        </Link>

      </div>

      {/* ==================================================
          REGISTRATION CARD
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
                Doctor Registration
              </p>

              <h2 className="max-w-md text-4xl font-bold leading-tight">
                Join the care network.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-violet-100">
                Create your professional account and
                submit your credentials for verification.
                Once approved, you can securely access
                your patients and manage their care.
              </p>

            </div>

            <div className="relative space-y-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  1
                </div>

                <span className="text-sm text-violet-100">
                  Create your doctor account
                </span>

              </div>

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  2
                </div>

                <span className="text-sm text-violet-100">
                  Submit professional documents
                </span>

              </div>

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  3
                </div>

                <span className="text-sm text-violet-100">
                  Get verified and access the portal
                </span>

              </div>

            </div>

          </div>

          {/* ==================================================
              RIGHT SIDE
          ================================================== */}

          <div className="p-8 sm:p-12">

            <div className="mx-auto max-w-md">

              {/* STEP INDICATOR */}

              <div className="mb-8 flex items-center gap-3">

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${
                    step >= 1
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  1
                </div>

                <div
                  className={`h-1 flex-1 rounded-full ${
                    step >= 2
                      ? "bg-violet-500"
                      : "bg-slate-100"
                  }`}
                />

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${
                    step >= 2
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  2
                </div>

              </div>

              {/* ==================================================
                  STEP 1
              ================================================== */}

              {step === 1 && (
                <>
                  <div className="mb-8">

                    <p className="mb-2 text-sm font-semibold text-violet-600">
                      Step 1 of 2
                    </p>

                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                      Create your account
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Enter your basic professional details
                      to get started.
                    </p>

                  </div>

                  {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <form
                    onSubmit={handleDetailsSubmit}
                    className="space-y-5"
                  >

                    {/* NAME */}

                    <div>
                      <label
                        htmlFor="fullName"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Full Name
                      </label>

                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) =>
                          setFullName(e.target.value)
                        }
                        placeholder="Dr. John Doe"
                        required
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

                    {/* EMAIL */}

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Email Address
                      </label>

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        placeholder="doctor@example.com"
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

                    {/* PHONE */}

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Phone Number
                      </label>

                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value)
                        }
                        placeholder="9876543210"
                        required
                        autoComplete="tel"
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
                        placeholder="Minimum 6 characters"
                        required
                        autoComplete="new-password"
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

                    {/* CONFIRM PASSWORD */}

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Confirm Password
                      </label>

                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                        placeholder="Re-enter your password"
                        required
                        autoComplete="new-password"
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

                    <button
                      type="submit"
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
                      "
                    >
                      Continue to Verification →
                    </button>

                  </form>
                </>
              )}

              {/* ==================================================
                  STEP 2
              ================================================== */}

              {step === 2 && (
                <>
                  <div className="mb-8">

                    <p className="mb-2 text-sm font-semibold text-violet-600">
                      Step 2 of 2
                    </p>

                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                      Professional verification
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Upload your professional documents
                      for verification by Elderly Care AI.
                    </p>

                  </div>

                  {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <form
                    onSubmit={handleDocumentSubmit}
                    className="space-y-6"
                  >

                    {/* MEDICAL CERTIFICATE */}

                    <div>

                      <label
                        htmlFor="medicalCertificate"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Medical Certificate
                      </label>

                      <label
                        htmlFor="medicalCertificate"
                        className="
                          flex
                          cursor-pointer
                          flex-col
                          items-center
                          justify-center
                          rounded-2xl
                          border-2
                          border-dashed
                          border-slate-200
                          bg-slate-50
                          px-5
                          py-7
                          text-center
                          transition
                          hover:border-violet-400
                          hover:bg-violet-50
                        "
                      >

                        <span className="mb-3 text-3xl">
                          📄
                        </span>

                        <span className="text-sm font-semibold text-slate-700">
                          {medicalCertificate
                            ? medicalCertificate.name
                            : "Upload medical certificate"}
                        </span>

                        <span className="mt-1 text-xs text-slate-400">
                          PDF, JPG, JPEG or PNG
                        </span>

                        <input
                          id="medicalCertificate"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) =>
                            setMedicalCertificate(
                              e.target.files?.[0] || null
                            )
                          }
                        />

                      </label>

                    </div>

                    {/* CLINIC LICENSE */}

                    <div>

                      <label
                        htmlFor="clinicLicense"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Clinic Licence
                      </label>

                      <label
                        htmlFor="clinicLicense"
                        className="
                          flex
                          cursor-pointer
                          flex-col
                          items-center
                          justify-center
                          rounded-2xl
                          border-2
                          border-dashed
                          border-slate-200
                          bg-slate-50
                          px-5
                          py-7
                          text-center
                          transition
                          hover:border-violet-400
                          hover:bg-violet-50
                        "
                      >

                        <span className="mb-3 text-3xl">
                          🏥
                        </span>

                        <span className="text-sm font-semibold text-slate-700">
                          {clinicLicense
                            ? clinicLicense.name
                            : "Upload clinic licence"}
                        </span>

                        <span className="mt-1 text-xs text-slate-400">
                          PDF, JPG, JPEG or PNG
                        </span>

                        <input
                          id="clinicLicense"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) =>
                            setClinicLicense(
                              e.target.files?.[0] || null
                            )
                          }
                        />

                      </label>

                    </div>

                    {/* SUBMIT */}

                    <button
                      type="submit"
                      disabled={loading}
                      className="
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

                          Submitting documents...

                        </span>
                      ) : (
                        "Submit for Verification →"
                      )}

                    </button>

                  </form>

                  {/* BACK */}

                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep(1);
                    }}
                    disabled={loading}
                    className="mt-5 w-full text-sm font-medium text-slate-500 transition hover:text-violet-600 disabled:opacity-50"
                  >
                    ← Back to account details
                  </button>

                </>
              )}

              {/* ==================================================
                  LOGIN LINK
              ================================================== */}

              <p className="mt-8 text-center text-sm text-slate-500">

                Already have a doctor account?{" "}

                <Link
                  href="/doctor-login"
                  className="font-semibold text-violet-600 hover:text-violet-700"
                >
                  Sign in
                </Link>

              </p>

              {/* SECURITY NOTE */}

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">

                <div className="mt-0.5 text-sm">
                  🔒
                </div>

                <p className="text-xs leading-5 text-slate-500">
                  Your professional documents are submitted
                  securely and your Doctor Portal remains
                  inaccessible until your profile is approved.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}