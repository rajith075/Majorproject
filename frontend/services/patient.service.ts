import { getMyPatient } from "@/services/api/patient";
import { usePatientStore } from "@/store/patient-store";

export class PatientService {
  static async loadPatient() {
    try {
      const patient = await getMyPatient();

      console.log("PATIENT LOADED:", patient);

      usePatientStore.getState().setPatient(patient);

      console.log(
        "STORE AFTER SET:",
        usePatientStore.getState().patient
      );

      return patient;
    } catch (error) {
      console.error(error);

      usePatientStore.getState().clearPatient();

      return null;
    }
  }

  static clearPatient() {
    usePatientStore.getState().clearPatient();
  }
}