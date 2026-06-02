// ─────────────────────────────────────────────
// ALERTIO — api/profile/[uid].ts
// GET /api/profile/:uid  → read profile
// PUT /api/profile/:uid  → create or update profile
// ─────────────────────────────────────────────
//
// Users can only read/write their own profile.
// The uid in the URL must match the token's uid.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth, withErrorHandler, ok, created, ApiError, setCors } from "../_lib/auth";
import { getUserById, upsertUser } from "../_lib/stores";
import type { UserProfile } from "../../packages/core/src/types";

export default withErrorHandler(async (req: VercelRequest, res: VercelResponse) => {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  const tokenUid = await requireAuth(req);
  const { uid }  = req.query;

  if (!uid || Array.isArray(uid)) throw new ApiError(400, "Invalid uid");
  // Users can only access their own profile
  if (uid !== tokenUid)           throw new ApiError(403, "Forbidden");

  // ── GET ───────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    const user = await getUserById(uid);
    if (!user) throw new ApiError(404, "Profile not found");
    ok(res, user);
    return;
  }

  // ── PUT ───────────────────────────────────────────────────────────────────
  if (req.method === "PUT") {
    const body = req.body as Partial<UserProfile>;
    if (!body) throw new ApiError(400, "Missing request body");

    // Validate required nested objects
    if (body.profile && typeof body.profile !== "object") {
      throw new ApiError(400, "Invalid profile shape");
    }
    if (body.preferences && typeof body.preferences !== "object") {
      throw new ApiError(400, "Invalid preferences shape");
    }

    // Merge into Firestore (partial update supported)
    await upsertUser(uid, {
      ...body,
      uid,                          // always enforce
      email: body.email ?? "",
      createdAt: body.createdAt ?? new Date(),
    });

    const updated = await getUserById(uid);
    created(res, updated);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
