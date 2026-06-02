// ─────────────────────────────────────────────
// ALERTIO — public/firebase-messaging-sw.js
// Service Worker for Firebase Cloud Messaging
// Must be at the root of /public — served as /firebase-messaging-sw.js
//
// This file handles background push notifications
// when the app is not in the foreground.
// ─────────────────────────────────────────────

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Firebase config must be duplicated here (service workers can't import env vars)
// Replace with your actual config values — these are public-safe keys
firebase.initializeApp({
  apiKey:            self.__FIREBASE_API_KEY__            ?? "AIzaSyA9-IPeF49OsRLQtYmx5qvrfqAM55iR-JU",
  authDomain:        self.__FIREBASE_AUTH_DOMAIN__        ?? "alertio-prod.firebaseapp.com",
  projectId:         self.__FIREBASE_PROJECT_ID__         ?? "alertio-prod",
  storageBucket:     self.__FIREBASE_STORAGE_BUCKET__     ?? "alertio-prod.firebasestorage.app",
  messagingSenderId: self.__FIREBASE_MESSAGING_SENDER_ID__ ?? "212428183678",
  appId:             self.__FIREBASE_APP_ID__             ?? "1:212428183678:web:8d5980a11063b1aab8602f",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {};
  const { jobId, score, notifId } = payload.data ?? {};

  if (!title) return;

  self.registration.showNotification(title, {
    body:    body ?? "",
    icon:    "/icons/icon-192x192.png",
    badge:   "/icons/badge-72x72.png",
    tag:     notifId ?? jobId ?? "alertio-match",
    data:    { jobId, score, url: jobId ? `/jobs/${jobId}` : "/dashboard" },
    actions: [
      { action: "view",    title: "Voir l'offre" },
      { action: "dismiss", title: "Ignorer"      },
    ],
    requireInteraction: Number(score) >= 85,
  });
});

// Notification click: open the job page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url ?? "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open new tab
      return clients.openWindow(url);
    })
  );
});
