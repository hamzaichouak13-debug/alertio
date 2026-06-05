// ─────────────────────────────────────────────
// ALERTIO — hooks/useAuth.ts
// Firebase auth state + profile
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { fetchProfile, saveProfile } from "../lib/api";
import type { UserProfile } from "../../../../packages/core/src/types";

export interface AuthState {
  user:       User | null;
  profile:    UserProfile | null;
  loading:    boolean;
  error:      string | null;
}

export interface AuthActions {
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  refreshProfile(): Promise<void>;
}

const googleProvider = new GoogleAuthProvider();

export function useAuth(): AuthState & AuthActions {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Load profile once user is known
  async function loadProfile(u: User) {
    try {
      const p = await fetchProfile(u.uid);
      setProfile(p);
    } catch (err: unknown) {
      // 404 = first login, profile doesn't exist yet → create a blank one
      if ((err as { status?: number }).status === 404) {
        const blank: Partial<UserProfile> = {
          uid:         u.uid,
          email:       u.email ?? "",
          displayName: u.displayName ?? undefined,
          preferences: {
            notificationThreshold: 70,
            contractTypes: ["CDI"],
            remoteTypes:   ["NONE", "PARTIAL", "FULL"],
          },
          profile: {
            romeCodes:     [],
            appellations:  [],
            skills:        [],
            primarySkills: [],
            sectors:       [],
            nafCodes:      [],
            themes:        [],
            contexts:      [],
            savoir:        [],
            savoirFaire:   [],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        try {
          const created = await saveProfile(u.uid, blank);
          setProfile(created);
        } catch (saveErr: unknown) {
          console.error("Failed to auto-create user profile:", saveErr);
          setError("Impossible de créer le profil utilisateur.");
        }
      } else {
        console.error("Failed to load user profile:", err);
        setError("Impossible de charger le profil utilisateur.");
      }
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await loadProfile(u);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signIn(email: string, password: string) {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      setError((err as Error).message);
      throw err;
    }
  }

  async function signUp(email: string, password: string) {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      setError((err as Error).message);
      throw err;
    }
  }

  async function signInWithGoogle() {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      setError((err as Error).message);
      throw err;
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
    setProfile(null);
  }

  async function refreshProfile() {
    if (!user) return;
    await loadProfile(user);
  }

  return {
    user, profile, loading, error,
    signIn, signUp, signInWithGoogle, signOut, refreshProfile,
  };
}
