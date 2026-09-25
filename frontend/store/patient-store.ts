import { create } from "zustand";

export interface Patient {
  id: number;

  full_name: string;
  age: number;
  gender: string;
  blood_group: string;

  phone: string;
  address: string;

  medical_conditions: string;
  allergies: string;
  medications: string;

  emergency_contact_name: string;
  emergency_contact_phone: string;
  relationship: string;
  secondary_contact: string;

  assigned_doctor: string;
  hospital: string;
  doctor_phone: string;

  mobility: string;
  memory_status: string;
  notes: string;
}

interface PatientStore {
  // Family member → currently selected / owned patient
  patient: Patient | null;

  // Caregiver → all assigned patients
  patients: Patient[];

  setPatient: (patient: Patient) => void;

  setPatients: (patients: Patient[]) => void;

  clearPatient: () => void;

  clearPatients: () => void;
}

export const usePatientStore = create<PatientStore>((set) => ({
  patient: null,

  patients: [],

  // ==========================================================
  // Family Member
  // ==========================================================

  setPatient: (patient) =>
    set({
      patient,
    }),

  // ==========================================================
  // Caregiver
  // ==========================================================

  setPatients: (patients) =>
    set({
      patients,
    }),

  // ==========================================================
  // Clear Family Patient
  // ==========================================================

  clearPatient: () =>
    set({
      patient: null,
    }),

  // ==========================================================
  // Clear Caregiver Patients
  // ==========================================================

  clearPatients: () =>
    set({
      patients: [],
    }),
}));
