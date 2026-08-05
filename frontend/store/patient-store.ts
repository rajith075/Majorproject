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
  assigned_caregiver: string;
  hospital: string;
  doctor_phone: string;

  mobility: string;
  memory_status: string;
  notes: string;
}

interface PatientStore {
  patient: Patient | null;

  setPatient: (patient: Patient) => void;

  clearPatient: () => void;
}

export const usePatientStore = create<PatientStore>((set) => ({
  patient: null,

  setPatient: (patient) =>
    set({
      patient,
    }),

  clearPatient: () =>
    set({
      patient: null,
    }),
}));