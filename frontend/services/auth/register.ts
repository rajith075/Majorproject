import API from "@/services/api/axios";

export interface RegisterData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role: "family" | "caregiver" | "doctor";
}

export interface RegisterResponse {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
}

export const registerUser = async (
  data: RegisterData
): Promise<RegisterResponse> => {
  const response = await API.post(
    "/auth/register",
    data
  );

  return response.data;
};