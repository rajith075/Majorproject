import { usePatientStore } from "@/store/patient-store";

export const usePatient = () => {
  return usePatientStore();
};