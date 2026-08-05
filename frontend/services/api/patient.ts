import API from "./axios";

export const createPatient = async (data: any) => {
  const response = await API.post("/patient/create", data);
  return response.data;
};

export const getMyPatient = async () => {
  const response = await API.get("/patient/me");

  console.log("PATIENT API RESPONSE:", response.data);

  return response.data;
};