"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

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
import { attachCurrentLocationToEmergency } from "@/lib/emergency-location";
import { useAuthStore } from "@/store/auth.store";

interface FirebaseProviderProps {
  children: ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const userId = useAuthStore((state) => state.user?.id);
  const unlockEmergencySoundRef = useRef<() => void>(() => {});
  const [emergencySoundReady, setEmergencySoundReady] = useState(false);

  // Keep one decoded, user-gesture-unlocked sound ready for every alert.
  useEffect(() => {
    const alertAudio = new Audio("/sounds/emergency-alert.mp3");
    let audioContext: AudioContext | null = null;
    let disposed = false;
    alertAudio.preload = "auto";
    alertAudio.volume = 1;
    alertAudio.load();

    const playFallbackBeep = () => {
      if (!audioContext || audioContext.state !== "running") return false;

      const start = audioContext.currentTime;
      [880, 1046, 880].forEach((frequency, index) => {
        const oscillator = audioContext!.createOscillator();
        const gain = audioContext!.createGain();
        const noteStart = start + index * 0.22;
        oscillator.type = "square";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.22, noteStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.19);
        oscillator.connect(gain).connect(audioContext!.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + 0.2);
      });
      return true;
    };

    const unlockAudio = async () => {
      let unlocked = false;
      try {
        alertAudio.muted = true;
        await alertAudio.play();
        alertAudio.pause();
        alertAudio.currentTime = 0;
        alertAudio.muted = false;
        unlocked = true;
      } catch (error) {
        alertAudio.muted = false;
        console.warn("[FCM] Alert MP3 could not unlock; enabling beep fallback:", error);
      }

      try {
        if ("AudioContext" in window) {
          audioContext ??= new AudioContext();
          await audioContext.resume();
          unlocked ||= audioContext.state === "running";
        }
      } catch (error) {
        console.warn("[FCM] Audio beep fallback needs another interaction:", error);
      }

      if (unlocked && !disposed) {
        setEmergencySoundReady(true);
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
      }
    };
    unlockEmergencySoundRef.current = () => void unlockAudio();

    const playEmergencySound = () => {
      alertAudio.pause();
      alertAudio.currentTime = 0;
      const playback = alertAudio.play();
      if (playback) {
        playback.catch((error) => {
          console.warn("[FCM] Alert MP3 was blocked; using beep fallback:", error);
          playFallbackBeep();
        });
      } else {
        playFallbackBeep();
      }
    };

    const playMedicationChime = () => {
      if (!audioContext || audioContext.state !== "running") return;
      const context = audioContext;
      const start = context.currentTime;
      [660, 880].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, start + index * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.16, start + index * 0.16 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + index * 0.16 + 0.28);
        oscillator.connect(gain).connect(context.destination);
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
      disposed = true;
      unlockEmergencySoundRef.current = () => {};
      alertAudio.pause();
      alertAudio.src = "";
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener(EMERGENCY_ALERT_EVENT, playEmergencySound);
      window.removeEventListener(MEDICATION_REMINDER_EVENT, playMedicationChime);
      audioContext?.close();
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
          const fallAlertId = getFallAlertId(payload);
          if (fallAlertId) {
            void attachCurrentLocationToEmergency(fallAlertId).catch((error) => {
              console.warn("[LOCATION] Unable to attach live fall location:", error);
            });
          }
        }

        const message = asMessage(payload);
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(message.title, { body: message.body, silent: false });
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

  return (
    <>
      {children}
      {!emergencySoundReady && (
        <button
          type="button"
          onClick={() => unlockEmergencySoundRef.current()}
          className="fixed bottom-5 right-5 z-50 rounded-full bg-violet-700 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-200"
        >
          Enable emergency alert sound
        </button>
      )}
    </>
  );
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

function getFallAlertId(payload: unknown): number | null {
  if (typeof payload !== "object" || !payload || !("data" in payload)) {
    return null;
  }

  const data = payload.data;
  if (typeof data !== "object" || data === null) return null;

  const values = data as { event?: unknown; emergency_id?: unknown };
  if (String(values.event ?? "").trim().toLowerCase() !== "fall detected") {
    return null;
  }

  const alertId = Number(values.emergency_id);
  return Number.isSafeInteger(alertId) && alertId > 0 ? alertId : null;
}
