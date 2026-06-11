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
  maxResults:   number;  // total max offers to retrieve (paginated in 150-chunks)
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

// ── Retry config ──────────────────────────────────────────────────────────────

const MAX_RETRIES    = 3;
const BASE_DELAY_MS  = 1000;  // 1s, 2s, 4s exponential backoff

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

  const res = await fetchWithRetry(
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
 * Handles:
 *   - Pagination (loops through 150-item pages until maxResults or end)
 *   - Multi-batch ROME codes (chunks into groups of 5 per API limit)
 *   - Retry with exponential backoff on network errors / 429
 *   - Age filtering (maxAgeDays)
 */
export async function fetchJobs(
  config: FetchConfig,
  romeCodes?: string[],   // optional: filter by ROME codes
): Promise<FetchResult> {
  const errors: string[] = [];
  const fetchedAt = new Date();

  let token: string;
  try {
    token = await getAccessToken(config);
  } catch (err) {
    return { raw: [], fetchedAt, totalFound: 0, errors: [`Auth failed: ${String(err)}`] };
  }

  // ── Split ROME codes into batches of 5 (API limit per request) ────────────
  const romeBatches = romeCodes?.length
    ? chunkArray(romeCodes, 5)
    : [undefined]; // single batch with no ROME filter

  const allOffers = new Map<string, FranceTravailOffer>(); // deduplicate by offer ID
  let totalFound = 0;

  for (const batch of romeBatches) {
    const { offers, total, batchErrors } = await fetchPaginatedBatch(
      config, token, batch, errors,
    );

    totalFound += total;
    for (const offer of offers) {
      allOffers.set(offer.id, offer); // dedup across ROME batches
    }

    // If we've already collected enough, stop early
    if (allOffers.size >= config.maxResults) break;
  }

  errors.push(...[]);  // batchErrors are already pushed inside fetchPaginatedBatch

  const dedupedOffers = [...allOffers.values()].slice(0, config.maxResults);

  return {
    raw:        filterByAge(dedupedOffers, config.maxAgeDays),
    fetchedAt,
    totalFound,
    errors,
  };
}

// ── Paginated fetch for a single ROME batch ──────────────────────────────────

const API_PAGE_SIZE = 150; // France Travail hard limit per page

async function fetchPaginatedBatch(
  config: FetchConfig,
  token: string,
  romeBatch: string[] | undefined,
  errors: string[],
): Promise<{ offers: FranceTravailOffer[]; total: number; batchErrors: string[] }> {
  const batchErrors: string[] = [];
  const offers: FranceTravailOffer[] = [];
  const minDate = getMinDate(config.maxAgeDays);
  let total     = 0;
  let offset    = 0;

  // Paginate until we have all results or hit maxResults
  while (offset < config.maxResults) {
    const end = Math.min(offset + API_PAGE_SIZE - 1, config.maxResults - 1);

    const params = new URLSearchParams({
      minCreationDate: minDate,
      sort:            "1",              // sort by date desc
      range:           `${offset}-${end}`,
    });

    if (romeBatch?.length) {
      params.set("codeROME", romeBatch.join(","));
    }

    try {
      const res = await fetchWithRetry(
        `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept:        "application/json",
          },
        }
      );

      // 206 = partial content (paginated), 200 = all results fit in one page
      if (!res.ok && res.status !== 206) {
        const text = await res.text();
        const msg  = `API error ${res.status} (range ${offset}-${end}): ${text}`;
        batchErrors.push(msg);
        errors.push(msg);
        break; // stop paginating on error
      }

      // Content-Range: items 0-149/1243
      const rangeHeader = res.headers.get("Content-Range") ?? "";
      const pageTotal   = parseTotalFromRange(rangeHeader);
      if (pageTotal > 0) total = pageTotal; // use the most recent total

      const data = await res.json() as { resultats?: FranceTravailOffer[] };
      const pageResults = data.resultats ?? [];
      offers.push(...pageResults);

      // Stop if we got fewer results than requested (last page)
      // or if we've reached the total
      if (pageResults.length < API_PAGE_SIZE || offers.length >= total) {
        break;
      }

      offset += API_PAGE_SIZE;

    } catch (err) {
      const msg = `Fetch failed (range ${offset}-${end}): ${String(err)}`;
      batchErrors.push(msg);
      errors.push(msg);
      break; // stop paginating on network error
    }
  }

  return { offers, total, batchErrors };
}

// ── Retry with exponential backoff ────────────────────────────────────────────

/**
 * Wraps fetch() with retry logic:
 *   - Retries on network errors (TypeError from fetch)
 *   - Retries on 429 (Too Many Requests) with Retry-After header support
 *   - Retries on 5xx server errors
 *   - Exponential backoff: 1s → 2s → 4s
 */
async function fetchWithRetry(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, init);

      // Don't retry client errors (4xx) except 429
      if (res.ok || res.status === 206 || (res.status >= 400 && res.status < 500 && res.status !== 429)) {
        return res;
      }

      // Retryable: 429 or 5xx
      if (attempt < MAX_RETRIES) {
        const delay = getRetryDelay(res, attempt);
        console.warn(
          `[jobFetcher] HTTP ${res.status} on attempt ${attempt + 1}/${MAX_RETRIES + 1}, ` +
          `retrying in ${delay}ms — ${url}`
        );
        await sleep(delay);
        continue;
      }

      // Last attempt failed — return the error response as-is
      return res;

    } catch (err) {
      lastError = err;

      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `[jobFetcher] Network error on attempt ${attempt + 1}/${MAX_RETRIES + 1}, ` +
          `retrying in ${delay}ms — ${String(err)}`
        );
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastError ?? new Error(`fetchWithRetry exhausted ${MAX_RETRIES} retries`);
}

/**
 * Compute delay for retry, respecting Retry-After header if present.
 */
function getRetryDelay(res: Response, attempt: number): number {
  const retryAfter = res.headers.get("Retry-After");
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds) && seconds > 0) {
      return Math.min(seconds * 1000, 30_000); // cap at 30s
    }
  }
  return BASE_DELAY_MS * Math.pow(2, attempt); // 1s, 2s, 4s
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

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Invalidate token cache (useful for tests) ─────────────────────────────────
export function _resetTokenCache(): void {
  _tokenCache = null;
}
