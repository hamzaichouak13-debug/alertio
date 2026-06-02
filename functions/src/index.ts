import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";

import { runScheduler, type SchedulerConfig } from "../../packages/core/src/scheduler";
import {
  createJobStore,
  createNotificationService,
  createRunLogger,
  createUserRepository,
} from "../../api/_lib/stores";

function createSchedulerConfig(): SchedulerConfig {
  const clientId = process.env.FRANCE_TRAVAIL_CLIENT_ID;
  const clientSecret = process.env.FRANCE_TRAVAIL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing France Travail env vars: FRANCE_TRAVAIL_CLIENT_ID, FRANCE_TRAVAIL_CLIENT_SECRET"
    );
  }

  return {
    fetchConfig: {
      clientId,
      clientSecret,
      maxResults: 150,
      maxAgeDays: 14,
    },
    jobStore: createJobStore(),
    userRepo: createUserRepository(),
    notifier: createNotificationService(),
    logger: createRunLogger(),
  };
}

export const syncJobs = onSchedule(
  {
    schedule: "every 10 minutes",
    timeZone: "Europe/Paris",
    region: process.env.FUNCTIONS_REGION ?? "europe-west1",
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  async () => {
    logger.info("[scheduler/syncJobs] Starting run");

    const run = await runScheduler(createSchedulerConfig());
    const duration = run.finishedAt
      ? run.finishedAt.getTime() - run.startedAt.getTime()
      : null;

    logger.info("[scheduler/syncJobs] Finished run", {
      status: run.status,
      runId: run.id,
      duration,
      stats: run.stats,
      error: run.error ?? null,
    });

    if (run.status !== "SUCCESS") {
      throw new Error(run.error ?? "Scheduler run failed");
    }
  }
);
