import API from "./axios";

export const getLatestPrediction = async (patientId: number) => {
  console.log("🔥 AI REQUEST PATIENT ID:", patientId);
  console.log(
    "🔥 AI REQUEST URL:",
    `${API.defaults.baseURL}/ai/latest/${patientId}`
  );

  const response = await API.get(`/ai/latest/${patientId}`);

  console.log("🔥 AI RESPONSE:", response.data);

  return response.data;
};