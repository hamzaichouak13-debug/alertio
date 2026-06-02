// ─────────────────────────────────────────────
// ALERTIO — api/jobs/[id].ts
// GET /api/jobs/:id  → single job + match score for current user
// ─────────────────────────────────────────────

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth, withErrorHandler, ok, setCors, ApiError } from "../_lib/auth";
import { getDb, serializeDoc } from "../_lib/firebase";
import { getUserById } from "../_lib/stores";
import { computeMatch } from "../../packages/core/src/matchingEngine";
import type { Job } from "../../packages/core/src/types";

export default withErrorHandler(async (req: VercelRequest, res: VercelResponse) => {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const uid = await requireAuth(req);
  const { id } = req.query;
  if (!id || Array.isArray(id)) throw new ApiError(400, "Invalid job id");

  // Load job
  const db   = getDb();
  const snap = await db.collection("jobs").doc(id).get();
  if (!snap.exists) throw new ApiError(404, "Job not found");

  const job: Job = {
    ...serializeDoc(snap.data()!),
    datePosted: new Date(snap.data()!.datePosted as string),
  } as Job;

  // Load user for on-demand match score
  const user = await getUserById(uid);

  const match = user ? computeMatch(job, user) : null;

  ok(res, { job, match });
});
