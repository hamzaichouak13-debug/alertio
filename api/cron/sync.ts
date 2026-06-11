// ─────────────────────────────────────────────
// ALERTIO — api/cron/sync.ts
// Manual/internal scheduler endpoint.
// Production scheduling is handled by Firebase Scheduler:
// functions/src/index.ts -> syncJobs.
//
// Security: callers must set Authorization: Bearer <CRON_SECRET>
// Set CRON_SECRET in Vercel dashboard env vars.
// ─────────────────────────────────────────────

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { runScheduler }             from "../../packages/core/src/scheduler";
import { createJobStore }           from "../_lib/stores";
import { createUserRepository }     from "../_lib/stores";
import { createNotificationService } from "../_lib/stores";
import { createRunLogger }          from "../_lib/stores";

// Build the scheduler config once (reused across warm invocations)
const schedulerConfig = {
  fetchConfig: {
    clientId:     process.env.FRANCE_TRAVAIL_CLIENT_ID!,
    clientSecret: process.env.FRANCE_TRAVAIL_CLIENT_SECRET!,
    maxResults:   1000,
    maxAgeDays:   14,
  },
  jobStore:  createJobStore(),
  userRepo:  createUserRepository(),
  notifier:  createNotificationService(),
  logger:    createRunLogger(),
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ── Security: only allow protected manual/internal calls ──────────────────
  const authHeader = req.headers["authorization"] ?? "";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  console.log(`[manual/sync] Starting run at ${new Date().toISOString()}`);

  const run = await runScheduler(schedulerConfig);

  const duration = run.finishedAt
    ? run.finishedAt.getTime() - run.startedAt.getTime()
    : null;

  console.log(`[manual/sync] Finished — status: ${run.status}, duration: ${duration}ms`, run.stats);

  res.status(run.status === "SUCCESS" ? 200 : 500).json({
    status:   run.status,
    runId:    run.id,
    duration,
    stats:    run.stats,
    error:    run.error ?? null,
  });
}
