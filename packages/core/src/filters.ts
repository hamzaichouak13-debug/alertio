// ─────────────────────────────────────────────
// ALERTIO — filters.ts
// Shared filtering utilities used by:
//   - scheduler (pre-matching filter)
//   - api/jobs (server-side query builder)
//   - frontend (client-side filter state)
// ─────────────────────────────────────────────

import type { Job, ContractType, RemoteType } from "./types";

// ── Filter definition ─────────────────────────────────────────────────────────

export interface JobFilters {
  romeCode?:    string;
  contract?:    ContractType;
  remote?:      RemoteType;
  minScore?:    number;       // client-side only — filter by match score
  maxAgeDays?:  number;       // default 14
  city?:        string;
  keyword?:     string;       // free text search in title + description
  salaryMin?:   number;
  limit?:       number;
  startAfter?:  string;       // cursor for pagination
}

// ── Age filter ────────────────────────────────────────────────────────────────

/**
 * Returns true if the job was posted within maxAgeDays.
 * Default: 14 days (as per spec).
 */
export function isRecent(job: Job, maxAgeDays = 14): boolean {
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  return new Date(job.datePosted).getTime() >= cutoff;
}

/**
 * Filters a list of jobs to only recent ones.
 */
export function filterByAge(jobs: Job[], maxAgeDays = 14): Job[] {
  return jobs.filter(j => isRecent(j, maxAgeDays));
}

// ── Contract filter ───────────────────────────────────────────────────────────

export function filterByContract(jobs: Job[], contract: ContractType): Job[] {
  return jobs.filter(j => j.contract === contract);
}

// ── Remote filter ─────────────────────────────────────────────────────────────

export function filterByRemote(jobs: Job[], remote: RemoteType): Job[] {
  return jobs.filter(j => j.location.remote === remote);
}

// ── ROME filter ───────────────────────────────────────────────────────────────

export function filterByRome(jobs: Job[], romeCode: string): Job[] {
  return jobs.filter(j => j.romeCode === romeCode.toUpperCase());
}

// ── Keyword filter ────────────────────────────────────────────────────────────

/**
 * Case-insensitive search in title, description, company, and skills.
 */
export function filterByKeyword(jobs: Job[], keyword: string): Job[] {
  const q = keyword.toLowerCase().trim();
  if (!q) return jobs;
  return jobs.filter(j => {
    const haystack = [
      j.title,
      j.description,
      j.company,
      j.sector,
      ...j.skills,
    ].join(" ").toLowerCase();
    return haystack.includes(q);
  });
}

// ── Salary filter ─────────────────────────────────────────────────────────────

export function filterBySalary(jobs: Job[], minSalary: number): Job[] {
  return jobs.filter(j => {
    if (!j.salary?.min) return true; // include jobs with no salary info
    const yearly = j.salary.period === "MONTHLY" ? j.salary.min * 12
                 : j.salary.period === "DAILY"   ? j.salary.min * 220
                 : j.salary.period === "HOURLY"  ? j.salary.min * 1760
                 : j.salary.min;
    return yearly >= minSalary;
  });
}

// ── Combined filter ───────────────────────────────────────────────────────────

/**
 * Apply all filters from a JobFilters object in one pass.
 * Used by the scheduler before running matchingEngine,
 * and by the frontend for instant client-side filtering.
 */
export function applyFilters(jobs: Job[], filters: JobFilters): Job[] {
  let result = [...jobs];

  if (filters.maxAgeDays !== undefined) {
    result = filterByAge(result, filters.maxAgeDays);
  }
  if (filters.romeCode) {
    result = filterByRome(result, filters.romeCode);
  }
  if (filters.contract) {
    result = filterByContract(result, filters.contract);
  }
  if (filters.remote) {
    result = filterByRemote(result, filters.remote);
  }
  if (filters.keyword) {
    result = filterByKeyword(result, filters.keyword);
  }
  if (filters.salaryMin) {
    result = filterBySalary(result, filters.salaryMin);
  }
  if (filters.limit) {
    result = result.slice(0, filters.limit);
  }

  return result;
}

// ── URL query params ↔ JobFilters ─────────────────────────────────────────────
// Used in api/jobs/index.ts to parse query string into typed filters.

export function parseQueryFilters(query: Record<string, string | string[] | undefined>): JobFilters {
  const str = (k: string) => {
    const v = query[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const num = (k: string) => {
    const v = str(k);
    if (!v) return undefined;
    const n = parseInt(v, 10);
    return isNaN(n) ? undefined : n;
  };

  return {
    romeCode:   str("romeCode"),
    contract:   str("contract")  as ContractType | undefined,
    remote:     str("remote")    as RemoteType   | undefined,
    keyword:    str("keyword"),
    salaryMin:  num("salaryMin"),
    maxAgeDays: num("maxAgeDays") ?? 14,
    limit:      num("limit")      ?? 20,
    startAfter: str("startAfter"),
  };
}

// ── Active filter count (for UI badge) ────────────────────────────────────────

export function countActiveFilters(filters: JobFilters): number {
  return [
    filters.romeCode,
    filters.contract,
    filters.remote,
    filters.keyword,
    filters.salaryMin,
  ].filter(Boolean).length;
}
