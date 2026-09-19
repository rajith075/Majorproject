import API from "./axios";

// =====================================================
// MEDICATION TYPES
// =====================================================

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

  // Medication tracking
  status?: "taken" | "pending" | "upcoming";
  given_by?: string | null;
  given_at?: string | null;
}

// =====================================================
// GET MY MEDICATIONS
// Family member → medications of their patient
// =====================================================

export const getMyMedications = async (): Promise<Medication[]> => {
  const response = await API.get("/medications/me");

  console.log(
    "💊 FAMILY MEDICATIONS:",
    JSON.stringify(response.data, null, 2)
  );

  return response.data || [];
};