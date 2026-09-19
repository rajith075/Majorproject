importScripts(
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBSbB801SHhuSKn5qme1DIFFC6zU97YrY8",
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
    payload?.notification?.title || "ElderCare Alert";

  const body =
    payload?.notification?.body ||
    "A health alert requires your attention.";

  console.log("[FCM] Showing notification:", title, body);

  self.registration
    .showNotification(title, {
      body: body,
      data: payload?.data || {},
    })
    .then(() => {
      console.log("[FCM] Notification displayed successfully.");
    })
    .catch((error) => {
      console.error(
        "[FCM] Failed to display notification:",
        error
      );
    });
});