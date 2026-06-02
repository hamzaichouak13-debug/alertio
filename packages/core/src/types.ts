// ─────────────────────────────────────────────
// ALERTIO — Core Types
// Single source of truth for the entire project
// ─────────────────────────────────────────────

// ── Job offer (normalized from France Travail API) ──────────────────────────

export interface Job {
  id: string;
  title: string;
  description: string;
  romeCode: string;          // ex: "M1805"
  romeLabel: string;         // ex: "Études et développement informatique"
  skills: string[];          // ex: ["React", "Node.js", "TypeScript"]
  sector: string;            // libellé secteur
  nafCode: string;           // ex: "62.01Z"
  location: JobLocation;
  contract: ContractType;
  salary?: SalaryRange;
  company: string;
  datePosted: Date;
  sourceUrl: string;
  rawData?: Record<string, unknown>; // original API payload
}

export interface JobLocation {
  city: string;
  department: string;
  postalCode: string;
  remote: RemoteType;
}

export type ContractType = "CDI" | "CDD" | "INTERIM" | "FREELANCE" | "STAGE" | "APPRENTISSAGE" | "OTHER";
export type RemoteType   = "NONE" | "PARTIAL" | "FULL";

export interface SalaryRange {
  min?: number;
  max?: number;
  currency: "EUR";
  period: "YEARLY" | "MONTHLY" | "DAILY" | "HOURLY";
}

// ── User profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  preferences: UserPreferences;
  profile: ProfessionalProfile;
  fcmToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  notificationThreshold: number;  // default 70
  contractTypes: ContractType[];
  remoteTypes: RemoteType[];
  maxDistanceKm?: number;
  salaryMin?: number;
  locations?: string[];            // cities or departments
}

export interface ProfessionalProfile {
  // ROME targeting
  romeCodes: string[];             // ex: ["M1805", "M1806"]
  appellations: string[];          // ex: ["Développeur Full-Stack", "Tech Lead"]

  // Skills
  skills: string[];                // ex: ["React", "TypeScript", "Node.js"]
  primarySkills: string[];         // top skills — weighted higher in matching

  // Sectors
  sectors: string[];               // sector labels
  nafCodes: string[];              // ex: ["62.01Z", "62.02A"]

  // Context
  themes: string[];                // ex: ["FinTech", "SaaS", "E-commerce"]
  contexts: string[];              // ex: ["Startup", "Grande entreprise"]

  // Metadata (from France Travail referential)
  savoir: string[];                // theoretical knowledge
  savoirFaire: string[];           // practical know-how
}

// ── Matching ─────────────────────────────────────────────────────────────────

export interface MatchResult {
  jobId: string;
  userId: string;
  score: number;               // 0–100
  breakdown: MatchBreakdown;
  shouldNotify: boolean;       // score >= threshold
  computedAt: Date;
}

export interface MatchBreakdown {
  rome: RomeMatchDetail;       // 40% weight
  skills: SkillMatchDetail;    // 35% weight
  sector: SectorMatchDetail;   // 15% weight
  context: number;             // 10% weight — appellation, themes, contexts
  total: number;
}

export interface RomeMatchDetail {
  score: number;               // 0–100
  matched: boolean;            // exact match
  proximity: RomeProximity;    // how close the codes are in the tree
  userCodes: string[];
  jobCode: string;
}

export type RomeProximity =
  | "EXACT"        // same code            → 100
  | "SAME_DOMAIN"  // same 2-char prefix   → 60
  | "ADJACENT"     // related domain       → 30
  | "NONE";        // no relation          → 0

export interface SkillMatchDetail {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  primarySkillBonus: number;   // extra points for matching primary skills
  total: number;
}

export interface SectorMatchDetail {
  score: number;
  nafMatch: boolean;
  sectorLabelMatch: boolean;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  jobId: string;
  matchScore: number;
  title: string;
  body: string;
  sentAt: Date;
  read: boolean;
}

// ── Scheduler run log ────────────────────────────────────────────────────────

export interface SchedulerRun {
  id: string;
  startedAt: Date;
  finishedAt?: Date;
  status: "RUNNING" | "SUCCESS" | "ERROR";
  stats: {
    jobsFetched: number;
    jobsNew: number;
    jobsDuplicate: number;
    matchesComputed: number;
    notificationsSent: number;
  };
  error?: string;
}
