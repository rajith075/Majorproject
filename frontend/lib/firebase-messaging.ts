"use client";

import { getApps, initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseApp =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

let messagingInstance: Messaging | null = null;

async function getFirebaseMessaging() {
  if (typeof window === "undefined") {
    return null;
  }

  const supported = await isSupported();

  if (!supported) {
    console.warn("[FCM] Firebase Messaging is not supported in this browser.");
    return null;
  }

  if (!messagingInstance) {
    messagingInstance = getMessaging(firebaseApp);
  }

  return messagingInstance;
}

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    const messaging = await getFirebaseMessaging();

    if (!messaging) {
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.warn("[FCM] Notification permission was not granted.");
      return null;
    }

    const serviceWorkerRegistration =
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    if (!vapidKey) {
      console.error("[FCM] NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing.");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration,
    });

    if (!token) {
      console.error("[FCM] Failed to obtain FCM token.");
      return null;
    }

    console.log("[FCM] Registration token obtained.");
    console.log(token);

    return token;
  } catch (error) {
    console.error("[FCM] Failed to initialize notifications:", error);
    return null;
  }
}

export async function listenForForegroundMessages(
  callback: (payload: unknown) => void
) {
  const messaging = await getFirebaseMessaging();

  if (!messaging) {
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log("[FCM] Foreground message received:", payload);
    callback(payload);
  });
}