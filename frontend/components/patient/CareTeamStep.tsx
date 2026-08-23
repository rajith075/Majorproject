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
        subtitle="Add the healthcare professionals responsible for the patient's care."
      />

      <div className="grid grid-cols-2 gap-8">

        {/* Doctor Name */}

        <FormInput
          label="Doctor Name"
          value={data.assigned_doctor}
          placeholder="Dr. John Smith"
          onChange={(value) =>
            updateData({
              assigned_doctor: value,
            })
          }
        />

        {/* Hospital */}

        <FormInput
          label="Hospital"
          value={data.hospital}
          placeholder="Hospital Name"
          onChange={(value) =>
            updateData({
              hospital: value,
            })
          }
        />

        {/* Doctor Contact */}

        <FormInput
          label="Doctor Contact"
          value={data.doctor_phone}
          placeholder="Doctor Phone"
          type="tel"
          onChange={(value) =>
            updateData({
              doctor_phone: value,
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