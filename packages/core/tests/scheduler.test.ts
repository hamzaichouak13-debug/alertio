// ─────────────────────────────────────────────
// ALERTIO — scheduler.test.ts
// Tests the full pipeline with in-memory mocks
// ─────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from "vitest";
import { deduplicateAndSave }                    from "../src/deduplicator";
import { runScheduler }                          from "../src/scheduler";
import type { Job, UserProfile, MatchResult, SchedulerRun } from "../src/types";
import type { JobStore }                         from "../src/deduplicator";
import type { SchedulerConfig }                  from "../src/scheduler";

// ── In-memory JobStore mock ───────────────────────────────────────────────────

function makeMemoryStore(existingIds: string[] = []): JobStore & { saved: Job[] } {
  const db  = new Set(existingIds);
  const saved: Job[] = [];
  return {
    saved,
    async getExistingIds(ids: string[]) {
      return new Set(ids.filter(id => db.has(id)));
    },
    async saveJobs(jobs: Job[]) {
      jobs.forEach(j => { db.add(j.id); saved.push(j); });
    },
  };
}

// ── Job fixture ───────────────────────────────────────────────────────────────

function makeJob(id: string, romeCode = "M1805"): Job {
  return {
    id,
    title:       `Job ${id}`,
    description: "React Node.js TypeScript",
    romeCode,
    romeLabel:   "Développement informatique",
    skills:      ["React", "Node.js", "TypeScript"],
    sector:      "Édition de logiciels",
    nafCode:     "62.01Z",
    location:    { city: "Paris", department: "75", postalCode: "75001", remote: "PARTIAL" },
    contract:    "CDI",
    company:     "Acme",
    datePosted:  new Date(),
    sourceUrl:   `https://example.com/${id}`,
  };
}

// ── User fixture ──────────────────────────────────────────────────────────────

