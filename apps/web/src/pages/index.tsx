// ─────────────────────────────────────────────
// ALERTIO — pages/index.tsx
// Root redirect: authed → /dashboard, else → /login
// ─────────────────────────────────────────────

import { useEffect } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/login");
    }, 5000); // fallback après 5s

    const unsub = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeout);
      router.replace(user ? "/dashboard" : "/login");
    });

    return () => { unsub(); clearTimeout(timeout); };
  }, [router]);

  // Blank while redirecting — no flash of content
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#0E0F11",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .sp {
          width: 28px; height: 28px;
          border: 2.5px solid #1D9E75;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }
      `}</style>
      <div className="sp" role="status" aria-label="Chargement" />
    </div>
  );
}
