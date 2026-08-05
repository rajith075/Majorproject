export interface Patient {
  id: string;

  basicInfo: BasicInfo;

  medicalProfile: MedicalProfile;

  doctor: DoctorInfo;

  caregiver: CaregiverInfo;

  emergencyContact: EmergencyContact;

  devices: DeviceInfo[];

  createdAt: string;

  updatedAt: string;
}

export interface BasicInfo {
  profilePhoto?: string;

  fullName: string;

  age: number;

  gender: "Male" | "Female" | "Other";

  dateOfBirth: string;

  relationship: string;

  bloodGroup: string;

  phone?: string;

  email?: string;

  address: string;

  city: string;

  state: string;

  country: string;

  height: number;

  weight: number;
}

export interface MedicalProfile {
  medicalConditions: string[];

  allergies: string[];

  surgeries: string[];

  medications: string[];

  notes: string;
}

export interface DoctorInfo {
  name: string;

  specialization: string;

  hospital: string;

  phone: string;
}

export interface CaregiverInfo {
  id: string;

  name: string;

  phone: string;

  shift: string;
}

export interface EmergencyContact {
  name: string;

  relationship: string;

  phone: string;
}

export interface DeviceInfo {
  deviceName: string;

  serialNumber: string;

  connected: boolean;
}