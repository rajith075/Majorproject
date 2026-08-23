import API from "@/services/api/axios";

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await API.post(
    "/auth/token",
    new URLSearchParams({
      username: email,
      password: password,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
};