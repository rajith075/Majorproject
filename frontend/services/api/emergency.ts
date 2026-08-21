import API from "./axios";

export interface EmergencyAlert {
  id: number;
  patient_id: number;
  event_type: string;
  status: string;

  latitude: number | null;
  longitude: number | null;

  detected_at: string;

  patient_confirmation: boolean | null;
  caregiver_confirmation: boolean | null;

  resolution: string | null;
  resolved_at: string | null;

  notes: string | null;
}

// ==========================================================
// GET ALL ALERTS FOR PATIENT
// ==========================================================

export const getPatientEmergencyAlerts = async (
  patientId: number
): Promise<EmergencyAlert[]> => {
  const response = await API.get(
    `/emergency/patients/${patientId}/alerts`
  );

  return response.data;
};

// ==========================================================
// GET SINGLE ALERT
// ==========================================================

export const getEmergencyAlert = async (
  alertId: number
): Promise<EmergencyAlert> => {
  const response = await API.get(
    `/emergency/alerts/${alertId}`
  );

  return response.data;
};

// ==========================================================
// PATIENT CONFIRMATION
// ==========================================================

export const confirmPatientEmergency = async (
  alertId: number,
  isSafe: boolean
): Promise<EmergencyAlert> => {
  const response = await API.patch(
    `/emergency/alerts/${alertId}/patient-confirm`,
    null,
    {
      params: {
        is_safe: isSafe,
      },
    }
  );

  return response.data;
};

// ==========================================================
// CAREGIVER CONFIRMATION
// ==========================================================

export const confirmCaregiverEmergency = async (
  alertId: number,
  isSafe: boolean
): Promise<EmergencyAlert> => {
  const response = await API.patch(
    `/emergency/alerts/${alertId}/caregiver-confirm`,
    null,
    {
      params: {
        is_safe: isSafe,
      },
    }
  );

  return response.data;
};
// ==========================================================
// CREATE EMERGENCY ALERT
// ==========================================================

export const createEmergencyAlert = async (data: {
  patient_id: number;
  event_type: string;
  latitude: number | null;
  longitude: number | null;
}): Promise<EmergencyAlert> => {
  const response = await API.post(
    "/emergency/alerts",
    data
  );

  return response.data;
};