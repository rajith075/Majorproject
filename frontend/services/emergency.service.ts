import {
  getPatientEmergencyAlerts,
  getEmergencyAlert,
  confirmPatientEmergency,
  confirmCaregiverEmergency,
} from "@/services/api/emergency";

export class EmergencyService {

  static async loadPatientAlerts(patientId: number) {
    try {
      const alerts =
        await getPatientEmergencyAlerts(patientId);

      console.log(
        "🚨 EMERGENCY ALERTS LOADED:",
        alerts
      );

      return alerts;

    } catch (error) {

      console.error(
        "❌ FAILED TO LOAD EMERGENCY ALERTS:",
        error
      );

      return [];
    }
  }

  static async loadAlert(alertId: number) {
    return await getEmergencyAlert(alertId);
  }

  static async patientConfirm(
    alertId: number,
    isSafe: boolean
  ) {
    return await confirmPatientEmergency(
      alertId,
      isSafe
    );
  }

  static async caregiverConfirm(
    alertId: number,
    isSafe: boolean
  ) {
    return await confirmCaregiverEmergency(
      alertId,
      isSafe
    );
  }
}