import API from "./axios";

// ==========================================================
// Create Patient
// ==========================================================

export const createPatient = async (data: any) => {

  const response = await API.post(
    "/patient/create",
    data
  );

  return response.data;
};


// ==========================================================
// Family Member → Get Own Patient
// ==========================================================

export const getMyPatient = async () => {

  const response = await API.get(
    "/patient/me"
  );

  console.log(
    "PATIENT API RESPONSE:",
    response.data
  );

  return response.data;
};


// ==========================================================
// Caregiver → Get Assigned Patients
// ==========================================================

export const getCaregiverPatients = async () => {

  const response = await API.get(
    "/caregiver/patients"
  );

  console.log(
    "CAREGIVER PATIENTS API RESPONSE:",
    response.data
  );

  return response.data;
};
// ==========================================================
// Family Member → Get Available Caregivers
// ==========================================================

export const getAvailableCaregivers = async () => {
  const response = await API.get(
    "/patient/caregivers"
  );

  console.log(
    "AVAILABLE CAREGIVERS:",
    response.data
  );

  return response.data;
};


// ==========================================================
// Family Member → Assign Caregiver
// ==========================================================

export const assignCaregiver = async (
  caregiverId: number
) => {
  const response = await API.post(
    "/patient/assign-caregiver",
    null,
    {
      params: {
        caregiver_id: caregiverId,
      },
    }
  );

  console.log(
    "CAREGIVER ASSIGNMENT:",
    response.data
  );

  return response.data;
};