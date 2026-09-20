import API from "./axios";

export interface Medication {
  id: number;
  patient_id: number;
  medicine_name: string;
  dosage?: string | null;
  reminder_time?: string | null;
  before_food: boolean;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
  active: boolean;

  status: "taken" | "pending" | "upcoming";
  given_by?: string | null;
  given_at?: string | null;
}

// ==========================================================
// FAMILY
// ==========================================================

export async function getMyMedications(): Promise<Medication[]> {
  const response = await API.get("/medications/me");

  return response.data;
}

// ==========================================================
// CAREGIVER
// ==========================================================

export async function getCaregiverMedications(): Promise<
  Medication[]
> {
  const response = await API.get("/medications/caregiver");

  return response.data;
}

// ==========================================================
// CAREGIVER
// MARK MEDICATION AS GIVEN
// ==========================================================

export async function markMedicationAsGiven(
  medicationId: number
) {
  const response = await API.post(
    `/medications/${medicationId}/given`
  );

  return response.data;
}