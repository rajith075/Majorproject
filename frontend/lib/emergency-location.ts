"use client";

import { updateEmergencyAlertLocation } from "@/services/api/emergency";

/**
 * Get the current browser location and attach it to the active fall alert.
 * This works on localhost and on HTTPS origins once the user grants location
 * permission. It intentionally does nothing when the browser cannot provide
 * a position, so the emergency alert itself is never delayed or blocked.
 */
export async function attachCurrentLocationToEmergency(
  alertId: number
): Promise<void> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    throw new Error("Location is not supported by this browser.");
  }

  const position = await new Promise<GeolocationPosition>(
    (resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 30_000,
      });
    }
  );

  await updateEmergencyAlertLocation(alertId, {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });
}
