import API from "./axios";

export const getMyLatestVitals = async () => {
  const response = await API.get("/vitals/me");

  console.log("FAMILY LATEST VITALS:", response.data);

  return response.data;
};