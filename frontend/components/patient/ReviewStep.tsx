"use client";

import {
  User,
  HeartPulse,
  Pill,
  Phone,
  Hospital,
  Brain,
  CheckCircle2,
} from "lucide-react";

interface Props {
  data: any;
  onBack: () => void;
  onSubmit: () => void;
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-white p-8 shadow-lg">

      <div className="mb-6 flex items-center gap-4">

        <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
          {icon}
        </div>

        <h2 className="text-2xl font-bold text-slate-900">
          {title}
        </h2>

      </div>

      {children}

    </div>
  );
}

function Item({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-3">

      <span className="font-medium text-slate-500">
        {label}
      </span>

      <span className="font-semibold text-slate-900">
        {value || "-"}
      </span>

    </div>
  );
}

function Chip({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700">
      {text}
    </span>
  );
}

export default function ReviewStep({
  data,
  onBack,
  onSubmit,
}: Props) {
  return (
    <div>

      <div className="mb-12">

        <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-green-700">

          <CheckCircle2 size={18} />

          Ready for Registration

        </div>

        <h1 className="mt-6 text-5xl font-bold text-slate-900">
          Review Patient Information
        </h1>

        <p className="mt-4 text-lg text-slate-500">
          Verify the details before creating the patient profile.
        </p>

      </div>

      <div className="space-y-8">

        <Section
          icon={<User size={24} />}
          title="Basic Information"
        >

          <Item label="Full Name" value={data.full_name} />
          <Item label="Age" value={data.age} />
          <Item label="Gender" value={data.gender} />
          <Item label="Blood Group" value={data.blood_group} />
          <Item label="Phone" value={data.phone} />
          <Item label="Address" value={data.address} />

        </Section>

        <Section
          icon={<HeartPulse size={24} />}
          title="Medical Information"
        >

          <div className="mb-5">

            <h3 className="mb-3 font-semibold">
              Conditions
            </h3>

            <div className="flex flex-wrap gap-3">

              {data.medical_conditions.map((item: string) => (
                <Chip key={item} text={item} />
              ))}

            </div>

          </div>

          <div>

            <h3 className="mb-3 font-semibold">
              Allergies
            </h3>

            <div className="flex flex-wrap gap-3">

              {data.allergies.map((item: string) => (
                <Chip key={item} text={item} />
              ))}

            </div>

          </div>

        </Section>

        <Section
          icon={<Pill size={24} />}
          title="Medications"
        >

          <div className="flex flex-wrap gap-3">

            {data.medications.map((item: string) => (
              <Chip key={item} text={item} />
            ))}

          </div>

        </Section>

        <Section
          icon={<Phone size={24} />}
          title="Emergency Contact"
        >

          <Item
            label="Name"
            value={data.emergency_contact_name}
          />

          <Item
            label="Relationship"
            value={data.relationship}
          />

          <Item
            label="Phone"
            value={data.emergency_contact_phone}
          />

          <Item
            label="Secondary"
            value={data.secondary_contact}
          />

        </Section>

        <Section
          icon={<Hospital size={24} />}
          title="Care Team"
        >

          <Item
            label="Doctor"
            value={data.assigned_doctor}
          />

          <Item
            label="Hospital"
            value={data.hospital}
          />

          <Item
            label="Caregiver"
            value={data.assigned_caregiver}
          />

          <Item
            label="Doctor Phone"
            value={data.doctor_phone}
          />

        </Section>

        <Section
          icon={<Brain size={24} />}
          title="Lifestyle"
        >

          <Item
            label="Mobility"
            value={data.mobility}
          />

          <Item
            label="Memory"
            value={data.memory_status}
          />

          <Item
            label="Notes"
            value={data.notes}
          />

        </Section>

      </div>

      <div className="mt-12 flex justify-between">

        <button
          onClick={onBack}
          className="rounded-2xl border border-slate-300 px-8 py-4 font-semibold"
        >
          Back
        </button>

        <button
          onClick={onSubmit}
          className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-10 py-4 font-semibold text-white shadow-xl transition hover:scale-105"
        >
          Register Patient
        </button>

      </div>

    </div>
  );
}