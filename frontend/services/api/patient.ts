import API from "./axios";

export const createPatient = async (data: unknown) => {
  const response = await API.post("/patient/create", data);
  return response.data;
};

export const getMyPatient = async () => {
  const response = await API.get("/patient/me");
  return response.data;
};

export const getCaregiverPatients = async () => {
  const response = await API.get("/caregiver/patients");
  return response.data;
};

export type CaregiverInvitation = {
  id: number;
  invited_email: string;
  relationship: string;
  message: string | null;
  status: "pending" | "accepted" | "declined" | "expired";
  created_at: string;
  expires_at: string;
};

export type Caregiver = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  relationship: string;
  status: "active";
  created_at: string;
};

export type CareTeam = {
  patient_id: number;
  doctor_name: string | null;
  hospital: string | null;
  doctor_phone: string | null;
  caregivers: Caregiver[];
  invitations: CaregiverInvitation[];
};

export const getMyCareTeam = async (): Promise<CareTeam> => {
  const response = await API.get("/caregiver/team");
  return response.data;
};

export const inviteCaregiver = async (data: {
  invited_email: string;
  relationship: string;
  message?: string;
}): Promise<CaregiverInvitation> => {
  const response = await API.post("/caregiver/invite", data);
  return response.data;
};

export type InvitationPreview = {
  invited_email: string;
  patient_name: string;
  family_name: string;
  relationship: string;
  message: string | null;
  expires_at: string;
};

export const getInvitationPreview = async (token: string): Promise<InvitationPreview> => {
  const result = await API.get(`/caregiver/invitations/${encodeURIComponent(token)}`);
  return result.data;
};

export const acceptCaregiverInvitation = async (token: string): Promise<Caregiver> => {
  const result = await API.post(`/caregiver/invitations/${encodeURIComponent(token)}/accept`);
  return result.data;
};
