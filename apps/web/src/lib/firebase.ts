// ─────────────────────────────────────────────
// ALERTIO — lib/firebase.ts
// Client-side Firebase SDK (browser)
// ─────────────────────────────────────────────

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth,       type Auth }                  from "firebase/auth";
import { getFirestore,  type Firestore }              from "firebase/firestore";
import { getMessaging, isSupported, type Messaging }  from "firebase/messaging";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Singleton — safe for Next.js hot-reload
function getApp(): FirebaseApp {
  return getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
}

export const app       = getApp();
export const auth: Auth           = getAuth(app);
export const db: Firestore        = getFirestore(app);

// FCM only works in browser + only if supported
export async function getMessagingInstance(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
}

// VAPID key for push subscriptions (set in Firebase Console → Cloud Messaging)
export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "";
