// ─────────────────────────────────────────────
// ALERTIO — jobFetcher.ts
// Fetches job offers from France Travail API
// Filters offers < 14 days old
// Returns raw API payloads for normalizer
// ─────────────────────────────────────────────
//
// API docs: https://francetravail.io/data/api/offres-emploi
// Auth: OAuth2 client_credentials
//   POST https://entreprise.francetravail.fr/connexion/oauth2/access_token
//   scope: api_offresdemploiv2 o2dsoffre

export interface FetchConfig {
  clientId:     string;
  clientSecret: string;
  maxResults:   number;  // max 150 per call (API limit)
  maxAgeDays:   number;  // default 14
}

export interface FetchResult {
  raw:        FranceTravailOffer[];
  fetchedAt:  Date;
  totalFound: number;
  errors:     string[];
}

// ── France Travail raw offer shape (partial — only fields we use) ─────────────

export interface FranceTravailOffer {
  id:                     string;
  intitule:               string;
  description?:           string;
  dateCreation:           string;           // ISO 8601
  dateActualisation?:     string;
  lieuTravail?:           { libelle: string; codePostal?: string; commune?: string };
  romeCode?:              string;
  romeLibelle?:           string;
  appellationlibelle?:    string;
  typeContrat?:           string;           // CDI, CDD, MIS...
  typeContratLibelle?:    string;
  natureContrat?:         string;
  experienceExige?:       string;
  salaire?:               { libelle?: string; commentaire?: string; complement1?: string };
  dureeTravailLibelle?:   string;
  alternance?:            boolean;
  entreprise?:            { nom?: string; description?: string; logo?: string };
  competences?:           { libelle: string; exigence?: string }[];
  qualitesProfessionnelles?: { libelle: string }[];
  secteurActivite?:       string;
  secteurActiviteLibelle?: string;
  origineOffre?:          { origine?: string; urlOrigine?: string };
  contact?:               { coordonnees1?: string; urlPostulation?: string };
}

// ── OAuth token cache ─────────────────────────────────────────────────────────

interface TokenCache {
  token:     string;
  expiresAt: number; // ms timestamp
}

let _tokenCache: TokenCache | null = null;

async function getAccessToken(config: FetchConfig): Promise<string> {
  const now = Date.now();
  if (_tokenCache && _tokenCache.expiresAt > now + 30_000) {
    return _tokenCache.token;
  }

  const params = new URLSearchParams({
    grant_type:    "client_credentials",
    client_id:     config.clientId,
    client_secret: config.clientSecret,
    scope:         "api_offresdemploiv2 o2dsoffre",
  });

  const res = await fetch(
    "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire",
    {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    params.toString(),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OAuth error ${res.status}: ${text}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  _tokenCache = {
    token:     data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return _tokenCache.token;
}

// ── Main fetch function ───────────────────────────────────────────────────────

/**
 * Fetches fresh job offers from France Travail API.
 * Handles pagination, token refresh, and age filtering.
 */
export async function fetchJobs(
  config: FetchConfig,
  romeCodes?: string[],   // optional: filter by ROME codes
): Promise<FetchResult> {
  const errors: string[] = [];
  const allOffers: FranceTravailOffer[] = [];
  const fetchedAt = new Date();

  let token: string;
  try {
    token = await getAccessToken(config);
  } catch (err) {
    return { raw: [], fetchedAt, totalFound: 0, errors: [`Auth failed: ${String(err)}`] };
  }

  // France Travail API: max 150 per page, paginate with range header
  const pageSize = Math.min(config.maxResults, 150);
  const minDate  = getMinDate(config.maxAgeDays);

  // Build query params
  const params = new URLSearchParams({
    minCreationDate: minDate,
    sort:            "1",         // sort by date desc
    range:           `0-${pageSize - 1}`,
  });

  if (romeCodes?.length) {
    // API accepts comma-separated ROME codes (max 5)
    params.set("codeROME", romeCodes.slice(0, 5).join(","));
  }

  try {
    const res = await fetch(
      `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept:        "application/json",
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      errors.push(`API error ${res.status}: ${text}`);
      return { raw: [], fetchedAt, totalFound: 0, errors };
    }

    // Content-Range: items 0-149/1243
    const range      = res.headers.get("Content-Range") ?? "";
    const totalFound = parseTotalFromRange(range);
    const data       = await res.json() as { resultats?: FranceTravailOffer[] };

    allOffers.push(...(data.resultats ?? []));

    return {
      raw:        filterByAge(allOffers, config.maxAgeDays),
      fetchedAt,
      totalFound,
      errors,
    };

  } catch (err) {
    errors.push(`Fetch failed: ${String(err)}`);
    return { raw: [], fetchedAt, totalFound: 0, errors };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMinDate(maxAgeDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() - maxAgeDays);
  // France Travail expects: YYYY-MM-DDTHH:MM:SSZ
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function filterByAge(offers: FranceTravailOffer[], maxDays: number): FranceTravailOffer[] {
  const cutoff = Date.now() - maxDays * 24 * 3600 * 1000;
  return offers.filter(o => {
    const date = new Date(o.dateCreation).getTime();
    return !isNaN(date) && date >= cutoff;
  });
}

function parseTotalFromRange(header: string): number {
  // "items 0-149/1243" → 1243
  const match = header.match(/\/(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

// ── Invalidate token cache (useful for tests) ─────────────────────────────────
export function _resetTokenCache(): void {
  _tokenCache = null;
}
