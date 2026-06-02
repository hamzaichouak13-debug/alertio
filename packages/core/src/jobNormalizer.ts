// ─────────────────────────────────────────────
// ALERTIO — jobNormalizer.ts
// Maps France Travail raw API payload → Job (typed)
// Single function, pure, no side-effects — easy to test
// ─────────────────────────────────────────────

import type { Job, ContractType, RemoteType, SalaryRange } from "./types";
import type { FranceTravailOffer } from "./jobFetcher";

// ── Main normalizer ───────────────────────────────────────────────────────────

export function normalizeOffer(raw: FranceTravailOffer): Job {
  return {
    id:          raw.id,
    title:       cleanText(raw.intitule),
    description: cleanText(raw.description ?? ""),
    romeCode:    raw.romeCode   ?? "",
    romeLabel:   raw.romeLibelle ?? "",
    skills:      extractSkills(raw),
    sector:      raw.secteurActiviteLibelle ?? raw.secteurActivite ?? "",
    nafCode:     raw.secteurActivite        ?? "",
    location:    extractLocation(raw),
    contract:    normalizeContract(raw.typeContrat),
    salary:      extractSalary(raw),
    company:     raw.entreprise?.nom ?? "Entreprise non précisée",
    datePosted:  new Date(raw.dateCreation),
    sourceUrl:   raw.origineOffre?.urlOrigine
                 ?? raw.contact?.urlPostulation
                 ?? `https://candidat.francetravail.fr/offres/recherche/detail/${raw.id}`,
    rawData:     raw as unknown as Record<string, unknown>,
  };
}

/**
 * Normalize a batch of raw offers.
 * Silently skips malformed entries (logs to errors array).
 */
export function normalizeOffers(
  raws: FranceTravailOffer[]
): { jobs: Job[]; errors: string[] } {
  const jobs:   Job[]     = [];
  const errors: string[]  = [];

  for (const raw of raws) {
    try {
      if (!raw.id || !raw.intitule || !raw.dateCreation) {
        errors.push(`Skipped malformed offer: ${raw.id ?? "(no id)"}`);
        continue;
      }
      jobs.push(normalizeOffer(raw));
    } catch (err) {
      errors.push(`Error normalizing ${raw.id}: ${String(err)}`);
    }
  }

  return { jobs, errors };
}

// ── Skills extraction ─────────────────────────────────────────────────────────

/**
 * Extracts skills from:
 * 1. competences[] array (structured)
 * 2. qualitesProfessionnelles[] (soft skills)
 * 3. description text (heuristic keyword scan)
 */
export function extractSkills(raw: FranceTravailOffer): string[] {
  const skills = new Set<string>();

  // 1. Structured competences
  for (const c of raw.competences ?? []) {
    const label = cleanText(c.libelle);
    if (label.length > 1 && label.length < 60) {
      skills.add(label);
    }
  }

  // 2. Description heuristic — tech keywords
  if (raw.description) {
    const found = extractTechKeywords(raw.description);
    found.forEach(k => skills.add(k));
  }

  return [...skills].slice(0, 20); // cap at 20 skills
}

// Common tech keywords to scan in descriptions
const TECH_KEYWORDS: string[] = [
  "React", "Vue", "Angular", "Next.js", "Nuxt",
  "Node.js", "Express", "NestJS", "Fastify",
  "TypeScript", "JavaScript", "Python", "Java", "Go", "Rust", "PHP", "Ruby",
  "GraphQL", "REST", "API", "WebSocket",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
  "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform",
  "CI/CD", "GitHub Actions", "GitLab CI", "Jenkins",
  "Agile", "Scrum", "TDD", "DDD",
  "Firebase", "Supabase", "Vercel",
  "React Native", "Flutter", "Swift", "Kotlin",
];

function extractTechKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return TECH_KEYWORDS.filter(kw =>
    lower.includes(kw.toLowerCase())
  );
}

// ── Location extraction ───────────────────────────────────────────────────────

function extractLocation(raw: FranceTravailOffer): Job["location"] {
  const lieu = raw.lieuTravail;
  const label = lieu?.libelle ?? "";

  // Detect remote from label and description
  const allText = `${label} ${raw.description ?? ""} ${raw.dureeTravailLibelle ?? ""}`.toLowerCase();
  const remote  = detectRemote(allText);

  // "75 - Paris" → city="Paris", department="75"
  const parts      = label.split(" - ");
  const department = parts[0]?.trim() ?? "";
  const city       = parts[1]?.trim() ?? label;

  return {
    city,
    department,
    postalCode: lieu?.codePostal ?? "",
    remote,
  };
}

function detectRemote(text: string): RemoteType {
  if (text.includes("100% télétravail") || text.includes("full remote") || text.includes("entièrement à distance")) {
    return "FULL";
  }
  if (text.includes("télétravail") || text.includes("remote") || text.includes("à distance") || text.includes("hybride")) {
    return "PARTIAL";
  }
  return "NONE";
}

// ── Contract normalization ────────────────────────────────────────────────────

const CONTRACT_MAP: Record<string, ContractType> = {
  CDI:   "CDI",
  CDD:   "CDD",
  MIS:   "INTERIM",
  LIB:   "FREELANCE",
  SAI:   "CDD",       // saisonnier → CDD
  STG:   "STAGE",
  APP:   "APPRENTISSAGE",
  DDI:   "CDD",
  DIN:   "CDI",
  TTI:   "INTERIM",
  FRA:   "FREELANCE",
};

function normalizeContract(code?: string): ContractType {
  if (!code) return "OTHER";
  return CONTRACT_MAP[code.toUpperCase()] ?? "OTHER";
}

// ── Salary extraction ─────────────────────────────────────────────────────────

/**
 * Parses salary from the libelle string.
 * Examples:
 *   "Annuel de 45000 à 55000 Euros"
 *   "Mensuel de 2500 à 3000 Euros"
 *   "Horaire de 15 à 18 Euros"
 */
export function extractSalary(raw: FranceTravailOffer): SalaryRange | undefined {
  const text = [
    raw.salaire?.libelle,
    raw.salaire?.commentaire,
    raw.salaire?.complement1,
  ].filter(Boolean).join(" ");

  if (!text) return undefined;

  const lower = text.toLowerCase();
  const period =
    lower.includes("annuel")   ? "YEARLY"  :
    lower.includes("mensuel")  ? "MONTHLY" :
    lower.includes("horaire")  ? "HOURLY"  :
    lower.includes("journali") ? "DAILY"   : "YEARLY";

  // Extract numbers: "45000 à 55000" or "45 000 à 55 000"
  const nums = text.replace(/\s/g, "").match(/\d+/g)?.map(Number).filter(n => n > 0);
  if (!nums || nums.length === 0) return undefined;

  return {
    min:      nums[0],
    max:      nums[1] ?? nums[0],
    currency: "EUR",
    period,
  };
}

// ── Text cleaner ──────────────────────────────────────────────────────────────

function cleanText(text: string): string {
  return text
    .replace(/&amp;/g,  "&")
    .replace(/&lt;/g,   "<")
    .replace(/&gt;/g,   ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g,    " ")
    .trim();
}
