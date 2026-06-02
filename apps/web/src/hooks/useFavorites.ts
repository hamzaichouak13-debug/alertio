// ─────────────────────────────────────────────
// ALERTIO — hooks/useFavorites.ts
// Favorites persisted in Firestore
// Collection: users/{uid}/favorites/{jobId}
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  collection, doc, setDoc, deleteDoc,
  getDocs, serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import type { Job }  from "../../../../packages/core/src/types";

export interface FavoriteEntry {
  jobId:     string;
  savedAt:   Date;
  job?:      Job;  // cached snapshot at save time
}

export interface UseFavoritesState {
  favorites:  FavoriteEntry[];
  favIds:     Set<string>;
  loading:    boolean;
}

export interface UseFavoritesActions {
  toggle(job: Job): Promise<void>;
  isFaved(jobId: string): boolean;
}

export function useFavorites(): UseFavoritesState & UseFavoritesActions {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [loading,   setLoading]   = useState(true);

  const uid = auth.currentUser?.uid;

  // Load favorites from Firestore on mount
  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    const ref = collection(db, "users", uid, "favorites");
    getDocs(ref)
      .then(snap => {
        const entries: FavoriteEntry[] = snap.docs.map(d => ({
          jobId:   d.id,
          savedAt: new Date(d.data().savedAt?.toDate?.() ?? d.data().savedAt),
          job:     d.data().job as Job | undefined,
        }));
        setFavorites(entries);
      })
      .catch(() => {}) // silent fail — favorites are non-critical
      .finally(() => setLoading(false));
  }, [uid]);

  const favIds = new Set(favorites.map(f => f.jobId));

  const toggle = useCallback(async (job: Job) => {
    if (!uid) return;

    const ref = doc(db, "users", uid, "favorites", job.id);

    if (favIds.has(job.id)) {
      // Remove
      await deleteDoc(ref);
      setFavorites(prev => prev.filter(f => f.jobId !== job.id));
    } else {
      // Add — store a snapshot of the job for offline/favorites page display
      const entry: FavoriteEntry = { jobId: job.id, savedAt: new Date(), job };
      await setDoc(ref, {
        jobId:   job.id,
        savedAt: serverTimestamp(),
        job: {
          id:          job.id,
          title:       job.title,
          company:     job.company,
          romeCode:    job.romeCode,
          contract:    job.contract,
          location:    job.location,
          salary:      job.salary ?? null,
          skills:      job.skills,
          datePosted:  job.datePosted instanceof Date
            ? job.datePosted.toISOString()
            : job.datePosted,
          sourceUrl:   job.sourceUrl,
        },
      });
      setFavorites(prev => [...prev, entry]);
    }
  }, [uid, favIds]);

  const isFaved = useCallback(
    (jobId: string) => favIds.has(jobId),
    [favIds]
  );

  return { favorites, favIds, loading, toggle, isFaved };
}
