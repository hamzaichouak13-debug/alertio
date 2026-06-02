// ─────────────────────────────────────────────
// ALERTIO — jobNormalizer.test.ts
// ─────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  normalizeOffer,
  normalizeOffers,
  extractSkills,
  extractSalary,
} from "../src/jobNormalizer";
import type { FranceTravailOffer } from "../src/jobFetcher";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeRaw(overrides: Partial<FranceTravailOffer> = {}): FranceTravailOffer {
  return {
    id:           "FT-123456",
    intitule:     "Développeur Full-Stack React/Node.js",
    description:  "Nous recherchons un développeur maîtrisant React, Node.js, TypeScript, PostgreSQL et Docker. Environnement Agile.",
    dateCreation: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    romeCode:     "M1805",
    romeLibelle:  "Études et développement informatique",
    typeContrat:  "CDI",
    lieuTravail:  { libelle: "75 - Paris", codePostal: "75009", commune: "Paris" },
    entreprise:   { nom: "Qonto" },
    salaire:      { libelle: "Annuel de 50000 à 65000 Euros" },
    secteurActivite:        "62.01Z",
    secteurActiviteLibelle: "Édition de logiciels",
    competences:  [
      { libelle: "React", exigence: "E" },
      { libelle: "Node.js", exigence: "E" },
    ],
    origineOffre: { urlOrigine: "https://qonto.com/jobs/123" },
    ...overrides,
  };
}

// ── normalizeOffer ────────────────────────────────────────────────────────────

describe("normalizeOffer", () => {
  it("maps core fields correctly", () => {
    const job = normalizeOffer(makeRaw());

    expect(job.id).toBe("FT-123456");
    expect(job.title).toBe("Développeur Full-Stack React/Node.js");
    expect(job.romeCode).toBe("M1805");
    expect(job.contract).toBe("CDI");
    expect(job.company).toBe("Qonto");
    expect(job.nafCode).toBe("62.01Z");
    expect(job.sector).toBe("Édition de logiciels");
    expect(job.sourceUrl).toBe("https://qonto.com/jobs/123");
  });

  it("parses datePosted as a Date object", () => {
    const job = normalizeOffer(makeRaw());
    expect(job.datePosted).toBeInstanceOf(Date);
    expect(job.datePosted.getTime()).toBeLessThan(Date.now());
  });

  it("falls back to France Travail URL if no origineOffre", () => {
    const job = normalizeOffer(makeRaw({ origineOffre: undefined }));
    expect(job.sourceUrl).toContain("francetravail.fr");
    expect(job.sourceUrl).toContain("FT-123456");
  });

  it("uses 'Entreprise non précisée' when company is missing", () => {
    const job = normalizeOffer(makeRaw({ entreprise: undefined }));
    expect(job.company).toBe("Entreprise non précisée");
  });
});

// ── Location ──────────────────────────────────────────────────────────────────

describe("normalizeOffer — location", () => {
  it("parses 'XX - City' format", () => {
    const job = normalizeOffer(makeRaw({ lieuTravail: { libelle: "75 - Paris" } }));
    expect(job.location.department).toBe("75");
    expect(job.location.city).toBe("Paris");
  });

  it("detects partial remote from description", () => {
    const job = normalizeOffer(makeRaw({ description: "Poste en télétravail partiel, 2 jours par semaine." }));
    expect(job.location.remote).toBe("PARTIAL");
  });

  it("detects full remote", () => {
    const job = normalizeOffer(makeRaw({ description: "100% télétravail possible." }));
    expect(job.location.remote).toBe("FULL");
  });

  it("defaults to NONE if no remote mention", () => {
    const job = normalizeOffer(makeRaw({ description: "Poste sur site à Lyon." }));
    expect(job.location.remote).toBe("NONE");
  });
});

// ── Contract ──────────────────────────────────────────────────────────────────

describe("normalizeOffer — contract", () => {
  it.each([
    ["CDI", "CDI"],
    ["CDD", "CDD"],
    ["MIS", "INTERIM"],
    ["LIB", "FREELANCE"],
    ["STG", "STAGE"],
    ["APP", "APPRENTISSAGE"],
    ["XYZ", "OTHER"],
    [undefined, "OTHER"],
  ])("maps %s → %s", (input, expected) => {
    const job = normalizeOffer(makeRaw({ typeContrat: input }));
    expect(job.contract).toBe(expected);
  });
});

// ── Skills ────────────────────────────────────────────────────────────────────

describe("extractSkills", () => {
  it("extracts structured competences", () => {
    const skills = extractSkills(makeRaw());
    expect(skills).toContain("React");
    expect(skills).toContain("Node.js");
  });

  it("extracts tech keywords from description", () => {
    const skills = extractSkills(makeRaw({
      competences: [],
      description: "Stack: TypeScript, PostgreSQL, Docker, AWS.",
    }));
    expect(skills).toContain("TypeScript");
    expect(skills).toContain("PostgreSQL");
    expect(skills).toContain("Docker");
    expect(skills).toContain("AWS");
  });

  it("deduplicates skills from both sources", () => {
    const skills = extractSkills(makeRaw({
      competences:  [{ libelle: "React" }],
      description:  "Maîtrise de React et Node.js requise.",
    }));
    const reactCount = skills.filter(s => s === "React").length;
    expect(reactCount).toBe(1);
  });

  it("caps at 20 skills", () => {
    const skills = extractSkills(makeRaw({
      description: "React Vue Angular Next.js Node.js TypeScript Python Java Go Rust PHP Ruby GraphQL REST PostgreSQL MySQL MongoDB Redis Docker Kubernetes AWS",
    }));
    expect(skills.length).toBeLessThanOrEqual(20);
  });
});

// ── Salary ────────────────────────────────────────────────────────────────────

describe("extractSalary", () => {
  it("parses annual salary range", () => {
    const salary = extractSalary(makeRaw({ salaire: { libelle: "Annuel de 50000 à 65000 Euros" } }));
    expect(salary?.min).toBe(50000);
    expect(salary?.max).toBe(65000);
    expect(salary?.period).toBe("YEARLY");
    expect(salary?.currency).toBe("EUR");
  });

  it("parses monthly salary", () => {
    const salary = extractSalary(makeRaw({ salaire: { libelle: "Mensuel de 2500 à 3200 Euros" } }));
    expect(salary?.period).toBe("MONTHLY");
    expect(salary?.min).toBe(2500);
  });

  it("returns undefined when no salary info", () => {
    const salary = extractSalary(makeRaw({ salaire: undefined }));
    expect(salary).toBeUndefined();
  });
});

// ── normalizeOffers (batch) ───────────────────────────────────────────────────

describe("normalizeOffers", () => {
  it("processes a batch and returns jobs array", () => {
    const { jobs, errors } = normalizeOffers([makeRaw(), makeRaw({ id: "FT-999" })]);
    expect(jobs).toHaveLength(2);
    expect(errors).toHaveLength(0);
  });

  it("skips malformed entries and logs errors", () => {
    const malformed = { id: "", intitule: "", dateCreation: "" } as FranceTravailOffer;
    const { jobs, errors } = normalizeOffers([malformed, makeRaw()]);
    expect(jobs).toHaveLength(1);
    expect(errors).toHaveLength(1);
  });
});
