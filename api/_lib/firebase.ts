// ─────────────────────────────────────────────
// ALERTIO — api/_lib/firebase.ts
// Firebase Admin SDK singleton
// Serverless functions share the module cache within
// the same instance — init once, reuse everywhere.
// ─────────────────────────────────────────────

import * as admin from "firebase-admin";

function initFirebase(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.GCLOUD_PROJECT;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
  }

  if (projectId) {
    return admin.initializeApp({ projectId });
  }

  try {
    return admin.initializeApp();
  } catch {
    throw new Error(
      "Missing Firebase Admin config. On Vercel set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY. On Firebase Functions, deploy inside a Firebase project."
    );
  }
}

// Singleton instances
let _db:       admin.firestore.Firestore | null        = null;
let _messaging: admin.messaging.Messaging | null       = null;
let _auth:      admin.auth.Auth | null                 = null;

export function getDb(): admin.firestore.Firestore {
  if (!_db) { initFirebase(); _db = admin.firestore(); }
  return _db;
}

export function getMessaging(): admin.messaging.Messaging {
  if (!_messaging) { initFirebase(); _messaging = admin.messaging(); }
  return _messaging;
}

export function getAuth(): admin.auth.Auth {
  if (!_auth) { initFirebase(); _auth = admin.auth(); }
  return _auth;
}

// ── Firestore helpers ─────────────────────────────────────────────────────────

/** Recursively converts Firestore Timestamps to ISO strings for JSON serialization */
export function serializeDoc(data: admin.firestore.DocumentData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val instanceof admin.firestore.Timestamp) {
      out[key] = val.toDate().toISOString();
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      out[key] = serializeDoc(val as admin.firestore.DocumentData);
    } else {
      out[key] = val;
    }
  }
  return out;
}
