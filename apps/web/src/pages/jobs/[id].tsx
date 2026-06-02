// ─────────────────────────────────────────────
// ALERTIO — pages/jobs/[id].tsx
// Job detail: full description + match breakdown
// ─────────────────────────────────────────────

import { useState, useEffect }         from "react";
import Head                             from "next/head";
import Link                             from "next/link";
import { useRouter }                    from "next/router";
import { useAuth }                      from "../../hooks/useAuth";
import { fetchJob }                     from "../../lib/api";
import type { Job, MatchResult }        from "../../../../../packages/core/src/types";

export default function JobDetail() {
  const router        = useRouter();
  const { id }        = router.query;
  const { user, loading: authLoading } = useAuth();

  const [job,     setJob]     = useState<Job | null>(null);
  const [match,   setMatch]   = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (!id || Array.isArray(id)) return;

    fetchJob(id)
      .then(({ job: j, match: m }) => { setJob(j); setMatch(m); })
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id, user, authLoading, router]);

  if (authLoading || loading) return <Loader />;
  if (error)  return <ErrorView msg={error} onBack={() => router.back()} />;
  if (!job)   return null;

  const score      = match?.score ?? null;
  const scoreColor = score === null ? "#4A4D54" : score >= 85 ? "#1D9E75" : score >= 70 ? "#E09132" : "#4A4D54";

  const daysAgo = Math.floor(
    (Date.now() - new Date(job.datePosted).getTime()) / (1000 * 60 * 60 * 24)
  );

  const remoteLabel =
    job.location.remote === "FULL"    ? "100% Remote" :
    job.location.remote === "PARTIAL" ? "Hybride"     :
    "Sur site";

  return (
    <>
      <Head>
        <title>{job.title} — Alertio</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>
      <style>{STYLES}</style>

      <div className="jd-wrap">
        {/* Back */}
        <button className="jd-back" onClick={() => router.back()}>
          ← Retour aux offres
        </button>

        <div className="jd-layout">
          {/* ── Left: main content ── */}
          <main className="jd-main">
            {/* Header */}
            <div className="jd-header">
              <div>
                <h1 className="jd-title">{job.title}</h1>
                <div className="jd-meta-row">
                  <span className="jd-company">🏢 {job.company}</span>
                  <span className="jd-sep">·</span>
                  <span>{job.location.city}</span>
                  <span className="jd-sep">·</span>
                  <span className="jd-remote">{remoteLabel}</span>
                </div>
              </div>
            </div>

            {/* Quick facts */}
            <div className="jd-facts">
              <Fact icon="📄" label="Contrat"   value={job.contract} />
              <Fact icon="⏱"  label="Publiée"   value={daysAgo === 0 ? "Aujourd'hui" : `il y a ${daysAgo}j`} />
              {job.salary && (
                <Fact
                  icon="💶"
                  label="Salaire"
                  value={
                    job.salary.min
                      ? `${Math.round(job.salary.min / 1000)}k – ${Math.round((job.salary.max ?? job.salary.min) / 1000)}k €`
                      : "Selon profil"
                  }
                />
              )}
              <Fact icon="🏷" label="ROME"      value={`${job.romeCode} · ${job.romeLabel}`} mono />
              <Fact icon="🏭" label="Secteur"   value={job.sector} />
              <Fact icon="📌" label="Code NAF"  value={job.nafCode} mono />
            </div>

            {/* Skills */}
            {job.skills.length > 0 && (
              <section className="jd-section">
                <h2 className="jd-section__title">Compétences requises</h2>
                <div className="jd-skills">
                  {job.skills.map(s => (
                    <span key={s} className="jd-skill">{s}</span>
                  ))}
                </div>
              </section>
            )}

            {/* Description */}
            {job.description && (
              <section className="jd-section">
                <h2 className="jd-section__title">Description du poste</h2>
                <div className="jd-description">
                  {job.description.split("\n").map((line, i) =>
                    line.trim() ? <p key={i}>{line}</p> : <br key={i} />
                  )}
                </div>
              </section>
            )}
          </main>

          {/* ── Right: match score + apply ── */}
          <aside className="jd-aside">
            {/* Score card */}
            {score !== null && match ? (
              <div className="jd-score-card">
                <div className="jd-score-card__header">
                  <span className="jd-score-card__label">Score de matching</span>
                  <div className="jd-score-big" style={{ color: scoreColor }}>
                    {score}
                    <span className="jd-score-big__denom">/100</span>
                  </div>
                </div>

                {/* Ring */}
                <div className="jd-ring-wrap">
                  <svg viewBox="0 0 100 100" className="jd-ring">
                    <circle cx="50" cy="50" r="40" fill="none" strokeWidth="6" stroke="#1E2023" />
                    <circle
                      cx="50" cy="50" r="40" fill="none" strokeWidth="6"
                      stroke={scoreColor}
                      strokeLinecap="round"
                      strokeDasharray={`${(score / 100) * 251.2} 251.2`}
                      strokeDashoffset="62.8"
                      style={{ transition: "stroke-dasharray .8s ease" }}
                    />
                  </svg>
                  <div className="jd-ring-inner">
                    <span className="jd-ring-num" style={{ color: scoreColor }}>{score}</span>
                    <span className="jd-ring-lbl">
                      {score >= 90 ? "Excellent" : score >= 80 ? "Très bon" : score >= 70 ? "Bon" : "Faible"}
                    </span>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="jd-breakdown">
                  <h3 className="jd-breakdown__title">Détail du score</h3>

                  <BreakdownRow
                    label="Code ROME"
                    value={match.breakdown.rome.score}
                    weight={40}
                    detail={match.breakdown.rome.proximity}
                  />
                  <BreakdownRow
                    label="Compétences"
                    value={match.breakdown.skills.total}
                    weight={35}
                    detail={`${match.breakdown.skills.matchedSkills.length} matchée(s)`}
                  />
                  <BreakdownRow
                    label="Secteur NAF"
                    value={match.breakdown.sector.score}
                    weight={15}
                    detail={match.breakdown.sector.nafMatch ? "NAF exact" : "Partiel"}
                  />
                  <BreakdownRow
                    label="Contexte"
                    value={match.breakdown.context}
                    weight={10}
                    detail=""
                  />
                </div>

                {/* Matched skills */}
                {match.breakdown.skills.matchedSkills.length > 0 && (
                  <div className="jd-matched">
                    <p className="jd-matched__label">✓ Compétences en commun</p>
                    <div className="jd-matched__tags">
                      {match.breakdown.skills.matchedSkills.map(s => (
                        <span key={s} className="jd-matched__tag">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing skills */}
                {match.breakdown.skills.missingSkills.length > 0 && (
                  <div className="jd-missing">
                    <p className="jd-missing__label">⚠ Compétences manquantes</p>
                    <div className="jd-missing__tags">
                      {match.breakdown.skills.missingSkills.map(s => (
                        <span key={s} className="jd-missing__tag">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="jd-score-card jd-score-card--empty">
                <p>Score non disponible</p>
                <p className="jd-score-card__hint">Complétez votre profil pour voir votre score</p>
                <Link href="/profile" className="jd-btn-profile">Compléter le profil →</Link>
              </div>
            )}

            {/* Apply CTA */}
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="jd-btn-apply"
            >
              Postuler sur France Travail →
            </a>

            <p className="jd-source-hint">
              Offre #{job.id} · Source : France Travail
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Fact({ icon, label, value, mono }: { icon: string; label: string; value: string; mono?: boolean }) {
  return (
    <div className="jd-fact">
      <span className="jd-fact__icon">{icon}</span>
      <span className="jd-fact__label">{label}</span>
      <span className={`jd-fact__value ${mono ? "mono" : ""}`}>{value}</span>
    </div>
  );
}

function BreakdownRow({ label, value, weight, detail }: {
  label: string; value: number; weight: number; detail: string;
}) {
  const color = value >= 80 ? "#1D9E75" : value >= 50 ? "#E09132" : "#4A4D54";
  return (
    <div className="bd-row">
      <div className="bd-row__head">
        <span className="bd-row__label">{label}</span>
        <span className="bd-row__weight">×{weight}%</span>
        <span className="bd-row__val" style={{ color }}>{value}</span>
      </div>
      <div className="bd-row__track">
        <div className="bd-row__fill" style={{ width: `${value}%`, background: color }} />
      </div>
      {detail && <span className="bd-row__detail">{detail}</span>}
    </div>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0E0F11" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .sp{width:28px;height:28px;border:2.5px solid #1D9E75;border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite}`}</style>
      <div className="sp" role="status" aria-label="Chargement" />
    </div>
  );
}

function ErrorView({ msg, onBack }: { msg: string; onBack: () => void }) {
  return (
    <div style={{ padding: 40, background: "#0E0F11", minHeight: "100vh", color: "#E8E9EB" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#6B6E75", cursor: "pointer", marginBottom: 24 }}>← Retour</button>
      <p style={{ color: "#D85A30" }}>⚠ {msg}</p>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
  :root {
    --bg:#0E0F11; --bg2:#161719; --bg3:#1E2023;
    --border:#2A2C30; --text:#E8E9EB; --muted:#6B6E75;
    --c-accent:#1D9E75; --c-danger:#D85A30; --c-gold:#E09132;
    --font-ui:'Syne',sans-serif; --font-mono:'DM Mono',monospace; --r:10px;
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--bg);color:var(--text);font-family:var(--font-ui);-webkit-font-smoothing:antialiased;}

  .jd-wrap{max-width:1100px;margin:0 auto;padding:24px 32px 80px;}
  .jd-back{background:none;border:1px solid var(--border);color:var(--muted);padding:7px 14px;border-radius:8px;cursor:pointer;font-family:var(--font-ui);font-size:13px;margin-bottom:28px;transition:all .12s;}
  .jd-back:hover{border-color:var(--muted);color:var(--text);}

  .jd-layout{display:grid;grid-template-columns:1fr 340px;gap:32px;align-items:start;}
  @media(max-width:900px){.jd-layout{grid-template-columns:1fr;} .jd-aside{order:-1;}}

  /* Header */
  .jd-header{margin-bottom:20px;}
  .jd-title{font-size:26px;font-weight:700;letter-spacing:-.5px;line-height:1.25;margin-bottom:8px;}
  .jd-meta-row{display:flex;align-items:center;flex-wrap:wrap;gap:6px;font-size:13px;color:var(--muted);}
  .jd-company{color:var(--text);}
  .jd-sep{color:var(--border);}
  .jd-remote{background:var(--bg3);padding:2px 8px;border-radius:99px;font-size:12px;color:var(--muted);}

  /* Facts */
  .jd-facts{display:flex;flex-direction:column;gap:8px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:16px;margin-bottom:24px;}
  .jd-fact{display:flex;align-items:center;gap:10px;font-size:13px;}
  .jd-fact__icon{width:18px;text-align:center;flex-shrink:0;}
  .jd-fact__label{color:var(--muted);width:80px;flex-shrink:0;}
  .jd-fact__value{color:var(--text);}
  .jd-fact__value.mono{font-family:var(--font-mono);font-size:12px;color:var(--c-accent);}

  /* Sections */
  .jd-section{margin-bottom:28px;}
  .jd-section__title{font-size:14px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;}

  /* Skills */
  .jd-skills{display:flex;flex-wrap:wrap;gap:7px;}
  .jd-skill{padding:5px 11px;border-radius:6px;background:var(--bg3);border:1px solid var(--border);font-size:13px;color:var(--text);}

  /* Description */
  .jd-description{font-size:14px;line-height:1.75;color:#C8C9CB;}
  .jd-description p{margin-bottom:10px;}

  /* Score card */
  .jd-score-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:20px;margin-bottom:14px;}
  .jd-score-card--empty{text-align:center;padding:28px 20px;color:var(--muted);font-size:14px;display:flex;flex-direction:column;gap:10px;align-items:center;}
  .jd-score-card__hint{font-size:12px;}
  .jd-btn-profile{color:var(--c-accent);font-size:13px;text-decoration:none;}
  .jd-score-card__header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;}
  .jd-score-card__label{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;}
  .jd-score-big{font-family:var(--font-mono);font-size:40px;font-weight:500;line-height:1;}
  .jd-score-big__denom{font-size:16px;color:var(--muted);margin-left:3px;}

  /* Ring */
  .jd-ring-wrap{position:relative;width:120px;height:120px;margin:0 auto 20px;}
  .jd-ring{width:100%;height:100%;transform:rotate(-90deg);}
  .jd-ring-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
  .jd-ring-num{font-family:var(--font-mono);font-size:26px;font-weight:500;line-height:1;}
  .jd-ring-lbl{font-size:11px;color:var(--muted);margin-top:3px;}

  /* Breakdown */
  .jd-breakdown{margin-bottom:16px;}
  .jd-breakdown__title{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;}
  .bd-row{margin-bottom:10px;}
  .bd-row__head{display:flex;align-items:center;gap:6px;margin-bottom:4px;}
  .bd-row__label{font-size:12px;flex:1;}
  .bd-row__weight{font-size:10px;color:var(--muted);font-family:var(--font-mono);}
  .bd-row__val{font-family:var(--font-mono);font-size:13px;font-weight:500;width:24px;text-align:right;}
  .bd-row__track{height:3px;background:var(--bg3);border-radius:2px;overflow:hidden;}
  .bd-row__fill{height:100%;border-radius:2px;transition:width .6s ease;}
  .bd-row__detail{font-size:10px;color:var(--muted);font-family:var(--font-mono);}

  /* Matched / missing */
  .jd-matched,.jd-missing{margin-bottom:12px;}
  .jd-matched__label{font-size:11px;color:var(--c-accent);margin-bottom:6px;}
  .jd-missing__label{font-size:11px;color:var(--c-gold);margin-bottom:6px;}
  .jd-matched__tags,.jd-missing__tags{display:flex;flex-wrap:wrap;gap:5px;}
  .jd-matched__tag{font-size:11px;padding:2px 8px;border-radius:4px;background:color-mix(in srgb,var(--c-accent) 12%,transparent);color:var(--c-accent);}
  .jd-missing__tag{font-size:11px;padding:2px 8px;border-radius:4px;background:color-mix(in srgb,var(--c-gold) 12%,transparent);color:var(--c-gold);}

  /* Apply */
  .jd-btn-apply{display:block;text-align:center;background:var(--c-accent);color:#fff;padding:13px;border-radius:var(--r);text-decoration:none;font-size:14px;font-weight:600;transition:opacity .12s;margin-bottom:10px;}
  .jd-btn-apply:hover{opacity:.85;}
  .jd-source-hint{font-size:11px;color:var(--muted);text-align:center;font-family:var(--font-mono);}
`;
