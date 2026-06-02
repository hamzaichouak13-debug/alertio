// ─────────────────────────────────────────────
// ALERTIO — api/_lib/stores.ts
// Concrete Firestore implementations of the
// interfaces defined in @alertio/core
//
// Collections:
//   jobs/          {Job}
//   users/         {UserProfile}
//   matches/       {MatchResult}
//   notifications/ {Notification}
//   scheduler_runs/{SchedulerRun}
// ─────────────────────────────────────────────

import { getDb, getMessaging, serializeDoc } from "./firebase";
import type { JobStore }         from "../../packages/core/src/deduplicator";
import type { UserRepository, NotificationService, RunLogger } from "../../packages/core/src/scheduler";
import type { Job, UserProfile, MatchResult, Notification, SchedulerRun } from "../../packages/core/src/types";

// ── JobStore ──────────────────────────────────────────────────────────────────

export function createJobStore(): JobStore {
  return {
    async getExistingIds(ids: string[]): Promise<Set<string>> {
      if (ids.length === 0) return new Set();
      const db   = getDb();
      const existing = new Set<string>();

      // Chunk into 500 (Firestore batch limit)
      for (let i = 0; i < ids.length; i += 500) {
        const chunk = ids.slice(i, i + 500);
        const refs  = chunk.map(id => db.collection("jobs").doc(id));
        const snaps = await db.getAll(...refs);
        snaps.forEach(s => { if (s.exists) existing.add(s.id); });
      }
      return existing;
    },

    async saveJobs(jobs: Job[]): Promise<void> {
      const db = getDb();
      for (let i = 0; i < jobs.length; i += 500) {
        const batch = db.batch();
        jobs.slice(i, i + 500).forEach(job => {
          const ref = db.collection("jobs").doc(job.id);
          batch.set(ref, {
            ...job,
            datePosted: job.datePosted.toISOString(),
            storedAt:   new Date().toISOString(),
            rawData:    null, // don't persist raw payload
          });
        });
        await batch.commit();
      }
    },
  };
}

// ── UserRepository ────────────────────────────────────────────────────────────

export function createUserRepository(): UserRepository {
  return {
    async getAllUsers(): Promise<UserProfile[]> {
      const db    = getDb();
      const snap  = await db.collection("users").get();
      return snap.docs.map(d => deserializeUser(serializeDoc(d.data())));
    },
  };
}

export async function getUserById(uid: string): Promise<UserProfile | null> {
  const db   = getDb();
  const snap = await db.collection("users").doc(uid).get();
  if (!snap.exists) return null;
  return deserializeUser(serializeDoc(snap.data()!));
}

export async function upsertUser(uid: string, profile: Partial<UserProfile>): Promise<void> {
  const db  = getDb();
  const ref = db.collection("users").doc(uid);
  await ref.set(
    { ...profile, uid, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

function deserializeUser(data: Record<string, unknown>): UserProfile {
  return {
    ...data,
    createdAt: new Date(data.createdAt as string),
    updatedAt: new Date(data.updatedAt as string),
  } as UserProfile;
}

// ── NotificationService ───────────────────────────────────────────────────────

export function createNotificationService(): NotificationService {
  return {
    async sendMatchNotification(user: UserProfile, job: Job, match: MatchResult): Promise<void> {
      if (!user.fcmToken) return;

      const messaging = getMessaging();
      const db        = getDb();

      const notifId   = `${user.uid}_${job.id}_${Date.now()}`;
      const scoreLabel = match.score >= 90 ? "🔥 Excellent match" :
                         match.score >= 80 ? "✨ Très bon match"   :
                         "👍 Bon match";

      // Send FCM push
      await messaging.send({
        token: user.fcmToken,
        notification: {
          title: `${scoreLabel} — ${job.title}`,
          body:  `${job.company} · ${job.location.city} · Score ${match.score}/100`,
        },
        data: {
          jobId:     job.id,
          score:     String(match.score),
          type:      "JOB_MATCH",
          notifId,
        },
        webpush: {
          fcmOptions: { link: `/jobs/${job.id}` },
        },
        apns: {
          payload: {
            aps: { badge: 1, sound: "default" },
          },
        },
      });

      // Persist notification record
      const notif: Notification = {
        id:         notifId,
        userId:     user.uid,
        jobId:      job.id,
        matchScore: match.score,
        title:      `${scoreLabel} — ${job.title}`,
        body:       `${job.company} · ${job.location.city}`,
        sentAt:     new Date(),
        read:       false,
      };

      await db.collection("notifications").doc(notifId).set({
        ...notif,
        sentAt: notif.sentAt.toISOString(),
      });
    },
  };
}

// ── RunLogger ─────────────────────────────────────────────────────────────────

export function createRunLogger(): RunLogger {
  return {
    async logRun(run: SchedulerRun): Promise<void> {
      const db = getDb();
      await db.collection("scheduler_runs").doc(run.id).set({
        ...run,
        startedAt:  run.startedAt.toISOString(),
        finishedAt: run.finishedAt?.toISOString() ?? null,
      });
    },
  };
}

// ── Jobs queries ──────────────────────────────────────────────────────────────

export interface JobsQuery {
  romeCode?:   string;
  contract?:   string;
  remote?:     string;
  limit?:      number;
  startAfter?: string; // last doc ID for pagination
}

export async function queryJobs(q: JobsQuery): Promise<Job[]> {
  const db    = getDb();
  const limit = Math.min(q.limit ?? 20, 100);

  let ref: FirebaseFirestore.Query = db.collection("jobs")
    .orderBy("datePosted", "desc")
    .limit(limit);

  if (q.romeCode)  ref = ref.where("romeCode",         "==", q.romeCode);
  if (q.contract)  ref = ref.where("contract",         "==", q.contract);
  if (q.remote)    ref = ref.where("location.remote",  "==", q.remote);

  if (q.startAfter) {
    const cursor = await db.collection("jobs").doc(q.startAfter).get();
    if (cursor.exists) ref = ref.startAfter(cursor);
  }

  const snap = await ref.get();
  return snap.docs.map(d => deserializeJob(serializeDoc(d.data())));
}

function deserializeJob(data: Record<string, unknown>): Job {
  return {
    ...data,
    datePosted: new Date(data.datePosted as string),
  } as Job;
}

// ── Notifications queries ─────────────────────────────────────────────────────

export async function getUserNotifications(uid: string, limit = 50): Promise<Notification[]> {
  const db   = getDb();
  const snap = await db.collection("notifications")
    .where("userId", "==", uid)
    .orderBy("sentAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map(d => ({
    ...serializeDoc(d.data()),
    sentAt: new Date(d.data().sentAt as string),
  } as Notification));
}

export async function markNotificationRead(notifId: string, uid: string): Promise<void> {
  const db  = getDb();
  const ref = db.collection("notifications").doc(notifId);
  const doc = await ref.get();
  if (!doc.exists || doc.data()?.userId !== uid) return;
  await ref.update({ read: true });
}
