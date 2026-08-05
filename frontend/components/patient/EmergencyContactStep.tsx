"use client";

interface Props {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function EmergencyContactStep({
  data,
  updateData,
  onNext,
  onBack,
}: Props) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-900">
        Emergency Contact
      </h2>

      <p className="mt-2 text-slate-500">
        Who should we contact during an emergency?
      </p>

      <div className="mt-8 grid grid-cols-2 gap-6">

        <input
          value={data.emergency_contact_name}
          onChange={(e) =>
            updateData({
              emergency_contact_name: e.target.value,
            })
          }
          placeholder="Primary Contact Name"
          className="rounded-2xl border border-slate-200 p-4 outline-none focus:border-violet-500"
        />

        <input
          value={data.emergency_contact_phone}
          onChange={(e) =>
            updateData({
              emergency_contact_phone: e.target.value,
            })
          }
          placeholder="Phone Number"
          className="rounded-2xl border border-slate-200 p-4 outline-none focus:border-violet-500"
        />

        <select
          value={data.relationship || ""}
          onChange={(e) =>
            updateData({
              relationship: e.target.value,
            })
          }
          className="rounded-2xl border border-slate-200 p-4 outline-none focus:border-violet-500"
        >
          <option value="">Relationship</option>
          <option>Son</option>
          <option>Daughter</option>
          <option>Spouse</option>
          <option>Brother</option>
          <option>Sister</option>
          <option>Other</option>
        </select>

        <input
          value={data.secondary_contact || ""}
          onChange={(e) =>
            updateData({
              secondary_contact: e.target.value,
            })
          }
          placeholder="Secondary Contact (Optional)"
          className="rounded-2xl border border-slate-200 p-4 outline-none focus:border-violet-500"
        />

      </div>

      <div className="mt-10 flex justify-between">

        <button
          onClick={onBack}
          className="rounded-2xl border border-slate-300 px-8 py-4"
        >
          ← Back
        </button>

        <button
          onClick={onNext}
          className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 font-semibold text-white"
        >
          Continue →
        </button>

      </div>
    </div>
  );
}