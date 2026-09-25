"use client";

import { ReactNode, useEffect } from "react";
import {
  requestNotificationPermission,
  listenForForegroundMessages,
} from "@/lib/firebase-messaging";

interface FirebaseProviderProps {
  children: ReactNode;
}

export function FirebaseProvider({
  children,
}: FirebaseProviderProps) {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // 🔊 Create ONE persistent audio element
    // instead of creating a new Audio object for every alert.
    const alertAudio = new Audio("/sounds/emergency-alert.mp3");

    alertAudio.preload = "auto";
    alertAudio.volume = 1.0;

    // Start loading the sound immediately.
    alertAudio.load();

    // 🔓 Unlock audio after the first user interaction.
    const unlockAudio = async () => {
      try {
        alertAudio.volume = 0;

        await alertAudio.play();

        alertAudio.pause();
        alertAudio.currentTime = 0;
        alertAudio.volume = 1.0;

        console.log("[FCM] Alert audio unlocked and preloaded.");
      } catch (error) {
        console.warn("[FCM] Audio unlock failed:", error);
      }

      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);

    const playEmergencySound = () => {
      console.log("[FCM] 🔊 Playing emergency sound NOW");

      try {
        // Restart the existing audio element immediately.
        alertAudio.pause();
        alertAudio.currentTime = 0;
        alertAudio.volume = 1.0;

        const playPromise = alertAudio.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn(
              "[FCM] Could not play alert sound:",
              error
            );
          });
        }
      } catch (error) {
        console.error(
          "[FCM] Emergency sound error:",
          error
        );
      }
    };

    const initializeFirebaseMessaging = async () => {
      console.log(
        "[FCM] Initializing Firebase Messaging..."
      );

      const token =
        await requestNotificationPermission();

      if (token) {
        console.log(
          "[FCM] TOKEN SUCCESSFULLY OBTAINED"
        );

        localStorage.setItem(
          "elderlycare_fcm_token",
          token
        );
      } else {
        console.warn(
          "[FCM] No FCM token was obtained."
        );
      }

      unsubscribe =
        await listenForForegroundMessages(
          (payload: any) => {
            console.log(
              "[FCM] ⚡ Foreground notification received:",
              payload
            );

            // 🔊 FIRST: play sound immediately
            playEmergencySound();

            const title =
              payload?.notification?.title ||
              payload?.data?.title ||
              "ElderCare Alert";

            const body =
              payload?.notification?.body ||
              payload?.data?.body ||
              "A health alert requires your attention.";

            // Then show browser notification.
            if (
              typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              try {
                new Notification(title, {
                  body,
                });
              } catch (error) {
                console.warn(
                  "[FCM] Browser notification failed:",
                  error
                );
              }
            }
          }
        );
    };

    initializeFirebaseMessaging();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }

      alertAudio.pause();
      alertAudio.src = "";

      window.removeEventListener(
        "click",
        unlockAudio
      );

      window.removeEventListener(
        "keydown",
        unlockAudio
      );

      window.removeEventListener(
        "touchstart",
        unlockAudio
      );
    };
  }, []);

  return <>{children}</>;
}