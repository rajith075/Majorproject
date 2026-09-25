"use client";

import { FormEvent, useEffect, useState } from "react";
import { Mail, UserPlus, UsersRound, X } from "lucide-react";
import { toast } from "sonner";

import { CareTeam, getMyCareTeam, inviteCaregiver } from "@/services/api/patient";

const initialForm = { invited_email: "", relationship: "Daughter", message: "" };

export default function FamilyCareTeam() {
  const [careTeam, setCareTeam] = useState<CareTeam | null>(null);
  const [form, setForm] = useState(initialForm);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyCareTeam().then(setCareTeam).catch(() => toast.error("Unable to load the care team."));
  }, []);

  const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const invitation = await inviteCaregiver({ ...form, message: form.message.trim() || undefined });
      setCareTeam((current) => current ? { ...current, invitations: [invitation, ...current.invitations] } : current);
      setForm(initialForm);
      setOpen(false);
      toast.success("Invitation email sent", { description: "The caregiver can register or sign in from the secure link." });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to send invitation."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="care-team" className="scroll-mt-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-violet-100 p-3 text-violet-700"><UsersRound className="h-5 w-5" /></div>
            <div><h2 className="text-xl font-bold text-slate-900">Care Team</h2><p className="mt-1 text-sm text-slate-500">People connected to this patient&apos;s care.</p></div>
          </div>
          <button onClick={() => setOpen(true)} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"><UserPlus className="h-4 w-4" /> Invite Caregiver</button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <TeamCard label="Doctor" name={careTeam?.doctor_name || "No doctor added"} detail={careTeam?.hospital || "Add doctor details in the patient profile"} status={careTeam?.doctor_name ? "Connected" : "Not connected"} />
          {careTeam?.caregivers.map((caregiver) => <TeamCard key={caregiver.id} label="Caregiver" name={caregiver.full_name} detail={`${caregiver.relationship} · ${caregiver.email}`} status="Connected" />)}
          {!careTeam?.caregivers.length && <TeamCard label="Caregiver" name="No caregiver connected" detail="Invite a family member or professional caregiver." status="Not connected" />}
          {careTeam?.invitations.map((invitation) => <TeamCard key={`invite-${invitation.id}`} label="Caregiver" name={invitation.invited_email} detail={invitation.relationship} status="Invitation pending" />)}
        </div>
      </div>

      {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="invite-title">
        <form onSubmit={handleInvite} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between"><div><h2 id="invite-title" className="text-xl font-bold text-slate-900">Invite Caregiver</h2><p className="mt-1 text-sm text-slate-500">A secure invitation will be sent by email.</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button></div>
          <label className="mt-5 block text-sm font-semibold text-slate-700">Email Address<input required type="email" value={form.invited_email} onChange={(event) => setForm({ ...form, invited_email: event.target.value })} placeholder="caregiver@example.com" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-violet-500" /></label>
          <label className="mt-4 block text-sm font-semibold text-slate-700">Relationship<select value={form.relationship} onChange={(event) => setForm({ ...form, relationship: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-violet-500"><option>Son</option><option>Daughter</option><option>Spouse</option><option>Relative</option><option>Professional caregiver</option></select></label>
          <label className="mt-4 block text-sm font-semibold text-slate-700">Message <span className="font-normal text-slate-400">(optional)</span><textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Please join ElderCare to help monitor Lakshmi." className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-violet-500" /></label>
          <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"><Mail className="h-4 w-4" />{submitting ? "Sending..." : "Send Invitation"}</button></div>
        </form>
      </div>}
    </section>
  );
}

function TeamCard({ label, name, detail, status }: { label: string; name: string; detail: string; status: string }) {
  const active = status === "Connected";
  return <div className="rounded-2xl border border-slate-200 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 font-bold text-slate-900">{name}</p><p className="mt-1 text-sm text-slate-500">{detail}</p><p className={`mt-3 text-xs font-semibold ${active ? "text-emerald-600" : "text-amber-600"}`}>● {status}</p></div>;
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
