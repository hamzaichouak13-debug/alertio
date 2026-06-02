// ─────────────────────────────────────────────
// ALERTIO — components/jobs/JobCard.tsx
// ─────────────────────────────────────────────

import type { Job, MatchResult } from "../../../../../packages/core/src/types";

interface JobCardProps {
  job:      Job;
  match?:   MatchResult | null;
  onClick?: () => void;
  onFave?:  () => void;
  faved?:   boolean;
  isNew?:   boolean;
}

export function JobCard({ job, match, onClick, onFave, faved, isNew }: JobCardProps) {
  const score = match?.score ?? null;

  const scoreColor =
    score === null        ? "var(--c-muted)"  :
    score >= 85           ? "var(--c-hi)"     :
    score >= 70           ? "var(--c-mid)"    :
                            "var(--c-low)";

  const scoreLabel =
    score === null ? "" :
    score >= 90    ? "Excellent" :
    score >= 80    ? "Très bon"  :
    score >= 70    ? "Bon"       :
                     "Faible";

  const daysAgo = Math.floor(
    (Date.now() - new Date(job.datePosted).getTime()) / (1000 * 60 * 60 * 24)
  );

  const remoteLabel =
    job.location.remote === "FULL"    ? "100% remote" :
    job.location.remote === "PARTIAL" ? "Hybride"     :
    null;

  return (
    <article
      className={`job-card ${isNew ? "job-card--new" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick?.()}
      aria-label={`${job.title} chez ${job.company}, score ${score ?? "non calculé"}`}
    >
      {/* Score bar (left accent) */}
      {score !== null && (
        <div
          className="job-card__score-bar"
          style={{ "--score-color": scoreColor, "--score-h": `${score}%` } as React.CSSProperties}
          aria-hidden="true"
        />
      )}

      <div className="job-card__body">
        {/* Header row */}
        <div className="job-card__header">
          <div className="job-card__title-block">
            <h3 className="job-card__title">
              {job.title}
              {isNew && <span className="badge badge--new">Nouveau</span>}
            </h3>
            <p className="job-card__company">
              <span className="icon">🏢</span> {job.company}
              <span className="sep">·</span>
              {job.location.city}
              {remoteLabel && (
                <span className="badge badge--remote">{remoteLabel}</span>
              )}
            </p>
          </div>

          {/* Score circle */}
          {score !== null && (
            <div className="score-circle" style={{ "--c": scoreColor } as React.CSSProperties}>
              <svg viewBox="0 0 40 40" className="score-ring" aria-hidden="true">
                <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3" className="score-ring__track"/>
                <circle
                  cx="20" cy="20" r="16" fill="none" strokeWidth="3"
                  className="score-ring__fill"
                  style={{
                    stroke:           scoreColor,
                    strokeDasharray:  `${(score / 100) * 100.5} 100.5`,
                    strokeDashoffset: 25,
                  }}
                />
              </svg>
              <span className="score-circle__num">{score}</span>
              <span className="score-circle__lbl">{scoreLabel}</span>
            </div>
          )}
        </div>

        {/* Skill chips */}
        {job.skills.length > 0 && (
          <div className="job-card__skills" aria-label="Compétences requises">
            {job.skills.slice(0, 5).map(s => (
              <span key={s} className="skill-chip">{s}</span>
            ))}
            {job.skills.length > 5 && (
              <span className="skill-chip skill-chip--more">+{job.skills.length - 5}</span>
            )}
            <span className="rome-badge">{job.romeCode}</span>
          </div>
        )}

        {/* Match breakdown (if available) */}
        {match && (
          <div className="job-card__breakdown" aria-label="Détail du score">
            <BreakdownBar label="ROME"       value={match.breakdown.rome.score}   />
            <BreakdownBar label="Compétences" value={match.breakdown.skills.total} />
            <BreakdownBar label="Secteur"    value={match.breakdown.sector.score} />
          </div>
        )}

        {/* Footer */}
        <div className="job-card__footer">
          <div className="job-card__meta">
            <span>⏱ {daysAgo === 0 ? "Aujourd'hui" : `${daysAgo}j`}</span>
            <span>📄 {job.contract}</span>
            {job.salary && (
              <span>
                💶 {job.salary.min
                  ? `${Math.round(job.salary.min / 1000)}k–${Math.round((job.salary.max ?? job.salary.min) / 1000)}k€`
                  : "Selon profil"}
              </span>
            )}
          </div>
          <div className="job-card__actions">
            <button
              className={`btn-icon ${faved ? "btn-icon--active" : ""}`}
              onClick={e => { e.stopPropagation(); onFave?.(); }}
              aria-label={faved ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              {faved ? "♥" : "♡"}
            </button>
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-apply"
              onClick={e => e.stopPropagation()}
            >
              Postuler →
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function BreakdownBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 80 ? "var(--c-hi)"  :
    value >= 50 ? "var(--c-mid)" :
                  "var(--c-low)";
  return (
    <div className="breakdown-bar">
      <span className="breakdown-bar__label">{label}</span>
      <div className="breakdown-bar__track">
        <div
          className="breakdown-bar__fill"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="breakdown-bar__val">{value}</span>
    </div>
  );
}
