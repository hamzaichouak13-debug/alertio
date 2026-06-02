// ─────────────────────────────────────────────
// ALERTIO — hooks/useOffline.ts
// Light offline mode for Capacitor (iOS/Android)
// Caches last fetched jobs in localStorage
// Falls back to cache when network unavailable
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import type { Job } from "../../../../packages/core/src/types";

const CACHE_KEY     = "alertio_jobs_cache";
const CACHE_TS_KEY  = "alertio_jobs_cache_ts";
const MAX_CACHE_AGE = 60 * 60 * 1000; // 1 hour

export interface OfflineState {
  isOnline:    boolean;
  isFromCache: boolean;
  cacheAge:    number | null; // ms since last cache
}

export interface OfflineActions {
  saveToCache(jobs: Job[]): void;
  loadFromCache(): Job[] | null;
  clearCache(): void;
}

export function useOffline(): OfflineState & OfflineActions {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  // Track online/offline events
  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const saveToCache = useCallback((jobs: Job[]) => {
    try {
      // Store only essential fields to stay under localStorage limits
      const slim = jobs.map(j => ({
        id:          j.id,
        title:       j.title,
        company:     j.company,
        romeCode:    j.romeCode,
        contract:    j.contract,
        location:    j.location,
        salary:      j.salary,
        skills:      j.skills.slice(0, 8),
        datePosted:  j.datePosted instanceof Date
          ? j.datePosted.toISOString()
          : j.datePosted,
        sourceUrl:   j.sourceUrl,
        description: j.description?.slice(0, 300) ?? "",
        sector:      j.sector,
        nafCode:     j.nafCode,
        romeLabel:   j.romeLabel,
      }));

      localStorage.setItem(CACHE_KEY,    JSON.stringify(slim));
      localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
    } catch {
      // localStorage can be full — fail silently
    }
  }, []);

  const loadFromCache = useCallback((): Job[] | null => {
    try {
      const ts   = localStorage.getItem(CACHE_TS_KEY);
      const data = localStorage.getItem(CACHE_KEY);
      if (!data || !ts) return null;

      const age = Date.now() - parseInt(ts, 10);
      if (age > MAX_CACHE_AGE) return null; // cache too old

      const parsed = JSON.parse(data) as Array<Record<string, unknown>>;
      return parsed.map(j => ({
        ...j,
        datePosted: new Date(j.datePosted as string),
      })) as Job[];
    } catch {
      return null;
    }
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TS_KEY);
  }, []);

  // Compute cache age
  const cacheTs  = typeof window !== "undefined"
    ? localStorage.getItem(CACHE_TS_KEY) : null;
  const cacheAge = cacheTs ? Date.now() - parseInt(cacheTs, 10) : null;

  const isFromCache = !isOnline && cacheAge !== null && cacheAge <= MAX_CACHE_AGE;

  return {
    isOnline,
    isFromCache,
    cacheAge,
    saveToCache,
    loadFromCache,
    clearCache,
  };
}
