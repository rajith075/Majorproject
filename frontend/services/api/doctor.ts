import API from "./axios";

// =====================================================
// DOCTOR REGISTRATION
// =====================================================

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

// =====================================================
// DOCTOR DOCUMENT UPLOAD
// =====================================================

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

// =====================================================
// DOCTOR PATIENT
// =====================================================

export interface DoctorPatient {
  id: number;
  full_name: string;
  age: number;
  gender: string;
  blood_group: string;
  phone: string;
  address: string;

  medical_conditions: string | null;
  allergies: string | null;
  medications: string | null;

  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;

  last_heart_rate: number | null;
  last_systolic_bp: number | null;
  last_diastolic_bp: number | null;
  last_spo2: number | null;
  last_temperature: number | null;
  last_respiratory_rate: number | null;

  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  relationship: string | null;

  assigned_caregiver: string | null;

  hospital: string | null;
  doctor_phone: string | null;

  notes: string | null;
}

// =====================================================
// GET ASSIGNED PATIENT
// =====================================================

export const getDoctorPatient = async (): Promise<
  DoctorPatient | null
> => {
  const response = await API.get("/doctor/patient");

  console.log(
    "🩺 DOCTOR PATIENT RESPONSE:",
    JSON.stringify(response.data, null, 2)
  );

  return response.data;
};

export const updateDoctorPatientNotes = async (
  notes: string
): Promise<{ notes: string | null }> => {
  const response = await API.patch("/doctor/patient/notes", {
    notes,
  });

  return response.data;
};

export interface DoctorBloodPressureData {
  systolic_bp: number;
  diastolic_bp: number;
}

export const recordDoctorBloodPressure = async (
  data: DoctorBloodPressureData
): Promise<DoctorVitalLog> => {
  const response = await API.post(
    "/doctor/patient/blood-pressure",
    data
  );

  return response.data;
};

// =====================================================
// DOCTOR CONSULTATION
// =====================================================

export interface DoctorConsultation {
  id: number;
  patient_id: number;
  doctor_id: number;

  reason: string | null;

  scheduled_date: string;
  scheduled_time: string;

  status:
    | "scheduled"
    | "in_progress"
    | "completed"
    | "cancelled";

  consultation_notes: string | null;

  requested_at: string;
  started_at: string | null;
  completed_at: string | null;

  created_at: string;
  updated_at: string;
}

// =====================================================
// GET ALL DOCTOR CONSULTATIONS
// =====================================================

export const getDoctorConsultations = async (): Promise<
  DoctorConsultation[]
> => {
  const response = await API.get("/doctor/consultations");

  console.log(
    "📅 DOCTOR CONSULTATIONS:",
    JSON.stringify(response.data, null, 2)
  );

  return response.data;
};

// =====================================================
// GET TODAY'S CONSULTATIONS
// =====================================================

export const getTodayConsultations = async (): Promise<
  DoctorConsultation[]
> => {
  const response = await API.get("/doctor/consultations/today");

  console.log(
    "📅 TODAY'S CONSULTATIONS:",
    JSON.stringify(response.data, null, 2)
  );

  return response.data;
};

// =====================================================
// FAMILY - VERIFIED DOCTOR DIRECTORY
// =====================================================

export interface FamilyDoctor {
  doctor_id: number;
  full_name: string;
  email: string;
  phone: string | null;

  specialization: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
  experience_years: number | null;
  bio: string | null;

  verification_status: string;
}

// =====================================================
// GET VERIFIED DOCTORS
// =====================================================

export const getVerifiedDoctors = async (): Promise<
  FamilyDoctor[]
> => {
  const response = await API.get("/doctor/doctors");

  console.log(
    "🩺 VERIFIED DOCTORS:",
    JSON.stringify(response.data, null, 2)
  );

  return response.data;
};

// =====================================================
// GET SINGLE DOCTOR PROFILE
// =====================================================

export const getDoctorProfile = async (
  doctorId: number
): Promise<FamilyDoctor> => {
  const response = await API.get(`/doctor/${doctorId}/profile`);

  console.log(
    "👨‍⚕️ DOCTOR PROFILE:",
    JSON.stringify(response.data, null, 2)
  );

  return response.data;
};

// =====================================================
// FAMILY - BOOK CONSULTATION
// =====================================================

export interface BookConsultationData {
  patient_id: number;
  doctor_id: number;
  scheduled_date: string;
  scheduled_time: string;
  reason?: string;
}

export const bookConsultation = async (
  data: BookConsultationData
): Promise<DoctorConsultation> => {
  try {
    console.log(
      "📤 BOOK CONSULTATION PAYLOAD:",
      JSON.stringify(data, null, 2)
    );

    const response = await API.post(
      "/doctor/consultations/book",
      data
    );

    console.log(
      "✅ CONSULTATION BOOKED:",
      JSON.stringify(response.data, null, 2)
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "❌ BOOK CONSULTATION STATUS:",
      error?.response?.status
    );

    console.error(
      "❌ BOOK CONSULTATION DETAIL:",
      error?.response?.data
    );

    console.error(
      "❌ BOOK CONSULTATION REQUEST:",
      error?.response?.config?.data
    );

    throw error;
  }
};

// =====================================================
// FAMILY - GET MY CONSULTATIONS
// =====================================================

export const getFamilyConsultations = async (): Promise<
  DoctorConsultation[]
> => {
  const response = await API.get("/doctor/consultations/my");

  console.log(
    "📅 FAMILY CONSULTATIONS:",
    JSON.stringify(response.data, null, 2)
  );

  return response.data;
};

// =====================================================
// DOCTOR - PATIENT VITAL HISTORY
// =====================================================

export interface DoctorVitalLog {
  id: number;
  patient_id: number;

  heart_rate: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  spo2: number | null;
  temperature: number | null;
  respiratory_rate: number | null;

  sleep_hours: number | null;
  activity_steps: number | null;

  created_at: string;
}

export const getDoctorVitalHistory = async (
  patientId: number
): Promise<DoctorVitalLog[]> => {
  const response = await API.get(
    `/vitals/doctor/patient/${patientId}/history`
  );

  console.log(
    "❤️ DOCTOR VITAL HISTORY:",
    JSON.stringify(response.data, null, 2)
  );

  return response.data || [];
};

// =====================================================
// DOCTOR - PRESCRIBE MEDICATION
// =====================================================

export interface PrescribeMedicationData {
  medicine_name: string;
  dosage?: string;
  reminder_time?: string;

  before_food: boolean;

  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
}

export interface PrescribedMedication {
  id: number;
  patient_id: number;
  medicine_name: string;
  dosage: string | null;
  reminder_time: string | null;

  before_food: boolean;

  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;

  active: boolean;
}

export const prescribeMedication = async (
  patientId: number,
  data: PrescribeMedicationData
): Promise<PrescribedMedication> => {
  const response = await API.post(
    `/medications/patient/${patientId}`,
    data
  );

  console.log(
    "💊 MEDICATION PRESCRIBED:",
    JSON.stringify(response.data, null, 2)
  );

  return response.data;
};

// =====================================================
// DOCTOR - GET PATIENT MEDICATIONS
// =====================================================

export const getDoctorMedications = async (
  patientId: number
): Promise<PrescribedMedication[]> => {
  const response = await API.get(
    `/medications/doctor/patient/${patientId}`
  );

  return response.data || [];
};