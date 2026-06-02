// ─────────────────────────────────────────────
// ALERTIO — scheduler.ts
// The main scheduler pipeline. Runs every 10 minutes in production.
//
// Pipeline:
//   1. Fetch offers from France Travail API
//   2. Normalize raw payload → Job[]
//   3. Deduplicate against Firestore
//   4. For each new job: batch match against all users
//   5. Send FCM push for matches above threshold
//   6. Log scheduler run stats
// ─────────────────────────────────────────────

import type { Job, UserProfile, MatchResult, SchedulerRun } from "./types";
import type { FetchConfig }                                   from "./jobFetcher";
import type { JobStore }                                      from "./deduplicator";
import { fetchJobs }                                          from "./jobFetcher";
import { normalizeOffers }                                    from "./jobNormalizer";
import { deduplicateAndSave }                                 from "./deduplicator";
import { batchMatch }                                         from "./matchingEngine";
import { expandRomeCodes }                                    from "./romeTree";

// ── External service interfaces (injected, not imported directly) ─────────────

export interface UserRepository {
  /** Returns all active users with their profiles */
  getAllUsers(): Promise<UserProfile[]>;
}

export interface NotificationService {
  /** Sends a push notification for a high-score match */
  sendMatchNotification(user: UserProfile, job: Job, match: MatchResult): Promise<void>;
}

export interface RunLogger {
  /** Persists scheduler run stats to Firestore */
  logRun(run: SchedulerRun): Promise<void>;
}

// ── Scheduler config ──────────────────────────────────────────────────────────

export interface SchedulerConfig {
  fetchConfig:   FetchConfig;
  jobStore:      JobStore;
  userRepo:      UserRepository;
  notifier:      NotificationService;
  logger:        RunLogger;
  /** Override ROME codes to fetch — defaults to expanding all user codes */
  romeCodes?:    string[];
}

// ── Main pipeline ─────────────────────────────────────────────────────────────

export async function runScheduler(config: SchedulerConfig): Promise<SchedulerRun> {
  const runId    = `run_${Date.now()}`;
  const startedAt = new Date();

  const run: SchedulerRun = {
    id: runId,
    startedAt,
    status: "RUNNING",
    stats: {
      jobsFetched:        0,
      jobsNew:            0,
      jobsDuplicate:      0,
      matchesComputed:    0,
      notificationsSent:  0,
    },
  };

  try {
    // ── Step 1: Load users (needed to target ROME codes) ──────────────────────
    const users = await config.userRepo.getAllUsers();
    if (users.length === 0) {
      const done = finalize(run, "SUCCESS");
      await config.logger.logRun(done).catch(() => {});
      return done;
    }

    // Build the union of all user ROME codes + auto-expand to adjacent codes
    const allUserRomeCodes = users.flatMap(u => u.profile.romeCodes);
    const romeCodes = config.romeCodes ?? expandRomeCodes(allUserRomeCodes);

    // ── Step 2: Fetch from France Travail API ─────────────────────────────────
    const fetchResult = await fetchJobs(config.fetchConfig, romeCodes);

    if (fetchResult.errors.length > 0) {
      // If we got errors AND no results, treat as fatal
      if (fetchResult.raw.length === 0) {
        throw new Error(fetchResult.errors.join("; "));
      }
      console.warn("[scheduler] Fetch warnings:", fetchResult.errors);
    }

    run.stats.jobsFetched = fetchResult.raw.length;

    // ── Step 3: Normalize ─────────────────────────────────────────────────────
    const { jobs: normalized, errors: normErrors } = normalizeOffers(fetchResult.raw);
    if (normErrors.length > 0) {
      console.warn("[scheduler] Normalization warnings:", normErrors);
    }

    // ── Step 4: Deduplicate & persist ─────────────────────────────────────────
    const dedupResult = await deduplicateAndSave(normalized, config.jobStore);
    if (dedupResult.errors.length > 0) {
      console.warn("[scheduler] Dedup errors:", dedupResult.errors);
    }

    run.stats.jobsNew       = dedupResult.savedCount;
    run.stats.jobsDuplicate = dedupResult.duplicateIds.length;

    const newJobs = dedupResult.newJobs;
    if (newJobs.length === 0) {
      const done = finalize(run, "SUCCESS");
      await config.logger.logRun(done).catch(() => {});
      return done;
    }

    // ── Step 5: Match new jobs against all users ──────────────────────────────
    const notifications: Promise<void>[] = [];

    for (const user of users) {
      const results = batchMatch(newJobs, user);
      run.stats.matchesComputed += results.length;

      for (const match of results) {
        if (!match.shouldNotify) continue;

        const job = newJobs.find(j => j.id === match.jobId);
        if (!job) continue;

        // Fire-and-forget — collect promises to await at the end
        notifications.push(
          config.notifier
            .sendMatchNotification(user, job, match)
            .then(() => { run.stats.notificationsSent++; })
            .catch(err => console.error(`[scheduler] Notif failed for ${user.uid}:`, err))
        );
      }
    }

    // Wait for all notifications (with a global timeout)
    await Promise.race([
      Promise.all(notifications),
      sleep(10_000), // 10s max — don't block the run
    ]);

    const finalRun = finalize(run, "SUCCESS");
    await config.logger.logRun(finalRun).catch(e =>
      console.error("[scheduler] Failed to log run:", e)
    );
    return finalRun;

  } catch (err) {
    run.error = String(err);
    console.error("[scheduler] Fatal error:", err);
    const errorRun = finalize(run, "ERROR");
    await config.logger.logRun(errorRun).catch(e =>
      console.error("[scheduler] Failed to log run:", e)
    );
    return errorRun;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function finalize(run: SchedulerRun, status: SchedulerRun["status"]): SchedulerRun {
  return { ...run, status, finishedAt: new Date() };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Manual HTTP handler (thin wrapper) ───────────────────────────────────────
// Used by /api/cron/sync.ts for protected manual/internal runs.

export function createVercelCronHandler(config: SchedulerConfig) {
  return async function handler(
    req: { method?: string; headers?: Record<string, string | string[] | undefined> },
    res: { status(code: number): { json(body: unknown): void } }
  ) {
    // Block external calls unless they know the internal secret.
    const authHeader = req.headers?.["authorization"];
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const run = await runScheduler(config);

    const code = run.status === "SUCCESS" ? 200 : 500;
    return res.status(code).json({
      status:    run.status,
      duration:  run.finishedAt
        ? run.finishedAt.getTime() - run.startedAt.getTime()
        : null,
      stats:     run.stats,
      error:     run.error ?? null,
    });
  };
}
