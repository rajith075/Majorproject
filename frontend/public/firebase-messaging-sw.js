importScripts(
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBSbB801SHhuSK5nqme1DIFFC6zU97YrY8",
  authDomain: "elderlycare-9258a.firebaseapp.com",
  projectId: "elderlycare-9258a",
  storageBucket: "elderlycare-9258a.firebasestorage.app",
  messagingSenderId: "593077762190",
  appId: "1:593077762190:web:7c3417162b64042b6cb1df",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[FCM] Background message received:", payload);

  const title =
    payload?.notification?.title ||
    payload?.data?.title ||
    "ElderCare Alert";

  const body =
    payload?.notification?.body ||
    payload?.data?.body ||
    "A health alert requires your attention.";

  // Show notification immediately
  self.registration.showNotification(title, {
    body,
    data: payload?.data || {},
    silent: false,
    requireInteraction: true,
  });
});
