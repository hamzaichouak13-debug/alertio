// ─────────────────────────────────────────────
// ALERTIO — lib/api.ts
// Typed HTTP client for the Vercel API
// Automatically attaches Firebase ID token
// Uses mock API in local development
// ─────────────────────────────────────────────

import { auth } from "./firebase";
import type { Job, UserProfile, MatchResult, Notification } from "../../../../packages/core/src/types";

// Use mock API when no API backend is available (local dev or when API_URL not set)
const USE_MOCK_API = typeof window !== "undefined" && (
  process.env.NEXT_PUBLIC_USE_MOCK_API === "true" ||
  !process.env.NEXT_PUBLIC_API_URL
);

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

// ── Auth token helper ─────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new ApiError(res.status, body.error ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Jobs ──────────────────────────────────────────────────────────────────────

export interface JobsResponse {
  jobs:    Job[];
  count:   number;
  hasMore: boolean;
  cursor:  string | null;
}

export interface JobsFilters {
  romeCode?:   string;
  contract?:   string;
  remote?:     string;
  limit?:      number;
  startAfter?: string;
}

export async function fetchJobs(filters: JobsFilters = {}): Promise<JobsResponse> {
  if (USE_MOCK_API) {
    const { mockFetchJobs } = await import("./api-mock");
    return mockFetchJobs(filters);
  }
  const params = new URLSearchParams();
  if (filters.romeCode)   params.set("romeCode",   filters.romeCode);
  if (filters.contract)   params.set("contract",   filters.contract);
  if (filters.remote)     params.set("remote",     filters.remote);
  if (filters.limit)      params.set("limit",      String(filters.limit));
  if (filters.startAfter) params.set("startAfter", filters.startAfter);

  const qs = params.toString();
  return apiFetch<JobsResponse>(`/jobs${qs ? `?${qs}` : ""}`);
}

export async function fetchJob(id: string): Promise<{ job: Job; match: MatchResult | null }> {
  if (USE_MOCK_API) {
    const { mockFetchJob } = await import("./api-mock");
    return mockFetchJob(id);
  }
  return apiFetch(`/jobs/${id}`);
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function fetchProfile(uid: string): Promise<UserProfile> {
  if (USE_MOCK_API) {
    const { mockFetchProfile } = await import("./api-mock");
    return mockFetchProfile();
  }
  return apiFetch<UserProfile>(`/profile/${uid}`);
}

export async function saveProfile(uid: string, profile: Partial<UserProfile>): Promise<UserProfile> {
  if (USE_MOCK_API) {
    const { mockSaveProfile } = await import("./api-mock");
    return mockSaveProfile(uid, profile);
  }
  return apiFetch<UserProfile>(`/profile/${uid}`, {
    method: "PUT",
    body:   JSON.stringify(profile),
  });
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount:   number;
}

export async function fetchNotifications(limit = 50): Promise<NotificationsResponse> {
  if (USE_MOCK_API) {
    const { mockFetchNotifications } = await import("./api-mock");
    return mockFetchNotifications();
  }
  return apiFetch<NotificationsResponse>(`/notifications?limit=${limit}`);
}

export async function markAsRead(notifId: string): Promise<void> {
  if (USE_MOCK_API) {
    const { mockMarkAsRead } = await import("./api-mock");
    return mockMarkAsRead(notifId);
  }
  return apiFetch<void>(`/notifications?id=${notifId}`, { method: "PATCH" });
}
