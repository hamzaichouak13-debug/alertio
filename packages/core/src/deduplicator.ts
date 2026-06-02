// ─────────────────────────────────────────────
// ALERTIO — deduplicator.ts
// Compares a batch of normalized jobs against
// what's already stored in Firestore.
// Returns only genuinely new offers.
// ─────────────────────────────────────────────
//
// Firestore collection: "jobs"
// Document ID = job.id (France Travail offer ID)
// Strategy: batch getAll() → set diff → write new docs
//
// Why not query by dateCreation?
//   The API can return the same offer across runs.
//   ID-based dedup is O(1) per offer and idempotent.

import type { Job } from "./types";

// ── Firestore adapter interface ───────────────────────────────────────────────
// We depend on an interface, not the Firebase SDK directly.
// This keeps the core package free of Firebase and easy to test.

export interface JobStore {
  /** Returns the IDs that already exist in the store */
  getExistingIds(ids: string[]): Promise<Set<string>>;
  /** Persists new jobs (batch write) */
  saveJobs(jobs: Job[]): Promise<void>;
}

// ── Main deduplicator ─────────────────────────────────────────────────────────

export interface DeduplicationResult {
  newJobs:       Job[];
  duplicateIds:  string[];
  savedCount:    number;
  errors:        string[];
}

export async function deduplicateAndSave(
  jobs: Job[],
  store: JobStore,
): Promise<DeduplicationResult> {
  if (jobs.length === 0) {
    return { newJobs: [], duplicateIds: [], savedCount: 0, errors: [] };
  }

  const errors: string[] = [];

  // 1. Check which IDs already exist
  const ids = jobs.map(j => j.id);
  let existingIds: Set<string>;

  try {
    existingIds = await store.getExistingIds(ids);
  } catch (err) {
    errors.push(`Firestore read failed: ${String(err)}`);
    return { newJobs: [], duplicateIds: [], savedCount: 0, errors };
  }

  // 2. Split new vs duplicate
  const newJobs:      Job[]     = [];
  const duplicateIds: string[]  = [];

  for (const job of jobs) {
    if (existingIds.has(job.id)) {
      duplicateIds.push(job.id);
    } else {
      newJobs.push(job);
    }
  }

  // 3. Persist new jobs
  let savedCount = 0;
  if (newJobs.length > 0) {
    try {
      await store.saveJobs(newJobs);
      savedCount = newJobs.length;
    } catch (err) {
      errors.push(`Firestore write failed: ${String(err)}`);
    }
  }

  return { newJobs, duplicateIds, savedCount, errors };
}

// ── Firebase implementation of JobStore ──────────────────────────────────────
// Used in production (Vercel functions / scheduler).
// Import firebase-admin only here, not in core package.

export function createFirestoreJobStore(
  db: FirestoreDb
): JobStore {
  return {
    async getExistingIds(ids: string[]): Promise<Set<string>> {
      if (ids.length === 0) return new Set();

      // Firestore: batch get up to 500 docs at once
      const chunks = chunkArray(ids, 500);
      const existing = new Set<string>();

      for (const chunk of chunks) {
        const refs  = chunk.map(id => db.collection("jobs").doc(id));
        const snaps = await db.getAll(...refs);
        snaps.forEach(snap => { if (snap.exists) existing.add(snap.id); });
      }

      return existing;
    },

    async saveJobs(jobs: Job[]): Promise<void> {
      // Firestore: max 500 writes per batch
      const chunks = chunkArray(jobs, 500);

      for (const chunk of chunks) {
        const batch = db.batch();
        for (const job of chunk) {
          const ref = db.collection("jobs").doc(job.id);
          batch.set(ref, serializeJob(job));
        }
        await batch.commit();
      }
    },
  };
}

// ── Serialization ─────────────────────────────────────────────────────────────
// Firestore doesn't accept Date objects in all SDKs — store as ISO strings.

function serializeJob(job: Job): Record<string, unknown> {
  return {
    ...job,
    datePosted: job.datePosted.toISOString(),
    storedAt:   new Date().toISOString(),
    rawData:    undefined, // don't persist raw payload
  };
}

// ── Minimal Firestore type (avoids firebase-admin dep in core) ────────────────

interface FirestoreDoc {
  exists: boolean;
  id: string;
}

interface FirestoreDb {
  collection(path: string): {
    doc(id: string): FirestoreDocRef;
  };
  getAll(...refs: FirestoreDocRef[]): Promise<FirestoreDoc[]>;
  batch(): FirestoreBatch;
}

interface FirestoreDocRef {
  id: string;
}

interface FirestoreBatch {
  set(ref: FirestoreDocRef, data: Record<string, unknown>): void;
  commit(): Promise<void>;
}

// ── Utility ───────────────────────────────────────────────────────────────────

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
