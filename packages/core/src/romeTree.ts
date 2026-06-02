// ─────────────────────────────────────────────
// ALERTIO — romeTree.ts
// Hierarchical ROME code system
// Used by matchingEngine to compute code proximity
// ─────────────────────────────────────────────

import type { RomeProximity } from "./types";

export interface RomeNode {
  code: string;       // "M1805"
  label: string;      // "Études et développement informatique"
  domain: string;     // "M" — grand domaine (lettre)
  subDomain: string;  // "18" — sous-domaine (2 chiffres)
  relatedCodes: string[];
  keywords: string[]; // for fuzzy label matching
}

// ── Minimal embedded ROME tree (IT/Digital focus for MVP) ───────────────────
// In production: load from Firestore or a static JSON built from the official
// France Travail ROME referential download.

const ROME_NODES: RomeNode[] = [
  // M — Support à l'entreprise
  { code: "M1801", label: "Administration de systèmes d'information",     domain: "M", subDomain: "18", relatedCodes: ["M1802","M1805"], keywords: ["sysadmin","infrastructure","réseau","système"] },
  { code: "M1802", label: "Expertise et support en systèmes d'information",domain: "M", subDomain: "18", relatedCodes: ["M1801","M1805"], keywords: ["support","helpdesk","technicien","systèmes"] },
  { code: "M1803", label: "Direction des systèmes d'information",          domain: "M", subDomain: "18", relatedCodes: ["M1805","M1806"], keywords: ["DSI","directeur","CTO","SI","stratégie"] },
  { code: "M1804", label: "Études et développement de réseaux",            domain: "M", subDomain: "18", relatedCodes: ["M1801","M1805"], keywords: ["réseau","télécoms","infrastructure réseau"] },
  { code: "M1805", label: "Études et développement informatique",          domain: "M", subDomain: "18", relatedCodes: ["M1806","M1810","M1801"], keywords: ["développeur","dev","software","fullstack","backend","frontend","react","node","python","java"] },
  { code: "M1806", label: "Conseil et maîtrise d'ouvrage SI",              domain: "M", subDomain: "18", relatedCodes: ["M1803","M1805"], keywords: ["consultant","MOA","MOE","chef de projet","product manager"] },
  { code: "M1807", label: "Exploitation de systèmes de communication",     domain: "M", subDomain: "18", relatedCodes: ["M1801","M1804"], keywords: ["exploitation","opérateur","monitoring"] },
  { code: "M1810", label: "Production et exploitation de systèmes d'information", domain: "M", subDomain: "18", relatedCodes: ["M1801","M1805"], keywords: ["DevOps","SRE","ops","cloud","AWS","GCP","Azure"] },

  // M1 — Data / BI
  { code: "M1301", label: "Direction financière",                          domain: "M", subDomain: "13", relatedCodes: [], keywords: ["finance","DAF","directeur financier"] },

  // E — Communication / Multimédia
  { code: "E1101", label: "Animation de site multimédia",                  domain: "E", subDomain: "11", relatedCodes: ["E1102","M1805"], keywords: ["webmaster","animateur","contenu","site web"] },
  { code: "E1102", label: "Écriture d'ouvrages, de livres",                domain: "E", subDomain: "11", relatedCodes: [], keywords: ["rédacteur","auteur","copywriter"] },
  { code: "E1401", label: "Réalisation de contenus multimédias",           domain: "E", subDomain: "14", relatedCodes: ["E1101","M1805"], keywords: ["multimédia","UX","design","UI","graphiste","motion"] },

  // K — Services à la personne
  { code: "K2110", label: "Coordination pédagogique",                      domain: "K", subDomain: "21", relatedCodes: [], keywords: ["formateur","pédagogie","e-learning"] },
];

// ── Index for O(1) lookups ───────────────────────────────────────────────────

const INDEX = new Map<string, RomeNode>(
  ROME_NODES.map(node => [node.code, node])
);

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Get a ROME node by code.
 */
export function getRomeNode(code: string): RomeNode | undefined {
  return INDEX.get(code.toUpperCase());
}

/**
 * Compute proximity between a job's ROME code and the user's ROME codes.
 * Returns the best proximity found across all user codes.
 */
export function computeRomeProximity(
  jobCode: string,
  userCodes: string[]
): RomeProximity {
  const job = INDEX.get(jobCode.toUpperCase());
  if (!job) return "NONE";

  let best: RomeProximity = "NONE";

  for (const uc of userCodes) {
    const user = INDEX.get(uc.toUpperCase());
    if (!user) continue;

    const proximity = getProximity(job, user);
    if (proximityRank(proximity) > proximityRank(best)) {
      best = proximity;
    }
    if (best === "EXACT") break; // can't do better
  }

  return best;
}

function getProximity(a: RomeNode, b: RomeNode): RomeProximity {
  if (a.code === b.code)            return "EXACT";
  if (a.subDomain === b.subDomain)  return "SAME_DOMAIN";
  if (a.relatedCodes.includes(b.code) || b.relatedCodes.includes(a.code)) return "ADJACENT";
  if (a.domain === b.domain)        return "ADJACENT";
  return "NONE";
}

const PROXIMITY_RANK: Record<RomeProximity, number> = {
  EXACT: 3, SAME_DOMAIN: 2, ADJACENT: 1, NONE: 0,
};
function proximityRank(p: RomeProximity): number {
  return PROXIMITY_RANK[p];
}

/**
 * Convert proximity to a 0–100 score.
 */
export function proximityToScore(proximity: RomeProximity): number {
  switch (proximity) {
    case "EXACT":       return 100;
    case "SAME_DOMAIN": return 65;
    case "ADJACENT":    return 30;
    case "NONE":        return 0;
  }
}

/**
 * Search ROME nodes by keyword or partial label.
 */
export function searchRome(query: string): RomeNode[] {
  const q = query.toLowerCase();
  return ROME_NODES.filter(node =>
    node.code.toLowerCase().includes(q) ||
    node.label.toLowerCase().includes(q) ||
    node.keywords.some(k => k.includes(q))
  );
}

/**
 * Expand a list of ROME codes to include adjacent/related codes.
 * Useful for broadening a user's search automatically.
 */
export function expandRomeCodes(codes: string[]): string[] {
  const expanded = new Set(codes.map(c => c.toUpperCase()));
  for (const code of codes) {
    const node = INDEX.get(code.toUpperCase());
    if (node) {
      node.relatedCodes.forEach(rc => expanded.add(rc));
    }
  }
  return [...expanded];
}
