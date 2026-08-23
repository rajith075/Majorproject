import API from "@/services/api/axios";

export interface CurrentUser {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: "family" | "caregiver" | "doctor";
}

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await API.get("/auth/me");
  return response.data;
};