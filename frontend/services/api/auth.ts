import API from "./axios";

export const register = async (data: unknown) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

export const login = async (data: unknown) => {
  const response = await API.post("/auth/login", data);

  localStorage.setItem(
    "token",
    response.data.access_token
  );

  return response.data;
};

export const registerCaregiverFromInvitation = async (data: {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  invitation_token: string;
}) => {
  const response = await API.post("/auth/register", { ...data, role: "caregiver" });
  if (response.data.access_token) localStorage.setItem("token", response.data.access_token);
  return response.data;
};
