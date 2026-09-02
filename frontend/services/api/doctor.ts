import API from "./axios";

export interface DoctorRegisterData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface DoctorRegistrationResponse {
  message: string;
  doctor_id: number;
  verification_status: string;
}

export const registerDoctor = async (
  data: DoctorRegisterData
): Promise<DoctorRegistrationResponse> => {
  const response = await API.post("/doctor/register", data);
  return response.data;
};

export const uploadDoctorDocuments = async (
  doctorId: number,
  medicalCertificate: File,
  clinicLicense: File
) => {
  const formData = new FormData();

  formData.append("medical_certificate", medicalCertificate);
  formData.append("clinic_license", clinicLicense);

  const response = await API.post(
    `/doctor/${doctorId}/documents`,
    formData
  );

  return response.data;
};

export const getDoctorVerificationStatus = async () => {
  const response = await API.get("/doctor/verification-status");
  return response.data;
};