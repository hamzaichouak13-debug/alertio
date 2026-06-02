// ─────────────────────────────────────────────
// ALERTIO — api/jobs/index.ts
// GET  /api/jobs          → list jobs (filtered, paginated)
// ─────────────────────────────────────────────
//
// Query params:
//   romeCode    string    filter by ROME code
//   contract    string    CDI | CDD | INTERIM | ...
//   remote      string    NONE | PARTIAL | FULL
//   limit       number    default 20, max 100
//   startAfter  string    cursor (last job ID) for pagination
//
// Auth: required (Firebase ID token)

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth, withErrorHandler, ok, setCors } from "../_lib/auth";
import { queryJobs } from "../_lib/stores";

export default withErrorHandler(async (req: VercelRequest, res: VercelResponse) => {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  await requireAuth(req);

  const { romeCode, contract, remote, limit, startAfter } = req.query;

  const jobs = await queryJobs({
    romeCode:   asString(romeCode),
    contract:   asString(contract),
    remote:     asString(remote),
    limit:      asInt(limit, 20),
    startAfter: asString(startAfter),
  });

  ok(res, {
    jobs,
    count:    jobs.length,
    hasMore:  jobs.length === asInt(limit, 20),
    // Return last ID as cursor for next page
    cursor:   jobs.length > 0 ? jobs[jobs.length - 1].id : null,
  });
});

function asString(val: string | string[] | undefined): string | undefined {
  return Array.isArray(val) ? val[0] : val;
}

function asInt(val: string | string[] | undefined, fallback: number): number {
  const s = asString(val);
  if (!s) return fallback;
  const n = parseInt(s, 10);
  return isNaN(n) ? fallback : n;
}
