// ─────────────────────────────────────────────
// ALERTIO — pages/login.tsx
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import Head                    from "next/head";
import { useRouter }           from "next/router";
import { useAuth }             from "../hooks/useAuth";

export default function Login() {
  const router = useRouter();
  const { user, loading, signIn, signUp, signInWithGoogle, error } = useAuth();

  const [mode,     setMode]     = useState<"signin" | "signup">("signin");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [busy,     setBusy]     = useState(false);
  const [localErr, setLocalErr] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalErr("");
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.replace("/dashboard");
    } catch {
      setLocalErr(error ?? "Une erreur est survenue");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setLocalErr("");
    setBusy(true);
    try {
      await signInWithGoogle();
      router.replace("/dashboard");
    } catch {
      setLocalErr(error ?? "Connexion Google échouée");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>Alertio — Connexion</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>
      <style>{STYLES}</style>

      <div className="login-wrap">
        {/* Left panel — branding */}
        <div className="login-left" aria-hidden="true">
          <div className="login-left__content">
            <div className="login-left__logo">Alert<span>io</span></div>
            <p className="login-left__tagline">
              Offres d&apos;emploi fraîches.<br />
              Matchées en temps réel.
            </p>
            <div className="login-left__stats">
              <div className="stat">
                <span className="stat__num">10 min</span>
                <span className="stat__lbl">fréquence de scan</span>
              </div>
              <div className="stat">
                <span className="stat__num">0–100</span>
                <span className="stat__lbl">score de matching</span>
              </div>
              <div className="stat">
                <span className="stat__num">14j</span>
                <span className="stat__lbl">offres fraîches</span>
              </div>
            </div>
          </div>
          <div className="login-left__grid" aria-hidden="true">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="grid-dot" style={{ animationDelay: `${i * 0.07}s` }} />
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="login-right">
          <div className="login-form-wrap">
            <h1 className="login-title">
              {mode === "signin" ? "Connexion" : "Créer un compte"}
            </h1>
            <p className="login-sub">
              {mode === "signin"
                ? "Retrouvez vos offres matchées"
                : "Commencez à recevoir vos alertes emploi"}
            </p>

            {/* Google */}
            <button className="btn-google" onClick={handleGoogle} disabled={busy}>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continuer avec Google
            </button>

            <div className="divider"><span>ou</span></div>

            {/* Email form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="email" className="field__label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="field__input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.fr"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label htmlFor="password" className="field__label">
                  Mot de passe
                  {mode === "signin" && (
                    <a href="/forgot-password" className="field__forgot">Oublié ?</a>
                  )}
                </label>
                <input
                  id="password"
                  type="password"
                  className="field__input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "8 caractères minimum" : "••••••••"}
                  required
                  minLength={mode === "signup" ? 8 : undefined}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
              </div>

              {localErr && (
                <p className="form-error" role="alert">{localErr}</p>
              )}

              <button className="btn-submit" type="submit" disabled={busy}>
                {busy ? "…" : mode === "signin" ? "Se connecter" : "Créer le compte"}
              </button>
            </form>

            <p className="login-switch">
              {mode === "signin" ? "Pas encore de compte ? " : "Déjà inscrit ? "}
              <button
                className="login-switch__btn"
                onClick={() => { setMode(m => m === "signin" ? "signup" : "signin"); setLocalErr(""); }}
              >
                {mode === "signin" ? "Créer un compte" : "Se connecter"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

const STYLES = `
  :root {
    --bg:       #0E0F11;
    --bg2:      #161719;
    --bg3:      #1E2023;
    --border:   #2A2C30;
    --text:     #E8E9EB;
    --muted:    #6B6E75;
    --c-accent: #1D9E75;
    --c-danger: #D85A30;
    --font-ui:  'Syne', sans-serif;
    --font-mono:'DM Mono', monospace;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: var(--font-ui); -webkit-font-smoothing: antialiased; }

  .login-wrap { display: flex; min-height: 100vh; }

  /* Left panel */
  .login-left {
    flex: 1;
    background: var(--bg2);
    border-right: 1px solid var(--border);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @media (max-width: 768px) { .login-left { display: none; } }

  .login-left__content { position: relative; z-index: 1; padding: 40px; }
  .login-left__logo {
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -1px;
    margin-bottom: 20px;
  }
  .login-left__logo span { color: var(--c-accent); }
  .login-left__tagline {
    font-size: 22px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--text);
    margin-bottom: 40px;
  }
  .login-left__stats { display: flex; gap: 32px; }
  .stat { display: flex; flex-direction: column; gap: 3px; }
  .stat__num {
    font-family: var(--font-mono);
    font-size: 24px;
    font-weight: 500;
    color: var(--c-accent);
  }
  .stat__lbl { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }

  /* Animated dot grid */
  .login-left__grid {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: repeat(5, 1fr);
    padding: 40px;
    opacity: 0.15;
  }
  @keyframes dotPulse {
    0%, 100% { transform: scale(1); opacity: 0.3; }
    50%       { transform: scale(1.8); opacity: 1; }
  }
  .grid-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: var(--c-accent);
    animation: dotPulse 3s ease-in-out infinite;
    align-self: center; justify-self: center;
  }

  /* Right panel */
  .login-right {
    width: 440px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }
  @media (max-width: 768px) { .login-right { width: 100%; } }

  .login-form-wrap { width: 100%; max-width: 340px; }

  .login-title {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }
  .login-sub { font-size: 13px; color: var(--muted); margin-bottom: 28px; }

  /* Google button */
  .btn-google {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 11px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-family: var(--font-ui);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background .12s;
  }
  .btn-google:hover:not(:disabled) { background: var(--bg3); }
  .btn-google:disabled { opacity: 0.5; cursor: not-allowed; }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
    color: var(--muted);
    font-size: 12px;
  }
  .divider::before, .divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* Fields */
  .field { margin-bottom: 16px; }
  .field__label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 6px;
    color: var(--text);
  }
  .field__forgot { color: var(--c-accent); text-decoration: none; font-weight: 400; }
  .field__input {
    width: 100%;
    padding: 10px 12px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-family: var(--font-ui);
    font-size: 14px;
    outline: none;
    transition: border-color .12s;
  }
  .field__input:focus { border-color: var(--c-accent); }
  .field__input::placeholder { color: var(--muted); }

  .form-error {
    font-size: 12px;
    color: var(--c-danger);
    margin-bottom: 12px;
    padding: 8px 10px;
    background: color-mix(in srgb, var(--c-danger) 10%, transparent);
    border-radius: 6px;
    border-left: 3px solid var(--c-danger);
  }

  .btn-submit {
    width: 100%;
    padding: 11px;
    background: var(--c-accent);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-family: var(--font-ui);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity .12s;
    margin-top: 4px;
  }
  .btn-submit:hover:not(:disabled) { opacity: 0.88; }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .login-switch { font-size: 13px; color: var(--muted); text-align: center; margin-top: 20px; }
  .login-switch__btn {
    background: none; border: none;
    color: var(--c-accent); cursor: pointer;
    font-family: var(--font-ui); font-size: 13px;
    text-decoration: underline;
  }
`;
