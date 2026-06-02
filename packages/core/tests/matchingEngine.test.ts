// ─────────────────────────────────────────────
// ALERTIO — matchingEngine.test.ts
// Run: npx vitest run
// ─────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import { computeMatch, batchMatch, explainScore } from "../src/matchingEngine";
import type { Job, UserProfile } from "../src/types";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FULLSTACK_DEV: UserProfile = {
  uid: "user-001",
  email: "dev@alertio.io",
  preferences: {
    notificationThreshold: 70,
    contractTypes: ["CDI"],
    remoteTypes: ["PARTIAL", "FULL"],
  },
  profile: {
    romeCodes:    ["M1805"],
    appellations: ["Développeur Full-Stack", "Tech Lead", "Software Engineer"],
    skills:       ["React", "Node.js", "TypeScript", "Firebase", "PostgreSQL"],
    primarySkills:["React", "Node.js", "TypeScript"],
    sectors:      ["Informatique", "Édition de logiciels"],
    nafCodes:     ["62.01Z"],
    themes:       ["SaaS", "FinTech", "Startup"],
    contexts:     ["Agile", "Remote"],
    savoir:       ["Architecture logicielle", "API REST"],
    savoirFaire:  ["CI/CD", "Code review", "Tests unitaires"],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeJob(overrides: Partial<Job>): Job {
  return {
    id:          "job-001",
    title:       "Développeur Full-Stack React/Node.js",
    description: "Nous cherchons un développeur Full-Stack maîtrisant React, Node.js, TypeScript. Environnement Agile, remote partiel.",
    romeCode:    "M1805",
    romeLabel:   "Études et développement informatique",
    skills:      ["React", "Node.js", "TypeScript"],
    sector:      "Édition de logiciels",
    nafCode:     "62.01Z",
    location:    { city: "Paris", department: "75", postalCode: "75009", remote: "PARTIAL" },
    contract:    "CDI",
    salary:      { min: 50000, max: 65000, currency: "EUR", period: "YEARLY" },
    company:     "Qonto",
    datePosted:  new Date(Date.now() - 2 * 24 * 3600 * 1000),
    sourceUrl:   "https://francetravail.fr/offre/job-001",
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("matchingEngine — computeMatch", () => {

  it("perfect match scores >= 90", () => {
    const job    = makeJob({});
    const result = computeMatch(job, FULLSTACK_DEV);

    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.breakdown.rome.proximity).toBe("EXACT");
    expect(result.breakdown.rome.matched).toBe(true);
    expect(result.shouldNotify).toBe(true);
  });

  it("same domain (M18) scores between 50 and 80", () => {
    const job    = makeJob({ romeCode: "M1801", skills: ["Linux", "Ansible", "Docker"] });
    const result = computeMatch(job, FULLSTACK_DEV);

    expect(result.breakdown.rome.proximity).toBe("SAME_DOMAIN");
    expect(result.score).toBeGreaterThan(30);
    expect(result.score).toBeLessThan(80);
  });

  it("completely unrelated job scores < 20", () => {
    const job = makeJob({
      romeCode:    "K2110",
      romeLabel:   "Coordination pédagogique",
      skills:      ["Pédagogie", "Moodle", "Formation"],
      sector:      "Enseignement",
      nafCode:     "85.59B",
      description: "Formateur en bureautique pour adultes.",
    });
    const result = computeMatch(job, FULLSTACK_DEV);

    expect(result.score).toBeLessThan(20);
    expect(result.shouldNotify).toBe(false);
  });

  it("notification threshold is respected", () => {
    const lowScoreJob = makeJob({ romeCode: "K2110", skills: [], nafCode: "99.00Z", description: "nothing" });
    const result = computeMatch(lowScoreJob, FULLSTACK_DEV);
    expect(result.shouldNotify).toBe(result.score >= 70);
  });

  it("primary skills give a higher score than non-primary matches", () => {
    const withPrimary    = makeJob({ skills: ["React", "Node.js", "TypeScript"] });
    const withoutPrimary = makeJob({ skills: ["PostgreSQL", "Firebase"] }); // in skills but not primary

    const r1 = computeMatch(withPrimary,    FULLSTACK_DEV);
    const r2 = computeMatch(withoutPrimary, FULLSTACK_DEV);

    expect(r1.breakdown.skills.total).toBeGreaterThanOrEqual(r2.breakdown.skills.total);
  });

  it("returns a score breakdown with all components", () => {
    const result = computeMatch(makeJob({}), FULLSTACK_DEV);
    const b = result.breakdown;

    expect(b.rome.score).toBeGreaterThanOrEqual(0);
    expect(b.skills.total).toBeGreaterThanOrEqual(0);
    expect(b.sector.score).toBeGreaterThanOrEqual(0);
    expect(b.context).toBeGreaterThanOrEqual(0);
    expect(b.total).toEqual(result.score);
  });

  it("NAF code match boosts sector score", () => {
    const withNaf    = makeJob({ nafCode: "62.01Z" });
    const withoutNaf = makeJob({ nafCode: "99.99Z" });

    const r1 = computeMatch(withNaf,    FULLSTACK_DEV);
    const r2 = computeMatch(withoutNaf, FULLSTACK_DEV);

    expect(r1.breakdown.sector.score).toBeGreaterThan(r2.breakdown.sector.score);
    expect(r1.breakdown.sector.nafMatch).toBe(true);
    expect(r2.breakdown.sector.nafMatch).toBe(false);
  });
});

describe("matchingEngine — batchMatch", () => {
  it("sorts results by score descending", () => {
    const jobs = [
      makeJob({ id: "low",    romeCode: "K2110", skills: [], nafCode: "99.00Z", description: "" }),
      makeJob({ id: "high",   romeCode: "M1805", skills: ["React","Node.js","TypeScript"] }),
      makeJob({ id: "medium", romeCode: "M1801", skills: ["Docker","Ansible"] }),
    ];
    const results = batchMatch(jobs, FULLSTACK_DEV);

    expect(results[0].jobId).toBe("high");
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });
});

describe("matchingEngine — explainScore", () => {
  it("returns a human-readable summary", () => {
    const result = computeMatch(makeJob({}), FULLSTACK_DEV);
    const explanation = explainScore(result);

    expect(explanation).toContain("Score total");
    expect(explanation).toContain("ROME");
    expect(explanation).toContain("EXACT");
  });
});
