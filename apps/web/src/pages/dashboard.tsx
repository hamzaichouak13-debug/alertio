// ─────────────────────────────────────────────
// ALERTIO — pages/dashboard.tsx
// Main dashboard: job list + filters + notifications
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import Head                    from "next/head";
import Link                    from "next/link";
import { useRouter }           from "next/router";
import { useAuth }             from "../hooks/useAuth";
import { useJobs }             from "../hooks/useJobs";
import { useNotifications }    from "../hooks/useNotifications";
import { useFavorites }         from "../hooks/useFavorites";
import { JobCard }             from "../components/jobs/JobCard";
import { JobFilters }          from "../components/jobs/JobFilters";

export default function Dashboard() {
  const router          = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { jobs, loading, loadingMore, error, hasMore, lastRefresh,
          filters, setFilters, loadMore, refresh }        = useJobs({ limit: 20 });
  const { unreadCount, notifications, markRead, requestPush } = useNotifications();

  const { favIds: favs, toggle: toggleFavHook } = useFavorites();
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [selectedJob,  setSelectedJob]  = useState<string | null>(null);

  // Redirect to login if not authed
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  // Request push permissions once profile is loaded
  useEffect(() => {
    if (user && profile && "Notification" in window) {
      requestPush(user);
    }
  }, [user, profile, requestPush]);

  function toggleFav(job: import("../../../../packages/core/src/types").Job) {
    toggleFavHook(job);
  }

  if (authLoading) return <Spinner />;
  if (!user)       return null;

  const initials = (profile?.displayName ?? user.email ?? "?")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <Head>
        <title>Alertio — Tableau de bord</title>
        <meta name="description" content="Vos offres d'emploi en temps réel avec matching intelligent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style>{STYLES}</style>

      <div className="app">
        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside className="sidebar">
          <div className="sidebar__logo">
            Alert<span>io</span>
          </div>

          <nav className="sidebar__nav">
            <a href="#" className="sidebar__link sidebar__link--active">
              <span className="sidebar__icon">⚡</span> Offres
            </a>
            <Link href="/profile" className="sidebar__link">
              <span className="sidebar__icon">👤</span> Profil
            </Link>
            <a href="#" className="sidebar__link" onClick={() => setNotifOpen(true)}>
              <span className="sidebar__icon">🔔</span> Notifications
              {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
            </a>
            <Link href="/favorites" className="sidebar__link">
              <span className="sidebar__icon">♥</span> Favoris
              {favs.size > 0 && <span className="badge-count">{favs.size}</span>}
            </Link>
          </nav>

          {/* Profile snippet */}
          <div className="sidebar__profile">
            <div className="avatar">{initials}</div>
            <div className="sidebar__profile-info">
              <p className="sidebar__profile-name">{profile?.displayName ?? user.email}</p>
              {profile?.profile.romeCodes.length ? (
                <p className="sidebar__profile-rome">
                  {profile.profile.romeCodes.join(" · ")}
                </p>
              ) : (
                <Link href="/profile" className="sidebar__profile-setup">
                  Compléter le profil →
                </Link>
              )}
            </div>
            <button className="btn-signout" onClick={signOut} aria-label="Se déconnecter">↩</button>
          </div>
        </aside>

        {/* ── Main content ───────────────────────────────────────────────── */}
        <main className="main">
          <header className="main__header">
            <div>
              <h1 className="main__title">Offres du moment</h1>
              <p className="main__subtitle">
                Matchées sur votre profil · Score ≥ 70 notifié en push
              </p>
            </div>
            <button
              className="btn-refresh"
              onClick={refresh}
              disabled={loading}
              aria-label="Rafraîchir les offres"
            >
              {loading ? "⟳" : "↺"} Actualiser
            </button>
          </header>

          <JobFilters
            filters={filters}
            onChange={setFilters}
            totalCount={jobs.length}
            lastRefresh={lastRefresh}
          />

          {/* Job list */}
          {error && (
            <div className="error-banner" role="alert">
              ⚠ {error}
            </div>
          )}

          {loading && jobs.length === 0 ? (
            <div className="jobs-skeleton">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton-card" aria-hidden="true" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state__emoji">🔍</p>
              <p className="empty-state__text">Aucune offre trouvée</p>
              <p className="empty-state__sub">Modifiez les filtres ou complétez votre profil</p>
            </div>
          ) : (
            <div className="job-list">
              {jobs.map((job, i) => (
                <JobCard
                  key={job.id}
                  job={job}
                  match={null} // match computed on detail view to avoid N+1
                  isNew={i < 3 && lastRefresh !== null &&
                    (Date.now() - new Date(job.datePosted).getTime()) < 3600_000}
                  faved={favs.has(job.id)}
                  onFave={() => toggleFav(job)}
                  onClick={() => setSelectedJob(job.id)}
                />
              ))}

              {hasMore && (
                <button
                  className="btn-loadmore"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Chargement…" : "Voir plus d'offres"}
                </button>
              )}
            </div>
          )}
        </main>

        {/* ── Notification panel ─────────────────────────────────────────── */}
        {notifOpen && (
          <div className="notif-overlay" onClick={() => setNotifOpen(false)}>
            <div className="notif-panel" onClick={e => e.stopPropagation()} role="dialog" aria-label="Notifications">
              <div className="notif-panel__header">
                <h2>Notifications</h2>
                <button onClick={() => setNotifOpen(false)} aria-label="Fermer">×</button>
              </div>
              {notifications.length === 0 ? (
                <p className="notif-empty">Aucune notification</p>
              ) : (
                <ul className="notif-list">
                  {notifications.map(n => (
                    <li
                      key={n.id}
                      className={`notif-item ${!n.read ? "notif-item--unread" : ""}`}
                      onClick={() => markRead(n.id)}
                    >
                      <div className="notif-item__title">{n.title}</div>
                      <div className="notif-item__body">{n.body}</div>
                      <div className="notif-item__score">Score {n.matchScore}/100</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .sp { width: 32px; height: 32px; border: 3px solid #1D9E75;
              border-top-color: transparent; border-radius: 50%;
              animation: spin .7s linear infinite; }
      `}</style>
      <div className="sp" role="status" aria-label="Chargement" />
    </div>
  );
}

// ── Global styles ─────────────────────────────────────────────────────────────

const STYLES = `
  :root {
    --bg:       #0E0F11;
    --bg2:      #161719;
    --bg3:      #1E2023;
    --border:   #2A2C30;
    --text:     #E8E9EB;
    --muted:    #6B6E75;
    --c-hi:     #1D9E75;
    --c-mid:    #E09132;
    --c-low:    #4A4D54;
    --c-accent: #1D9E75;
    --c-danger: #D85A30;
    --font-ui:  'Syne', sans-serif;
    --font-mono:'DM Mono', monospace;
    --r:        10px;
    --sidebar-w:220px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-ui);
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Layout ──────────────────────────────────────────────────────── */
  .app { display: flex; min-height: 100vh; }

  /* ── Sidebar ─────────────────────────────────────────────────────── */
  .sidebar {
    width: var(--sidebar-w);
    background: var(--bg2);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 24px 16px;
    position: sticky;
    top: 0;
    height: 100vh;
    flex-shrink: 0;
  }
  .sidebar__logo {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.5px;
    margin-bottom: 32px;
    padding-left: 4px;
  }
  .sidebar__logo span { color: var(--c-accent); }

  .sidebar__nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }

  .sidebar__link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: var(--r);
    color: var(--muted);
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    transition: background .12s, color .12s;
    position: relative;
  }
  .sidebar__link:hover { background: var(--bg3); color: var(--text); }
  .sidebar__link--active { background: var(--bg3); color: var(--text); }
  .sidebar__icon { font-size: 15px; width: 18px; text-align: center; }

  .badge-count {
    margin-left: auto;
    background: var(--c-danger);
    color: white;
    font-size: 10px;
    font-family: var(--font-mono);
    padding: 1px 5px;
    border-radius: 99px;
    min-width: 18px;
    text-align: center;
  }

  .sidebar__profile {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-top: 1px solid var(--border);
    margin-top: auto;
  }
  .avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: var(--c-accent);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sidebar__profile-info { flex: 1; min-width: 0; }
  .sidebar__profile-name { font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar__profile-rome { font-size: 11px; color: var(--muted); font-family: var(--font-mono); }
  .sidebar__profile-setup { font-size: 11px; color: var(--c-accent); text-decoration: none; }
  .btn-signout { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 16px; padding: 4px; }
  .btn-signout:hover { color: var(--text); }

  /* ── Main ────────────────────────────────────────────────────────── */
  .main {
    flex: 1;
    padding: 32px 40px;
    max-width: 900px;
    overflow-y: auto;
  }

  .main__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  .main__title { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
  .main__subtitle { font-size: 13px; color: var(--muted); margin-top: 2px; }

  .btn-refresh {
    background: var(--bg3);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 7px 14px;
    border-radius: var(--r);
    cursor: pointer;
    font-family: var(--font-ui);
    font-size: 13px;
    transition: background .12s;
  }
  .btn-refresh:hover:not(:disabled) { background: var(--border); }
  .btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Filters ─────────────────────────────────────────────────────── */
  .job-filters { margin-bottom: 20px; }
  .job-filters__status {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }
  .job-filters__count { font-size: 13px; font-weight: 600; }
  .job-filters__refresh {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--muted);
    font-family: var(--font-mono);
  }
  .refresh-dot {
    width: 6px; height: 6px;
    background: var(--c-accent);
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
  }
  .job-filters__row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: flex-start;
  }

  /* Chips */
  .chip-group { display: flex; gap: 4px; flex-wrap: wrap; }
  .chip {
    padding: 5px 11px;
    border-radius: 99px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted);
    font-family: var(--font-ui);
    font-size: 12px;
    cursor: pointer;
    transition: all .12s;
    white-space: nowrap;
  }
  .chip:hover { border-color: var(--muted); color: var(--text); }
  .chip--active { background: var(--c-accent); border-color: var(--c-accent); color: #fff; }

  /* ROME search */
  .rome-search { position: relative; }
  .rome-search__input-wrap { position: relative; }
  .rome-search__input {
    background: var(--bg3);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 5px 28px 5px 10px;
    border-radius: 99px;
    font-family: var(--font-mono);
    font-size: 12px;
    width: 180px;
    outline: none;
    transition: border-color .12s;
  }
  .rome-search__input:focus { border-color: var(--c-accent); }
  .rome-search__input::placeholder { color: var(--muted); }
  .rome-search__clear {
    position: absolute; right: 8px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; color: var(--muted);
    cursor: pointer; font-size: 14px; line-height: 1;
  }
  .rome-search__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0; right: 0;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--r);
    list-style: none;
    overflow: hidden;
    z-index: 100;
    box-shadow: 0 8px 24px rgba(0,0,0,.4);
  }
  .rome-search__option {
    display: flex;
    gap: 8px;
    align-items: baseline;
    padding: 8px 12px;
    cursor: pointer;
    transition: background .1s;
  }
  .rome-search__option:hover { background: var(--bg3); }
  .rome-search__code {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--c-accent);
    flex-shrink: 0;
  }
  .rome-search__label { font-size: 12px; color: var(--text); }

  /* ── Job list ────────────────────────────────────────────────────── */
  .job-list { display: flex; flex-direction: column; gap: 12px; }

  /* ── Job card ────────────────────────────────────────────────────── */
  .job-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--r);
    display: flex;
    overflow: hidden;
    cursor: pointer;
    transition: border-color .15s, transform .15s;
    outline: none;
  }
  .job-card:hover, .job-card:focus-visible {
    border-color: var(--c-accent);
    transform: translateY(-1px);
  }
  .job-card--new { border-color: color-mix(in srgb, var(--c-accent) 40%, var(--border)); }

  .job-card__score-bar {
    width: 4px;
    flex-shrink: 0;
    background: var(--score-color);
    opacity: 0.8;
  }

  .job-card__body { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 0; }

  .job-card__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .job-card__title-block { flex: 1; min-width: 0; }
  .job-card__title {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.3;
    display: flex;
    align-items: center;
    gap: 7px;
    flex-wrap: wrap;
  }
  .job-card__company {
    font-size: 12px;
    color: var(--muted);
    margin-top: 3px;
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
  }
  .sep { color: var(--border); }

  /* Badges */
  .badge { font-size: 10px; padding: 2px 7px; border-radius: 99px; font-weight: 600; }
  .badge--new { background: color-mix(in srgb, var(--c-accent) 20%, transparent); color: var(--c-accent); }
  .badge--remote { background: var(--bg3); color: var(--muted); }

  /* Score circle */
  .score-circle {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    width: 52px;
    flex-shrink: 0;
  }
  .score-ring { width: 48px; height: 48px; transform: rotate(-90deg); }
  .score-ring__track { stroke: var(--bg3); }
  .score-ring__fill { transition: stroke-dasharray .6s ease; stroke-linecap: round; }
  .score-circle__num {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    color: var(--c);
    margin-top: -6px;
  }
  .score-circle__lbl {
    font-size: 9px;
    color: var(--muted);
    margin-top: 2px;
    text-align: center;
  }

  /* Skills */
  .job-card__skills { display: flex; flex-wrap: wrap; gap: 5px; }
  .skill-chip {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    background: var(--bg3);
    color: var(--muted);
    border: 1px solid var(--border);
  }
  .skill-chip--more { color: var(--muted); font-style: italic; }
  .rome-badge {
    font-family: var(--font-mono);
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--c-accent) 12%, transparent);
    color: var(--c-accent);
    border: 1px solid color-mix(in srgb, var(--c-accent) 25%, transparent);
  }

  /* Breakdown bars */
  .job-card__breakdown { display: flex; flex-direction: column; gap: 4px; }
  .breakdown-bar { display: flex; align-items: center; gap: 8px; }
  .breakdown-bar__label { font-size: 10px; color: var(--muted); width: 72px; flex-shrink: 0; }
  .breakdown-bar__track {
    flex: 1;
    height: 3px;
    background: var(--bg3);
    border-radius: 2px;
    overflow: hidden;
  }
  .breakdown-bar__fill { height: 100%; border-radius: 2px; transition: width .5s ease; }
  .breakdown-bar__val { font-size: 10px; font-family: var(--font-mono); color: var(--muted); width: 20px; text-align: right; }

  /* Footer */
  .job-card__footer { display: flex; align-items: center; justify-content: space-between; }
  .job-card__meta {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: var(--muted);
    font-family: var(--font-mono);
  }
  .job-card__actions { display: flex; gap: 7px; align-items: center; }

  .btn-icon {
    background: none;
    border: 1px solid var(--border);
    color: var(--muted);
    width: 28px; height: 28px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    transition: all .12s;
  }
  .btn-icon:hover { border-color: var(--c-danger); color: var(--c-danger); }
  .btn-icon--active { border-color: var(--c-danger); color: var(--c-danger); background: color-mix(in srgb, var(--c-danger) 10%, transparent); }

  .btn-apply {
    background: var(--c-accent);
    color: #fff;
    padding: 5px 12px;
    border-radius: 6px;
    text-decoration: none;
    font-size: 12px;
    font-weight: 600;
    transition: opacity .12s;
    white-space: nowrap;
  }
  .btn-apply:hover { opacity: 0.85; }

  /* Load more */
  .btn-loadmore {
    width: 100%;
    padding: 12px;
    background: var(--bg2);
    border: 1px dashed var(--border);
    border-radius: var(--r);
    color: var(--muted);
    font-family: var(--font-ui);
    font-size: 13px;
    cursor: pointer;
    transition: all .12s;
    margin-top: 4px;
  }
  .btn-loadmore:hover:not(:disabled) { border-color: var(--c-accent); color: var(--c-accent); }
  .btn-loadmore:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Skeleton */
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .jobs-skeleton { display: flex; flex-direction: column; gap: 12px; }
  .skeleton-card {
    height: 130px;
    border-radius: var(--r);
    background: linear-gradient(90deg, var(--bg2) 25%, var(--bg3) 50%, var(--bg2) 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite;
  }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--muted);
  }
  .empty-state__emoji { font-size: 40px; margin-bottom: 12px; }
  .empty-state__text  { font-size: 16px; font-weight: 600; color: var(--text); }
  .empty-state__sub   { font-size: 13px; margin-top: 6px; }

  /* Error */
  .error-banner {
    background: color-mix(in srgb, var(--c-danger) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--c-danger) 30%, transparent);
    color: var(--c-danger);
    padding: 10px 14px;
    border-radius: var(--r);
    font-size: 13px;
    margin-bottom: 16px;
  }

  /* Notification panel */
  .notif-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.5);
    z-index: 200;
    display: flex;
    justify-content: flex-end;
  }
  .notif-panel {
    width: 360px;
    background: var(--bg2);
    border-left: 1px solid var(--border);
    height: 100%;
    overflow-y: auto;
    animation: slideIn .2s ease;
  }
  @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  .notif-panel__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid var(--border);
    font-size: 16px;
    font-weight: 700;
    position: sticky; top: 0;
    background: var(--bg2);
  }
  .notif-panel__header button {
    background: none; border: none; color: var(--muted);
    font-size: 20px; cursor: pointer; line-height: 1;
  }
  .notif-empty { padding: 40px 20px; text-align: center; color: var(--muted); font-size: 13px; }
  .notif-list { list-style: none; }
  .notif-item {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background .1s;
  }
  .notif-item:hover { background: var(--bg3); }
  .notif-item--unread { border-left: 3px solid var(--c-accent); }
  .notif-item__title { font-size: 13px; font-weight: 600; margin-bottom: 3px; }
  .notif-item__body  { font-size: 12px; color: var(--muted); }
  .notif-item__score {
    font-size: 11px;
    color: var(--c-accent);
    font-family: var(--font-mono);
    margin-top: 5px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar { display: none; }
    .main { padding: 16px; }
    .job-filters__row { flex-direction: column; }
    .notif-panel { width: 100%; }
  }
`;
