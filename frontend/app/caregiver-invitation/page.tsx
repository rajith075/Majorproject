"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HeartHandshake, LoaderCircle } from "lucide-react";

import { getInvitationPreview, InvitationPreview } from "@/services/api/patient";

export default function CaregiverInvitationPage() {
  const [token, setToken] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationPreview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setToken(new URLSearchParams(window.location.search).get("token") || "");
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!token) return;
    getInvitationPreview(token).then(setInvitation).catch((requestError: unknown) => {
      setError(getErrorMessage(requestError, "This invitation is unavailable or has expired."));
    });
  }, [token]);

  const loading = token === null || Boolean(token && !invitation && !error);

  return <main className="flex min-h-screen items-center justify-center bg-violet-50 p-5">
    <section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><HeartHandshake className="h-7 w-7" /></div>
      {loading && <div className="mt-6 flex justify-center text-violet-600"><LoaderCircle className="h-6 w-6 animate-spin" /></div>}
      {!loading && (error || !token) && <><h1 className="mt-6 text-2xl font-bold text-slate-900">Invitation unavailable</h1><p className="mt-3 text-slate-600">{error || "This invitation link is incomplete."}</p><Link href="/" className="mt-6 inline-block rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white">Go to ElderCare</Link></>}
      {invitation && <><p className="mt-5 text-sm font-semibold text-violet-700">You&apos;re invited to ElderCare</p><h1 className="mt-2 text-2xl font-bold text-slate-900">Help care for {invitation.patient_name}</h1><p className="mt-3 text-slate-600">{invitation.family_name} invited you to join as {invitation.relationship}.</p>{invitation.message && <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">“{invitation.message}”</p>}<div className="mt-7 grid gap-3 sm:grid-cols-2"><Link href={`/caregiver-login?invitation=${encodeURIComponent(token)}`} className="rounded-xl border border-violet-200 px-4 py-3 font-semibold text-violet-700 hover:bg-violet-50">I have an account</Link><Link href={`/caregiver-register?invitation=${encodeURIComponent(token)}`} className="rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white hover:bg-violet-700">Create caregiver account</Link></div><p className="mt-5 text-xs text-slate-400">This invitation expires {new Date(invitation.expires_at).toLocaleString()}.</p></>}
    </section>
  </main>;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error && "response" in error) {
    const response = error.response;
    if (typeof response === "object" && response && "data" in response) {
      const data = response.data;
      if (typeof data === "object" && data && "detail" in data && typeof data.detail === "string") return data.detail;
    }
  }
  return fallback;
}
