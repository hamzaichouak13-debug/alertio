// ─────────────────────────────────────────────
// ALERTIO — api/_lib/auth.ts
// Firebase ID token verification middleware
// Usage: const uid = await requireAuth(req)
//        throws ApiError(401) if invalid
// ─────────────────────────────────────────────

import type { VercelRequest } from "@vercel/node";
import { getAuth } from "./firebase";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Extracts and verifies the Firebase ID token from the Authorization header.
 * Returns the verified UID on success.
 * Throws ApiError(401) if the token is missing or invalid.
 */
export async function requireAuth(req: VercelRequest): Promise<string> {
  const header = req.headers.authorization ?? "";
  if (!header.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing or malformed Authorization header");
  }

  const token = header.slice(7);
  try {
    const decoded = await getAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
}

// ── Response helpers ──────────────────────────────────────────────────────────

import type { VercelResponse } from "@vercel/node";

export function ok(res: VercelResponse, data: unknown): void {
  res.status(200).json(data);
}

export function created(res: VercelResponse, data: unknown): void {
  res.status(201).json(data);
}

export function noContent(res: VercelResponse): void {
  res.status(204).end();
}

/**
 * Wraps a handler so any thrown ApiError is automatically converted
 * to the correct HTTP status + JSON body.
 */
export function withErrorHandler(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>
) {
  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    try {
      await handler(req, res);
    } catch (err) {
      if (err instanceof ApiError) {
        res.status(err.status).json({ error: err.message });
      } else {
        console.error("[api] Unhandled error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };
}

// ── CORS (for web app) ────────────────────────────────────────────────────────

export function setCors(res: VercelResponse): void {
  const origin = process.env.ALLOWED_ORIGIN ?? "https://alertio.vercel.app";
  res.setHeader("Access-Control-Allow-Origin",  origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type");
}
