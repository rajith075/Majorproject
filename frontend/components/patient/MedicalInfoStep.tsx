"use client";

import MultiSelectGrid from "./ui/MultiSelectGrid";
import WizardFooter from "./ui/WizardFooter";

import {
  MEDICAL_CONDITIONS,
  ALLERGIES,
} from "@/constants/patient/medical";

import {
  Shield,
} from "lucide-react";

interface Props {
  data: any;
  updateData: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function MedicalInfoStep({
  data,
  updateData,
  onBack,
  onNext,
}: Props) {

  const allergyItems = ALLERGIES.map((item) => ({
    name: item,
    icon: Shield,
  }));

  return (
    <div>

      <MultiSelectGrid
        title="Medical Conditions"
        subtitle="Select all diagnosed medical conditions."
        items={MEDICAL_CONDITIONS}
        selected={data.medical_conditions}
        onChange={(items) =>
          updateData({
            medical_conditions: items,
          })
        }
      />

      <div className="mt-14">

        <MultiSelectGrid
          title="Allergies"
          subtitle="Select known allergies."
          items={allergyItems}
          selected={data.allergies}
          onChange={(items) =>
            updateData({
              allergies: items,
            })
          }
        />

      </div>

      <WizardFooter
        onBack={onBack}
        onNext={onNext}
      />

    </div>
  );
}