import API from "./axios";

export const getMyMedications = async () => {
  const response = await API.get("/medications/me");

  console.log("FAMILY MEDICATIONS:", response.data);

  return response.data;
};

export const getCaregiverMedications = async () => {
  const response = await API.get("/medications/caregiver");

  console.log("CAREGIVER MEDICATIONS:", response.data);

  return response.data;
};

export const markMedicationAsGiven = async (
  medicationId: number
) => {
  const response = await API.post(
    `/medications/${medicationId}/given`
  );

  console.log(
    "MEDICATION MARKED AS GIVEN:",
    response.data
  );

  return response.data;
};