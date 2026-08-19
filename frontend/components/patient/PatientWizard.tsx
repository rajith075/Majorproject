"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import StepIndicator from "./StepIndicator";
import BasicInfoStep from "./BasicInfoStep";
import MedicalInfoStep from "./MedicalInfoStep";
import MedicationStep from "./MedicationStep";
import EmergencyContactStep from "./EmergencyContactStep";
import CareTeamStep from "./CareTeamStep";
import LifestyleStep from "./LifestyleStep";
import ReviewStep from "./ReviewStep";

import { toast } from "sonner";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import SuccessDialog from "@/components/ui/SuccessDialog";

import { createPatient } from "@/services/api/patient";
import { usePatientStore } from "@/store/patient-store";

export default function PatientWizard() {
  const router = useRouter();

  const setPatient = usePatientStore(
    (state) => state.setPatient
  );

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [patientData, setPatientData] = useState({
    // Basic Info
    full_name: "",
    age: 0,
    gender: "",
    blood_group: "",
    phone: "",
    address: "",

    // Medical
    medical_conditions: [] as string[],
    allergies: [] as string[],
    medications: [] as string[],

    // Emergency
    emergency_contact_name: "",
    emergency_contact_phone: "",
    relationship: "",
    secondary_contact: "",

    // Care Team
    assigned_doctor: "",
    assigned_caregiver: "",
    hospital: "",
    doctor_phone: "",

    // Lifestyle
    mobility: "",
    memory_status: "",
    notes: "",
  });

  const updatePatientData = (
    data: Partial<typeof patientData>
  ) => {
    setPatientData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const patient = await createPatient({
        ...patientData,
        medical_conditions:
          patientData.medical_conditions.join(", "),
        allergies:
          patientData.allergies.join(", "),
        medications:
          patientData.medications.join(", "),
      });

      // Store newly created patient in Zustand
      setPatient(patient);

      setLoading(false);
      setSuccess(true);

      toast.success("Patient Registered Successfully!", {
        description:
          "Welcome to Elderly Care AI. Redirecting to your dashboard...",
      });

      await new Promise((resolve) =>
        setTimeout(resolve, 2000)
      );

      router.replace("/dashboard");
    } catch (error: any) {
      console.error(error);

      setLoading(false);

      toast.error(
        error?.response?.data?.detail ??
          "Unable to create patient profile."
      );
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <LoadingOverlay open={loading} />

      <SuccessDialog open={success} />

      <StepIndicator
        currentStep={step}
        totalSteps={7}
      />

      <div className="mt-10 rounded-[32px] border border-violet-100 bg-white/80 p-10 shadow-xl backdrop-blur-xl">

        {/* STEP 1 */}
        {step === 1 && (
          <BasicInfoStep
            data={patientData}
            updateData={updatePatientData}
            onNext={() => setStep(2)}
          />
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <MedicalInfoStep
            data={patientData}
            updateData={updatePatientData}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <MedicationStep
            data={patientData}
            updateData={updatePatientData}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <EmergencyContactStep
            data={patientData}
            updateData={updatePatientData}
            onBack={() => setStep(3)}
            onNext={() => setStep(5)}
          />
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <CareTeamStep
            data={patientData}
            updateData={updatePatientData}
            onBack={() => setStep(4)}
            onNext={() => setStep(6)}
          />
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <LifestyleStep
            data={patientData}
            updateData={updatePatientData}
            onBack={() => setStep(5)}
            onNext={() => setStep(7)}
          />
        )}

        {/* STEP 7 */}
        {step === 7 && (
          <ReviewStep
            data={patientData}
            onBack={() => setStep(6)}
            onSubmit={handleSubmit}
          />
        )}

      </div>
    </div>
  );
}