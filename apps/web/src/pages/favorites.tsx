// ─────────────────────────────────────────────
// ALERTIO — pages/favorites.tsx
// Saved job offers — persisted in Firestore
// ─────────────────────────────────────────────

import { useEffect }           from "react";
import Head                    from "next/head";
import { useRouter }           from "next/router";
import { useAuth }             from "../hooks/useAuth";
import { useFavorites }        from "../hooks/useFavorites";

export default function Favorites() {
  const router  = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { favorites, favIds, loading, toggle } = useFavorites();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  if (authLoading) return <Loader />;

  return (
    <>
      <Head>
        <title>Alertio — Favoris</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>
      <style>{STYLES}</style>

      <div className="fav-wrap">
        <header className="fav-header">
          <button className="btn-back" onClick={() => router.push("/dashboard")}>
            ← Tableau de bord
          </button>
          <div className="fav-header__logo">Alert<span>io</span></div>
          <span className="fav-header__count">
            {favorites.length} favori{favorites.length !== 1 ? "s" : ""}
          </span>
        </header>

        <div className="fav-body">
          <h1 className="fav-title">♥ Mes favoris</h1>
          <p className="fav-sub">Offres sauvegardées — synchronisées sur tous vos appareils</p>

          {loading ? (
            <div className="fav-skeleton">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton-card" aria-hidden="true" />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="fav-empty">
              <p className="fav-empty__emoji">♡</p>
              <p className="fav-empty__title">Aucun favori pour l&apos;instant</p>
              <p className="fav-empty__sub">
                Cliquez sur le ♡ d&apos;une offre pour la sauvegarder ici
              </p>
              <button
                className="btn-browse"
                onClick={() => router.push("/dashboard")}
              >
                Parcourir les offres →
              </button>
            </div>
          ) : (
            <div className="fav-list">
              {favorites
                .sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime())
                .map(entry => {
                  const job = entry.job;
                  if (!job) return null;

                  const daysAgo = Math.floor(
                    (Date.now() - new Date(job.datePosted).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const savedAgo = Math.floor(
                    (Date.now() - entry.savedAt.getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <article key={entry.jobId} className="fav-card">
                      <div className="fav-card__body">
                        <div className="fav-card__main">
                          <h2 className="fav-card__title"
                            onClick={() => router.push(`/jobs/${job.id}`)}
                            role="button" tabIndex={0}
                            onKeyDown={e => e.key === "Enter" && router.push(`/jobs/${job.id}`)}
                          >
                            {job.title}
                          </h2>
                          <p className="fav-card__company">
                            🏢 {job.company}
                            <span className="sep">·</span>
                            {job.location.city}
                            {job.location.remote !== "NONE" && (
                              <span className="badge-remote">
                                {job.location.remote === "FULL" ? "100% Remote" : "Hybride"}
                              </span>
                            )}
                          </p>

                          <div className="fav-card__meta">
                            <span>📄 {job.contract}</span>
                            <span>⏱ Publiée {daysAgo === 0 ? "aujourd'hui" : `il y a ${daysAgo}j`}</span>
                            {job.salary?.min && (
                              <span>
                                💶 {Math.round(job.salary.min / 1000)}k–{Math.round((job.salary.max ?? job.salary.min) / 1000)}k€
                              </span>
                            )}
                            <span className="rome-badge">{job.romeCode}</span>
                          </div>

                          {job.skills?.length > 0 && (
                            <div className="fav-card__skills">
                              {job.skills.slice(0, 5).map(s => (
                                <span key={s} className="skill-chip">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="fav-card__actions">
                          <p className="fav-card__saved">
                            Sauvegardé {savedAgo === 0 ? "aujourd'hui" : `il y a ${savedAgo}j`}
                          </p>
                          <div className="fav-card__btns">
                            <button
                              className="btn-unfav"
                              onClick={() => toggle(job as Parameters<typeof toggle>[0])}
                              aria-label="Retirer des favoris"
                            >
                              ♥ Retirer
                            </button>
                            <a
                              href={job.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-apply"
                            >
                              Postuler →
                            </a>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Loader() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#0E0F11" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .sp{width:28px;height:28px;border:2.5px solid #1D9E75;border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite}`}</style>
      <div className="sp" role="status" aria-label="Chargement" />
    </div>
  );
}

const STYLES = `
  :root {
    --bg:#0E0F11; --bg2:#161719; --bg3:#1E2023;
    --border:#2A2C30; --text:#E8E9EB; --muted:#6B6E75;
    --c-accent:#1D9E75; --c-danger:#D85A30;
    --font-ui:'Syne',sans-serif; --font-mono:'DM Mono',monospace; --r:10px;
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--bg);color:var(--text);font-family:var(--font-ui);-webkit-font-smoothing:antialiased;}

  .fav-wrap{max-width:760px;margin:0 auto;padding:0 24px 80px;}

  .fav-header{display:flex;align-items:center;justify-content:space-between;padding:20px 0;border-bottom:1px solid var(--border);margin-bottom:32px;position:sticky;top:0;background:var(--bg);z-index:10;}
  .fav-header__logo{font-size:18px;font-weight:700;letter-spacing:-.5px;}
  .fav-header__logo span{color:var(--c-accent);}
  .fav-header__count{font-size:13px;color:var(--muted);font-family:var(--font-mono);}

  .btn-back{background:none;border:1px solid var(--border);color:var(--muted);padding:7px 12px;border-radius:8px;cursor:pointer;font-family:var(--font-ui);font-size:13px;transition:all .12s;}
  .btn-back:hover{border-color:var(--muted);color:var(--text);}

  .fav-title{font-size:24px;font-weight:700;letter-spacing:-.5px;margin-bottom:6px;}
  .fav-sub{font-size:13px;color:var(--muted);margin-bottom:28px;}

  .fav-list{display:flex;flex-direction:column;gap:12px;}

  .fav-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);transition:border-color .15s;}
  .fav-card:hover{border-color:color-mix(in srgb,var(--c-accent) 40%,var(--border));}
  .fav-card__body{padding:16px;display:flex;gap:16px;align-items:flex-start;}
  .fav-card__main{flex:1;min-width:0;}

  .fav-card__title{font-size:15px;font-weight:600;line-height:1.3;margin-bottom:5px;cursor:pointer;}
  .fav-card__title:hover{color:var(--c-accent);}

  .fav-card__company{font-size:12px;color:var(--muted);display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:10px;}
  .sep{color:var(--border);}
  .badge-remote{background:var(--bg3);padding:2px 7px;border-radius:99px;font-size:11px;}

  .fav-card__meta{display:flex;gap:12px;font-size:11px;color:var(--muted);font-family:var(--font-mono);flex-wrap:wrap;margin-bottom:10px;}
  .rome-badge{background:color-mix(in srgb,var(--c-accent) 12%,transparent);color:var(--c-accent);padding:1px 6px;border-radius:4px;}

  .fav-card__skills{display:flex;flex-wrap:wrap;gap:5px;}
  .skill-chip{font-size:11px;padding:2px 8px;border-radius:4px;background:var(--bg3);border:1px solid var(--border);color:var(--muted);}

  .fav-card__actions{display:flex;flex-direction:column;align-items:flex-end;gap:10px;flex-shrink:0;}
  .fav-card__saved{font-size:11px;color:var(--muted);font-family:var(--font-mono);white-space:nowrap;}
  .fav-card__btns{display:flex;gap:7px;}

  .btn-unfav{background:none;border:1px solid color-mix(in srgb,var(--c-danger) 40%,var(--border));color:var(--c-danger);padding:5px 12px;border-radius:6px;cursor:pointer;font-family:var(--font-ui);font-size:12px;transition:all .12s;}
  .btn-unfav:hover{background:color-mix(in srgb,var(--c-danger) 10%,transparent);}

  .btn-apply{background:var(--c-accent);color:#fff;padding:5px 12px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;white-space:nowrap;transition:opacity .12s;}
  .btn-apply:hover{opacity:.85;}

  .btn-browse{background:var(--c-accent);border:none;color:#fff;padding:10px 24px;border-radius:8px;cursor:pointer;font-family:var(--font-ui);font-size:14px;font-weight:600;margin-top:16px;transition:opacity .12s;}
  .btn-browse:hover{opacity:.85;}

  /* Empty */
  .fav-empty{text-align:center;padding:60px 20px;color:var(--muted);}
  .fav-empty__emoji{font-size:48px;margin-bottom:16px;}
  .fav-empty__title{font-size:18px;font-weight:600;color:var(--text);margin-bottom:8px;}
  .fav-empty__sub{font-size:13px;}

  /* Skeleton */
  @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
  .fav-skeleton{display:flex;flex-direction:column;gap:12px;}
  .skeleton-card{height:110px;border-radius:var(--r);background:linear-gradient(90deg,var(--bg2) 25%,var(--bg3) 50%,var(--bg2) 75%);background-size:600px 100%;animation:shimmer 1.4s infinite;}
`;
