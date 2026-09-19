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

    // 🔊 Unlock browser audio after the user interacts with the page
    const unlockAudio = () => {
      const audio = new Audio(
        "/sounds/emergency-alert.mp3"
      );

      audio.volume = 0;

      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;

          console.log("[FCM] Alert sound unlocked.");
        })
        .catch((error) => {
          console.warn(
            "[FCM] Audio unlock failed:",
            error
          );
        });

      window.removeEventListener(
        "click",
        unlockAudio
      );

      window.removeEventListener(
        "keydown",
        unlockAudio
      );
    };

    window.addEventListener(
      "click",
      unlockAudio
    );

    window.addEventListener(
      "keydown",
      unlockAudio
    );

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

        console.log(
          "[FCM] Token:",
          token
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
              "[FCM] Foreground notification:",
              payload
            );

            const title =
              payload?.notification?.title ||
              "ElderCare Alert";

            const body =
              payload?.notification?.body ||
              "A health alert requires your attention.";

            if (
              typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification(title, {
                body,
              });

              // 🔊 Play ElderCare alert sound
              const audio = new Audio(
                "/sounds/emergency-alert.mp3"
              );

              audio.volume = 1.0;

              audio.play().catch((error) => {
                console.warn(
                  "[FCM] Could not play alert sound:",
                  error
                );
              });
            }
          }
        );
    };

    initializeFirebaseMessaging();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }

      window.removeEventListener(
        "click",
        unlockAudio
      );

      window.removeEventListener(
        "keydown",
        unlockAudio
      );
    };
  }, []);

  return <>{children}</>;
}