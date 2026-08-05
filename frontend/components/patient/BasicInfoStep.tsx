"use client";

import FormInput from "./ui/FormInput";
import FormSelect from "./ui/FormSelect";
import SectionTitle from "./ui/SectionTitle";
import WizardFooter from "./ui/WizardFooter";

interface Props {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export default function BasicInfoStep({
  data,
  updateData,
  onNext,
}: Props) {
  return (
    <div>

      <SectionTitle
        title="Basic Information"
        subtitle="Tell us about your loved one before we begin AI health monitoring."
      />

      <div className="grid grid-cols-2 gap-8">

        <FormInput
          label="Full Name"
          value={data.full_name}
          placeholder="Enter full name"
          onChange={(v) =>
            updateData({
              full_name: v,
            })
          }
        />

        <FormInput
          label="Age"
          value={data.age}
          type="number"
          placeholder="Age"
          onChange={(v) =>
            updateData({
              age: Number(v),
            })
          }
        />

        <FormSelect
          label="Gender"
          value={data.gender}
          options={[
            "Male",
            "Female",
            "Other",
          ]}
          onChange={(v) =>
            updateData({
              gender: v,
            })
          }
        />

        <FormSelect
          label="Blood Group"
          value={data.blood_group}
          options={[
            "A+",
            "A-",
            "B+",
            "B-",
            "AB+",
            "AB-",
            "O+",
            "O-",
          ]}
          onChange={(v) =>
            updateData({
              blood_group: v,
            })
          }
        />

        <FormInput
          label="Phone Number"
          value={data.phone}
          placeholder="Phone Number"
          onChange={(v) =>
            updateData({
              phone: v,
            })
          }
        />

        <div></div>

      </div>

      {/* Address */}

      <div className="mt-8">

        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Address
        </label>

        <textarea
          rows={4}
          value={data.address}
          onChange={(e) =>
            updateData({
              address: e.target.value,
            })
          }
          placeholder="Enter complete address..."
          className="
            w-full
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            text-slate-900
            placeholder:text-slate-400
            shadow-sm
            outline-none
            transition-all
            focus:border-violet-500
            focus:ring-4
            focus:ring-violet-100
          "
        />

      </div>

      <WizardFooter
        onNext={onNext}
      />

    </div>
  );
}