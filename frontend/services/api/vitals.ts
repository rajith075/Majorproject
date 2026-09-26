import API from "./axios";

export interface VitalLog {
  id: number;
  patient_id: number;
  heart_rate: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  spo2: number | null;
  temperature: number | null;
  respiratory_rate: number | null;
  sleep_hours: number | null;
  activity_steps: number | null;
  created_at: string;
}

export const getMyLatestVitals = async (): Promise<VitalLog | null> => {
  const response = await API.get("/vitals/me", {
    // A dashboard must never reuse a browser/proxy-cached vital response.
    params: { _: Date.now() },
    headers: { "Cache-Control": "no-cache" },
  });

  console.log("FAMILY LATEST VITALS:", response.data);

  return response.data;
};

export const getCaregiverLatestVitals = async (
  patientId: number
): Promise<VitalLog | null> => {
  const response = await API.get(
    `/vitals/caregiver/patient/${patientId}/latest`,
    {
      params: { _: Date.now() },
      headers: { "Cache-Control": "no-cache" },
    }
  );

  return response.data;
};
