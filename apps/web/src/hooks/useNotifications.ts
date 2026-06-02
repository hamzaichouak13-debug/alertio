// ─────────────────────────────────────────────
// ALERTIO — hooks/useNotifications.ts
// Notification list + unread count
// Requests FCM permission on first call
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { getToken }                          from "firebase/messaging";
import { fetchNotifications, markAsRead }    from "../lib/api";
import { getMessagingInstance, VAPID_KEY }   from "../lib/firebase";
import { saveProfile }                       from "../lib/api";
import type { Notification }                 from "../../../../packages/core/src/types";
import type { User }                         from "firebase/auth";

export interface UseNotificationsState {
  notifications: Notification[];
  unreadCount:   number;
  loading:       boolean;
  pushEnabled:   boolean;
}

export interface UseNotificationsActions {
  markRead(id: string): Promise<void>;
  requestPush(user: User): Promise<void>;
  refresh(): Promise<void>;
}

export function useNotifications(
  autoLoad = true
): UseNotificationsState & UseNotificationsActions {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [pushEnabled,   setPushEnabled]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications(50);
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      // Silently fail — notifications are non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) load();
  }, [autoLoad, load]);

  const markRead = useCallback(async (id: string) => {
    await markAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Request FCM push permission + save token to user profile
  const requestPush = useCallback(async (user: User) => {
    try {
      const messaging = await getMessagingInstance();
      if (!messaging) return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (!fcmToken) return;

      // Persist token to user profile so the scheduler can send pushes
      await saveProfile(user.uid, { fcmToken } as never);
      setPushEnabled(true);
    } catch {
      // Push not critical — fail silently
    }
  }, []);

  return {
    notifications, unreadCount, loading, pushEnabled,
    markRead, requestPush, refresh: load,
  };
}
