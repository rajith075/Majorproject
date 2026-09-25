export const EMERGENCY_ALERT_EVENT = "eldercare:emergency-alert";
export const MEDICATION_REMINDER_EVENT = "eldercare:medication-reminder";

/** Notify every mounted UI surface about an emergency without waiting for polling. */
export function announceEmergencyAlert(detail?: unknown) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EMERGENCY_ALERT_EVENT, { detail }));
}

export function announceMedicationReminder(detail?: unknown) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MEDICATION_REMINDER_EVENT, { detail }));
}
