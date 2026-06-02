// ─────────────────────────────────────────────
// ALERTIO — hooks/useJobs.ts
// Paginated job list with filter state,
// auto-refresh every 10 min, and load-more.
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchJobs, type JobsFilters } from "../lib/api";
import { useOffline }                    from "./useOffline";
import type { Job } from "../../../../packages/core/src/types";

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export interface UseJobsState {
  jobs:        Job[];
  loading:     boolean;
  loadingMore: boolean;
  error:       string | null;
  hasMore:     boolean;
  lastRefresh: Date | null;
  filters:     JobsFilters;
}

export interface UseJobsActions {
  setFilters(filters: Partial<JobsFilters>): void;
  loadMore(): Promise<void>;
  refresh(): Promise<void>;
}

export function useJobs(initialFilters: JobsFilters = {}): UseJobsState & UseJobsActions {
  const [jobs,        setJobs]        = useState<Job[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [hasMore,     setHasMore]     = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [filters,     setFiltersState] = useState<JobsFilters>({ limit: 20, ...initialFilters });

  const cursorRef = useRef<string | null>(null);
  const { isOnline, saveToCache, loadFromCache } = useOffline();

  // ── Initial load + filter change ──────────────────────────────────────────
  const load = useCallback(async (currentFilters: JobsFilters) => {
    setLoading(true);
    setError(null);
    cursorRef.current = null;

    try {
      const res = await fetchJobs({ ...currentFilters, startAfter: undefined });
      setJobs(res.jobs);
      setHasMore(res.hasMore);
      cursorRef.current = res.cursor;
      setLastRefresh(new Date());
      saveToCache(res.jobs);
    } catch (err: unknown) {
      // Try offline cache before showing error
      const cached = loadFromCache();
      if (cached && cached.length > 0) {
        setJobs(cached);
        setHasMore(false);
      } else {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filters);
  }, [filters, load]);

  // ── Auto-refresh every 10 min ─────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => load(filters), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [filters, load]);

  // ── Load more (pagination) ────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;
    setLoadingMore(true);

    try {
      const res = await fetchJobs({ ...filters, startAfter: cursorRef.current });
      setJobs(prev => [...prev, ...res.jobs]);
      setHasMore(res.hasMore);
      cursorRef.current = res.cursor;
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoadingMore(false);
    }
  }, [filters, hasMore, loadingMore]);

  // ── Set filters (resets to page 1) ────────────────────────────────────────
  const setFilters = useCallback((partial: Partial<JobsFilters>) => {
    setFiltersState(prev => ({ ...prev, ...partial }));
  }, []);

  const refresh = useCallback(() => load(filters), [filters, load]);

  return {
    jobs, loading, loadingMore, error, hasMore, lastRefresh, filters,
    setFilters, loadMore, refresh,
  };
}