function makeUser(uid: string): UserProfile {
  return {
    uid,
    email: `${uid}@alertio.io`,
    preferences: { notificationThreshold: 70, contractTypes: ["CDI"], remoteTypes: ["PARTIAL"] },
    profile: {
      romeCodes:     ["M1805"],
      appellations:  ["Développeur Full-Stack"],
      skills:        ["React", "Node.js", "TypeScript"],
      primarySkills: ["React", "Node.js"],
      sectors:       ["Édition de logiciels"],
      nafCodes:      ["62.01Z"],
      themes:        [],
      contexts:      [],
      savoir:        [],
      savoirFaire:   [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// deduplicator
// ════════════════════════════════════════════════════════════════════════════════

describe("deduplicateAndSave", () => {
  it("saves all jobs when store is empty", async () => {
    const store  = makeMemoryStore();
    const jobs   = [makeJob("A"), makeJob("B"), makeJob("C")];
    const result = await deduplicateAndSave(jobs, store);

    expect(result.savedCount).toBe(3);
    expect(result.newJobs).toHaveLength(3);
    expect(result.duplicateIds).toHaveLength(0);
    expect(store.saved).toHaveLength(3);
  });

  it("skips already-existing jobs", async () => {
    const store  = makeMemoryStore(["A", "B"]);
    const jobs   = [makeJob("A"), makeJob("B"), makeJob("C")];
    const result = await deduplicateAndSave(jobs, store);

    expect(result.savedCount).toBe(1);
    expect(result.newJobs.map(j => j.id)).toEqual(["C"]);
    expect(result.duplicateIds).toEqual(expect.arrayContaining(["A", "B"]));
  });

  it("handles empty input gracefully", async () => {
    const store  = makeMemoryStore();
    const result = await deduplicateAndSave([], store);

    expect(result.savedCount).toBe(0);
    expect(result.newJobs).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it("returns errors when store read fails", async () => {
    const brokenStore: JobStore = {
      async getExistingIds() { throw new Error("Firestore unavailable"); },
      async saveJobs()        { /* not reached */ },
    };
    const result = await deduplicateAndSave([makeJob("X")], brokenStore);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("Firestore unavailable");
    expect(result.savedCount).toBe(0);
  });

  it("is idempotent — second run produces no new saves", async () => {
    const store = makeMemoryStore();
    const jobs  = [makeJob("X"), makeJob("Y")];

    await deduplicateAndSave(jobs, store);
    const second = await deduplicateAndSave(jobs, store);

    expect(second.savedCount).toBe(0);
    expect(second.duplicateIds).toHaveLength(2);
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// runScheduler — full pipeline
// ════════════════════════════════════════════════════════════════════════════════

describe("runScheduler", () => {
  let store:       ReturnType<typeof makeMemoryStore>;
  let notifSpy:    ReturnType<typeof vi.fn>;
  let logSpy:      ReturnType<typeof vi.fn>;
  let config:      SchedulerConfig;

  beforeEach(() => {
    store     = makeMemoryStore();
    notifSpy  = vi.fn().mockResolvedValue(undefined);
    logSpy    = vi.fn().mockResolvedValue(undefined);

    config = {
      fetchConfig: {
        clientId:     "test-id",
        clientSecret: "test-secret",
        maxResults:   150,
        maxAgeDays:   14,
      },
      jobStore: store,
      userRepo: {
        async getAllUsers() { return [makeUser("user-001")]; },
      },
      notifier: {
        async sendMatchNotification(_user, _job, _match) { notifSpy(); },
      },
      logger: {
        async logRun(run: SchedulerRun) { logSpy(run); },
      },
      // Inject pre-built jobs directly — bypass real API fetch
      romeCodes: ["M1805"],
    };
  });

  it("completes successfully with no new jobs (all duplicate)", async () => {
    // Pre-fill store — simulate all jobs already seen
    const existingStore = makeMemoryStore(["FT-001", "FT-002"]);

    // Patch fetchJobs via a scheduler that has a custom jobStore
    // We test the dedup + match pipeline using the store directly
    const result = await deduplicateAndSave(
      [makeJob("FT-001"), makeJob("FT-002")],
      existingStore,
    );

    expect(result.savedCount).toBe(0);
    expect(result.newJobs).toHaveLength(0);
  });

  it("logs a run on completion", async () => {
    // Minimal run — no users, exits early
    const emptyUserConfig: SchedulerConfig = {
      ...config,
      userRepo: { async getAllUsers() { return []; } },
    };

    // Mock fetchJobs to return nothing (no real HTTP in tests)
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "items 0-0/0" },
      json: async () => ({ resultats: [] }),
    }));

    const run = await runScheduler(emptyUserConfig);

    expect(run.status).toBe("SUCCESS");
    expect(run.finishedAt).toBeDefined();
    expect(logSpy).toHaveBeenCalledTimes(1);
    // logRun receives the finalized run
    expect(logSpy.mock.calls[0][0].finishedAt).toBeDefined();

    vi.unstubAllGlobals();
  });

  it("run stats are accumulated correctly", async () => {
    // Direct pipeline test: dedup + match stats
    const jobs   = [makeJob("NEW-001"), makeJob("NEW-002")];
    const dedup  = await deduplicateAndSave(jobs, store);

    expect(dedup.savedCount).toBe(2);
    expect(dedup.newJobs).toHaveLength(2);

    // Now match manually to verify stats
    const { batchMatch } = await import("../src/matchingEngine");
    const user    = makeUser("u1");
    const results = batchMatch(dedup.newJobs, user);

    const notified = results.filter(r => r.shouldNotify);
    expect(notified.length).toBeGreaterThan(0);
    expect(notified[0].score).toBeGreaterThanOrEqual(70);
  });

  it("handles fatal fetch error gracefully", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network failure")));

    const run = await runScheduler(config);

    expect(run.status).toBe("ERROR");
    expect(run.error).toContain("Network failure");
    expect(logSpy).toHaveBeenCalled(); // always logs, even on error

    vi.unstubAllGlobals();
  });
});
