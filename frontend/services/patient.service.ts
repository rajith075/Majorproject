import {
  getMyPatient,
  getCaregiverPatients,
} from "@/services/api/patient";

import { usePatientStore } from "@/store/patient-store";

export class PatientService {

  // ==========================================================
  // FAMILY MEMBER
  // Load the patient belonging to the logged-in family member
  // ==========================================================

  static async loadPatient() {
    try {
      console.log("FAMILY: Loading patient...");

      const patient = await getMyPatient();

      console.log("FAMILY: Patient loaded:", patient);

      usePatientStore
        .getState()
        .setPatient(patient);

      console.log(
        "FAMILY: Store after set:",
        usePatientStore.getState().patient
      );

      return patient;

    } catch (error) {

      console.error(
        "FAMILY: Failed to load patient:",
        error
      );

      usePatientStore
        .getState()
        .clearPatient();

      return null;
    }
  }


  // ==========================================================
  // CAREGIVER
  // Load the single patient assigned to the caregiver
  // ==========================================================

  static async loadCaregiverPatient() {
    try {

      console.log(
        "CAREGIVER: Loading assigned patient..."
      );

      const patients = await getCaregiverPatients();

      console.log(
        "CAREGIVER: Assigned patients:",
        patients
      );

      // ------------------------------------------------------
      // No patient assigned
      // ------------------------------------------------------

      if (!patients || patients.length === 0) {

        console.log(
          "CAREGIVER: No patient assigned."
        );

        usePatientStore
          .getState()
          .clearPatient();

        return null;
      }

      // ------------------------------------------------------
      // Our current architecture:
      // One caregiver dashboard → one assigned patient
      //
      // Backend returns an array, so we select the first
      // assigned patient.
      // ------------------------------------------------------

      const patient = patients[0];

      console.log(
        "CAREGIVER: Selected patient:",
        patient
      );

      // ------------------------------------------------------
      // Store patient so existing dashboard components
      // automatically receive the caregiver's patient data.
      // ------------------------------------------------------

      usePatientStore
        .getState()
        .setPatient(patient);

      console.log(
        "CAREGIVER: Store after set:",
        usePatientStore.getState().patient
      );

      return patient;

    } catch (error) {

      console.error(
        "CAREGIVER: Failed to load assigned patient:",
        error
      );

      usePatientStore
        .getState()
        .clearPatient();

      return null;
    }
  }


  // ==========================================================
  // CLEAR PATIENT
  // ==========================================================

  static clearPatient() {

    console.log(
      "PATIENT: Clearing patient store..."
    );

    usePatientStore
      .getState()
      .clearPatient();
  }
}