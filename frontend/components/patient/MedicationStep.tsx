"use client";

import MedicationCategory from "./ui/MedicationCategory";
import Chip from "./ui/Chip";
import WizardFooter from "./ui/WizardFooter";

import { MEDICATION_GROUPS } from "@/constants/patient/medical";

interface Props {
  data: any;
  updateData: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function MedicationStep({
  data,
  updateData,
  onBack,
  onNext,
}: Props) {

  return (
    <div>

      <div className="mb-12">

        <h2 className="text-4xl font-bold text-slate-900">
          Current Medications
        </h2>

        <p className="mt-3 text-lg text-slate-500">
          Select all medicines the patient currently takes.
        </p>

      </div>

      {data.medications.length > 0 && (

        <div className="mb-10 flex flex-wrap gap-3">

          {data.medications.map((medicine: string) => (

            <Chip
              key={medicine}
              label={medicine}
            />

          ))}

        </div>

      )}

      <div className="space-y-14">

        {MEDICATION_GROUPS.map((group) => (

          <MedicationCategory
            key={group.title}
            title={group.title}
            icon={group.icon}
            medicines={group.medicines}
            selected={data.medications}
            onChange={(items) =>
              updateData({
                medications: items,
              })
            }
          />

        ))}

      </div>

      {/* Additional Medication */}

      <div className="mt-14">

        <label className="mb-3 block text-sm font-semibold text-slate-700">
          Other Medication (Optional)
        </label>

        <textarea
          rows={3}
          placeholder="Enter medicines not listed above..."
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
        onBack={onBack}
        onNext={onNext}
      />

    </div>
  );
}