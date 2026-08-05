"use client";

import FormInput from "./ui/FormInput";
import SectionTitle from "./ui/SectionTitle";
import WizardFooter from "./ui/WizardFooter";

interface Props {
  data: any;
  updateData: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function CareTeamStep({
  data,
  updateData,
  onBack,
  onNext,
}: Props) {
  return (
    <div>

      <SectionTitle
        title="Care Team"
        subtitle="Assign the healthcare professionals responsible for the patient's care."
      />

      <div className="grid grid-cols-2 gap-8">

        <FormInput
          label="Doctor Name"
          value={data.assigned_doctor}
          placeholder="Dr. John Smith"
          onChange={(v) =>
            updateData({
              assigned_doctor: v,
            })
          }
        />

        <FormInput
          label="Hospital"
          value={data.hospital}
          placeholder="Hospital Name"
          onChange={(v) =>
            updateData({
              hospital: v,
            })
          }
        />

        <FormInput
          label="Assigned Caregiver"
          value={data.assigned_caregiver}
          placeholder="Caregiver Name"
          onChange={(v) =>
            updateData({
              assigned_caregiver: v,
            })
          }
        />

        <FormInput
          label="Doctor Contact"
          value={data.doctor_phone}
          placeholder="Doctor Phone"
          onChange={(v) =>
            updateData({
              doctor_phone: v,
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