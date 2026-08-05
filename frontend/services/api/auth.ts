import API from "./axios";

export const register = async (data: any) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

export const login = async (data: any) => {
  const response = await API.post("/auth/login", data);

  localStorage.setItem(
    "token",
    response.data.access_token
  );

  return response.data;
};