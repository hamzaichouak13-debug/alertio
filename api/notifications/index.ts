// ─────────────────────────────────────────────
// ALERTIO — api/notifications/index.ts
// GET   /api/notifications          → list user notifications
// PATCH /api/notifications/:id/read → mark as read
// ─────────────────────────────────────────────

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth, withErrorHandler, ok, noContent, setCors } from "../_lib/auth";
import { getUserNotifications, markNotificationRead } from "../_lib/stores";

export default withErrorHandler(async (req: VercelRequest, res: VercelResponse) => {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  const uid = await requireAuth(req);

  // GET /api/notifications
  if (req.method === "GET") {
    const limit  = parseInt(String(req.query.limit ?? "50"), 10);
    const notifs = await getUserNotifications(uid, Math.min(limit, 100));
    ok(res, {
      notifications: notifs,
      unreadCount:   notifs.filter(n => !n.read).length,
    });
    return;
  }

  // PATCH /api/notifications/:id/read  — handled via notifId in query
  if (req.method === "PATCH") {
    const { id } = req.query;
    if (!id || Array.isArray(id)) { res.status(400).json({ error: "Missing id" }); return; }
    await markNotificationRead(id, uid);
    noContent(res);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
