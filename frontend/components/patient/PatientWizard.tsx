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

  // ==========================================================
  // PATIENT DATA
  // ==========================================================

  const [patientData, setPatientData] = useState({
    // ========================================================
    // BASIC INFORMATION
    // ========================================================

    full_name: "",
    age: 0,
    gender: "",
    blood_group: "",
    phone: "",
    address: "",

    // ========================================================
    // MEDICAL INFORMATION
    // ========================================================

    medical_conditions: [] as string[],
    allergies: [] as string[],
    medications: [] as string[],

    // ========================================================
    // EMERGENCY CONTACT
    // ========================================================

    emergency_contact_name: "",
    emergency_contact_phone: "",
    relationship: "",
    secondary_contact: "",

    // ========================================================
    // CARE TEAM
    //
    // IMPORTANT:
    // Caregiver is intentionally NOT selected here.
    // Caregiver selection happens after patient creation.
    // ========================================================

    assigned_doctor: "",
    hospital: "",
    doctor_phone: "",

    // ========================================================
    // LIFESTYLE
    // ========================================================

    mobility: "",
    memory_status: "",
    notes: "",
  });

  // ==========================================================
  // UPDATE PATIENT DATA
  // ==========================================================

  const updatePatientData = (
    data: Partial<typeof patientData>
  ) => {
    setPatientData((previous) => ({
      ...previous,
      ...data,
    }));
  };

  // ==========================================================
  // CREATE PATIENT
  // ==========================================================

  const handleSubmit = async () => {
    try {
      setLoading(true);

      console.log(
        "================================================"
      );
      console.log("FAMILY: CREATING PATIENT");
      console.log(
        "================================================"
      );

      console.log(
        "PATIENT FORM DATA:",
        patientData
      );

      // ------------------------------------------------------
      // Convert array fields into backend-compatible strings
      // ------------------------------------------------------

      const payload = {
        ...patientData,

        medical_conditions:
          patientData.medical_conditions.join(", "),

        allergies:
          patientData.allergies.join(", "),

        medications:
          patientData.medications.join(", "),
      };

      console.log(
        "PATIENT CREATE PAYLOAD:",
        payload
      );

      // ------------------------------------------------------
      // Create patient
      // Backend automatically associates patient with the
      // authenticated family member through JWT.
      // ------------------------------------------------------

      const patient = await createPatient(payload);

      console.log(
        "================================================"
      );
      console.log("FAMILY: PATIENT CREATED SUCCESSFULLY");
      console.log(
        "================================================"
      );

      console.log(
        "CREATED PATIENT:",
        patient
      );

      console.log(
        "PATIENT ID:",
        patient?.id
      );

      console.log(
        "PATIENT NAME:",
        patient?.full_name
      );

      // ------------------------------------------------------
      // Store patient globally
      // ------------------------------------------------------

      setPatient(patient);

      // ------------------------------------------------------
      // Stop loading
      // ------------------------------------------------------

      setLoading(false);

      // ------------------------------------------------------
      // Show premium success state
      // ------------------------------------------------------

      setSuccess(true);

      toast.success(
        "Patient Profile Created Successfully!",
        {
          description:
            "Your elderly care profile is ready. Invite caregivers anytime from Care Team.",
        }
      );

      // ------------------------------------------------------
      // Give user time to see success animation
      // ------------------------------------------------------

      await new Promise((resolve) =>
        setTimeout(resolve, 2000)
      );

      router.replace("/dashboard");

    } catch (error: unknown) {
      console.error(
        "================================================"
      );

      console.error(
        "FAMILY: PATIENT CREATION FAILED"
      );

      console.error(
        "ERROR:",
        error
      );

      console.error(
        "================================================"
      );

      setLoading(false);

      toast.error("Unable to create patient profile.");
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="mx-auto max-w-6xl">

      {/* =====================================================
          PREMIUM LOADING OVERLAY
      ===================================================== */}

      <LoadingOverlay
        open={loading}
      />

      {/* =====================================================
          SUCCESS DIALOG
      ===================================================== */}

      <SuccessDialog
        open={success}
      />

      {/* =====================================================
          STEP INDICATOR
      ===================================================== */}

      <StepIndicator
        currentStep={step}
        totalSteps={7}
      />

      {/* =====================================================
          WIZARD CONTAINER
      ===================================================== */}

      <div
        className="
          mt-10
          rounded-[32px]
          border
          border-violet-100
          bg-white/80
          p-10
          shadow-xl
          backdrop-blur-xl
        "
      >

        {/* ===================================================
            STEP 1 — BASIC INFORMATION
        =================================================== */}

        {step === 1 && (
          <BasicInfoStep
            data={patientData}
            updateData={updatePatientData}
            onNext={() => setStep(2)}
          />
        )}

        {/* ===================================================
            STEP 2 — MEDICAL INFORMATION
        =================================================== */}

        {step === 2 && (
          <MedicalInfoStep
            data={patientData}
            updateData={updatePatientData}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {/* ===================================================
            STEP 3 — MEDICATION
        =================================================== */}

        {step === 3 && (
          <MedicationStep
            data={patientData}
            updateData={updatePatientData}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {/* ===================================================
            STEP 4 — EMERGENCY CONTACT
        =================================================== */}

        {step === 4 && (
          <EmergencyContactStep
            data={patientData}
            updateData={updatePatientData}
            onBack={() => setStep(3)}
            onNext={() => setStep(5)}
          />
        )}

        {/* ===================================================
            STEP 5 — CARE TEAM
        =================================================== */}

        {step === 5 && (
          <CareTeamStep
            data={patientData}
            updateData={updatePatientData}
            onBack={() => setStep(4)}
            onNext={() => setStep(6)}
          />
        )}

        {/* ===================================================
            STEP 6 — LIFESTYLE
        =================================================== */}

        {step === 6 && (
          <LifestyleStep
            data={patientData}
            updateData={updatePatientData}
            onBack={() => setStep(5)}
            onNext={() => setStep(7)}
          />
        )}

        {/* ===================================================
            STEP 7 — REVIEW
        =================================================== */}

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
