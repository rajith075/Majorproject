"use client";

import SectionTitle from "./ui/SectionTitle";
import SingleSelectGrid from "./ui/SingleSelectGrid";
import WizardFooter from "./ui/WizardFooter";
import FormInput from "./ui/FormInput";

import {
  MOBILITY_OPTIONS,
  MEMORY_OPTIONS,
} from "@/constants/patient/lifestyle";

interface Props {
  data: any;
  updateData: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function LifestyleStep({
  data,
  updateData,
  onBack,
  onNext,
}: Props) {
  return (
    <div>

      <SectionTitle
        title="Lifestyle & Daily Living"
        subtitle="Help us understand the patient's daily routine and mobility."
      />

      <SingleSelectGrid
        title="Mobility"
        subtitle="Current mobility level"
        items={MOBILITY_OPTIONS}
        value={data.mobility}
        onChange={(value) =>
          updateData({
            mobility: value,
          })
        }
      />

      <div className="mt-16">

        <SingleSelectGrid
          title="Memory Status"
          subtitle="Current cognitive condition"
          items={MEMORY_OPTIONS}
          value={data.memory_status}
          onChange={(value) =>
            updateData({
              memory_status: value,
            })
          }
        />

      </div>

      <div className="mt-16">

        <FormInput
          label="Additional Notes"
          value={data.notes}
          placeholder="Additional observations..."
          onChange={(value) =>
            updateData({
              notes: value,
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