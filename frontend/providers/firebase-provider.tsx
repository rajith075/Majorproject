"use client";

import { ReactNode, useEffect } from "react";

import {
  listenForForegroundMessages,
  requestNotificationPermission,
} from "@/lib/firebase-messaging";
import {
  announceEmergencyAlert,
  announceMedicationReminder,
  EMERGENCY_ALERT_EVENT,
  MEDICATION_REMINDER_EVENT,
} from "@/lib/emergency-alert";
import { registerEmergencyDevice } from "@/services/api/emergency";
import { useAuthStore } from "@/store/auth.store";

interface FirebaseProviderProps {
  children: ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const userId = useAuthStore((state) => state.user?.id);

  // Keep one decoded, user-gesture-unlocked sound ready for every alert.
  useEffect(() => {
    const alertAudio = new Audio("/sounds/emergency-alert.mp3");
    let medicationAudioContext: AudioContext | null = null;
    alertAudio.preload = "auto";
    alertAudio.volume = 1;
    alertAudio.load();

    const unlockAudio = async () => {
      try {
        alertAudio.muted = true;
        await alertAudio.play();
        alertAudio.pause();
        alertAudio.currentTime = 0;
        alertAudio.muted = false;
        if ("AudioContext" in window) {
          medicationAudioContext ??= new AudioContext();
          await medicationAudioContext.resume();
        }
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
      } catch (error) {
        alertAudio.muted = false;
        console.warn("[FCM] Audio unlock needs another user interaction:", error);
      }
    };

    const playEmergencySound = () => {
      alertAudio.pause();
      alertAudio.currentTime = 0;
      const playback = alertAudio.play();
      if (playback) playback.catch((error) => console.warn("[FCM] Alert sound was blocked:", error));
    };

    const playMedicationChime = () => {
      if (!medicationAudioContext || medicationAudioContext.state !== "running") return;
      const start = medicationAudioContext.currentTime;
      [660, 880].forEach((frequency, index) => {
        const oscillator = medicationAudioContext.createOscillator();
        const gain = medicationAudioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, start + index * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.16, start + index * 0.16 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + index * 0.16 + 0.28);
        oscillator.connect(gain).connect(medicationAudioContext.destination);
        oscillator.start(start + index * 0.16);
        oscillator.stop(start + index * 0.16 + 0.3);
      });
    };

    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);
    window.addEventListener(EMERGENCY_ALERT_EVENT, playEmergencySound);
    window.addEventListener(MEDICATION_REMINDER_EVENT, playMedicationChime);

    return () => {
      alertAudio.pause();
      alertAudio.src = "";
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener(EMERGENCY_ALERT_EVENT, playEmergencySound);
      window.removeEventListener(MEDICATION_REMINDER_EVENT, playMedicationChime);
      medicationAudioContext?.close();
    };
  }, []);

  // Subscribe before the permission/token request completes, so an alert is
  // never missed while the browser is displaying its permission prompt.
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;

    const subscribe = async () => {
      unsubscribe = await listenForForegroundMessages((payload) => {
        if (!active) return;
        if (isMedicationReminder(payload)) {
          announceMedicationReminder(payload);
        } else {
          announceEmergencyAlert(payload);
        }

        const message = asMessage(payload);
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(message.title, { body: message.body });
        }
      });
    };

    subscribe();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  // Register the current device after the app knows which care-team member is
  // signed in. The backend will push to family and active caregiver devices.
  useEffect(() => {
    if (!userId) return;
    let active = true;

    const register = async () => {
      const token = await requestNotificationPermission();
      if (!token || !active) return;
      localStorage.setItem("elderlycare_fcm_token", token);
      try {
        await registerEmergencyDevice(token);
      } catch (error) {
        console.warn("[FCM] Unable to register this device with ElderCare:", error);
      }
    };

    register();
    return () => { active = false; };
  }, [userId]);

  return <>{children}</>;
}

function asMessage(payload: unknown) {
  if (typeof payload !== "object" || !payload) {
    return { title: "ElderCare Alert", body: "A health alert requires your attention." };
  }
  const value = payload as { notification?: { title?: string; body?: string }; data?: { title?: string; body?: string } };
  return {
    title: value.notification?.title || value.data?.title || "ElderCare Alert",
    body: value.notification?.body || value.data?.body || "A health alert requires your attention.",
  };
}

function isMedicationReminder(payload: unknown) {
  if (typeof payload !== "object" || !payload || !("data" in payload)) return false;
  const data = payload.data;
  return typeof data === "object" && data !== null && "type" in data && data.type === "medication_reminder";
}
