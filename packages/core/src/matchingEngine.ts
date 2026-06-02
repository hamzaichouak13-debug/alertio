// ─────────────────────────────────────────────
// ALERTIO — matchingEngine.ts
// Score-based matching: Job × UserProfile → MatchResult (0–100)
//
// Weights:
//   ROME proximity   40%
//   Skills           35%
//   Sector / NAF     15%
//   Context          10%
// ─────────────────────────────────────────────

import type {
  Job,
  UserProfile,
  MatchResult,
  MatchBreakdown,
  RomeMatchDetail,
  SkillMatchDetail,
  SectorMatchDetail,
} from "./types";

import {
  computeRomeProximity,
  proximityToScore,
} from "./romeTree";

// ── Weights (must sum to 1.0) ─────────────────────────────────────────────────

const W = {
  rome:    0.40,
  skills:  0.35,
  sector:  0.15,
  context: 0.10,
} as const;

// ── Primary skill multiplier ──────────────────────────────────────────────────
// A match on a primary skill is worth more than a generic skill match.
const PRIMARY_SKILL_MULTIPLIER = 1.4;

// ── Main entry point ─────────────────────────────────────────────────────────

export function computeMatch(
  job: Job,
  user: UserProfile,
): MatchResult {
  const rome    = scoreRome(job, user);
  const skills  = scoreSkills(job, user);
  const sector  = scoreSector(job, user);
  const context = scoreContext(job, user);

  const total = Math.round(
    rome.score    * W.rome    +
    skills.total  * W.skills  +
    sector.score  * W.sector  +
    context       * W.context
  );

  const breakdown: MatchBreakdown = {
    rome,
    skills,
    sector,
    context,
    total,
  };

  return {
    jobId:         job.id,
    userId:        user.uid,
    score:         total,
    breakdown,
    shouldNotify:  total >= user.preferences.notificationThreshold,
    computedAt:    new Date(),
  };
}

/**
 * Batch match: one user against many jobs.
 * Returns results sorted by score descending.
 */
export function batchMatch(
  jobs: Job[],
  user: UserProfile,
): MatchResult[] {
  return jobs
    .map(job => computeMatch(job, user))
    .sort((a, b) => b.score - a.score);
}

// ── ROME scoring (40%) ────────────────────────────────────────────────────────

function scoreRome(job: Job, user: UserProfile): RomeMatchDetail {
  const userCodes = user.profile.romeCodes;
  const proximity = computeRomeProximity(job.romeCode, userCodes);
  const score     = proximityToScore(proximity);

  return {
    score,
    matched:   proximity === "EXACT",
    proximity,
    userCodes,
    jobCode:   job.romeCode,
  };
}

// ── Skills scoring (35%) ──────────────────────────────────────────────────────

function scoreSkills(job: Job, user: UserProfile): SkillMatchDetail {
  const jobSkills     = normalizeList(job.skills);
  const userSkills    = normalizeList(user.profile.skills);
  const primarySkills = normalizeList(user.profile.primarySkills);

  if (jobSkills.length === 0 || userSkills.length === 0) {
    return { score: 0, matchedSkills: [], missingSkills: jobSkills, primarySkillBonus: 0, total: 0 };
  }

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  let weightedMatches = 0;

  for (const js of jobSkills) {
    const matched = userSkills.some(us => skillsMatch(us, js));
    if (matched) {
      matchedSkills.push(js);
      const isPrimary = primarySkills.some(ps => skillsMatch(ps, js));
      weightedMatches += isPrimary ? PRIMARY_SKILL_MULTIPLIER : 1;
    } else {
      missingSkills.push(js);
    }
  }

  // Normalize: max possible weighted score if all job skills are primary
  const maxWeighted = jobSkills.length * PRIMARY_SKILL_MULTIPLIER;
  const score       = Math.round((weightedMatches / maxWeighted) * 100);
  const primaryBonus = Math.round(
    matchedSkills
      .filter(ms => primarySkills.some(ps => skillsMatch(ps, ms)))
      .length * 5
  );

  return {
    score,
    matchedSkills,
    missingSkills,
    primarySkillBonus: primaryBonus,
    total: Math.min(100, score + primaryBonus),
  };
}

// ── Sector scoring (15%) ──────────────────────────────────────────────────────

function scoreSector(job: Job, user: UserProfile): SectorMatchDetail {
  const nafMatch = user.profile.nafCodes.some(
    naf => naf.toUpperCase() === job.nafCode.toUpperCase()
  );

  const jobSectorNorm  = job.sector.toLowerCase();
  const sectorLabelMatch = user.profile.sectors.some(
    s => jobSectorNorm.includes(s.toLowerCase()) ||
         s.toLowerCase().includes(jobSectorNorm)
  );

  const score =
    nafMatch && sectorLabelMatch ? 100 :
    nafMatch                     ? 80  :
    sectorLabelMatch             ? 50  : 0;

  return { score, nafMatch, sectorLabelMatch };
}

// ── Context scoring (10%) ─────────────────────────────────────────────────────

function scoreContext(job: Job, user: UserProfile): number {
  const jobText = `${job.title} ${job.description}`.toLowerCase();
  const userTerms = [
    ...user.profile.appellations,
    ...user.profile.themes,
    ...user.profile.contexts,
    ...user.profile.savoir,
    ...user.profile.savoirFaire,
  ].map(t => t.toLowerCase());

  if (userTerms.length === 0) return 0;

  const matched = userTerms.filter(term =>
    jobText.includes(term) || term.split(" ").some(word => word.length > 3 && jobText.includes(word))
  );

  return Math.min(100, Math.round((matched.length / userTerms.length) * 100));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeList(items: string[]): string[] {
  return items.map(s => s.toLowerCase().trim()).filter(Boolean);
}

/**
 * Flexible skill matching: handles substrings and common variations.
 * "react" matches "reactjs", "react.js", "react native" (partially).
 */
function skillsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  // Remove common suffixes like ".js", "js", ".ts"
  const clean = (s: string) => s.replace(/\.?js$|\.?ts$/, "");
  return clean(a) === clean(b) || a.includes(b) || b.includes(a);
}

// ── Score explanation (for UI) ────────────────────────────────────────────────

export function explainScore(result: MatchResult): string {
  const { breakdown } = result;
  const lines: string[] = [
    `Score total : ${result.score}/100`,
    ``,
    `ROME (×${W.rome})     : ${breakdown.rome.score}/100 — ${breakdown.rome.proximity}`,
    `Compétences (×${W.skills}) : ${breakdown.skills.total}/100 — ${breakdown.skills.matchedSkills.length} matchées`,
    `Secteur (×${W.sector})    : ${breakdown.sector.score}/100 — NAF: ${breakdown.sector.nafMatch ? "✓" : "✗"}`,
    `Contexte (×${W.context})  : ${breakdown.context}/100`,
  ];

  if (breakdown.skills.matchedSkills.length > 0) {
    lines.push(``, `Compétences matchées : ${breakdown.skills.matchedSkills.join(", ")}`);
  }
  if (breakdown.skills.missingSkills.length > 0) {
    lines.push(`Compétences manquantes : ${breakdown.skills.missingSkills.join(", ")}`);
  }

  return lines.join("\n");
}
