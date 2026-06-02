// ─────────────────────────────────────────────
// ALERTIO — pages/profile.tsx
// User profile editor: ROME codes, skills,
// notification threshold, contract preferences
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import Head                    from "next/head";
import { useRouter }           from "next/router";
import { useAuth }             from "../hooks/useAuth";
import { saveProfile }         from "../lib/api";
import { searchRome }          from "../../../../packages/core/src/romeTree";
import type { UserProfile, ProfessionalProfile, UserPreferences } from "../../../../packages/core/src/types";

export default function Profile() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();

  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState("");

  // Local form state
  const [romeInput,  setRomeInput]  = useState("");
  const [romeSugg,   setRomeSugg]   = useState<ReturnType<typeof searchRome>>([]);
  const [skillInput, setSkillInput] = useState("");
  const [form,       setForm]       = useState<{
    romeCodes:     string[];
    primarySkills: string[];
    skills:        string[];
    sectors:       string[];
    nafCodes:      string[];
    themes:        string[];
    contexts:      string[];
    threshold:     number;
    contracts:     string[];
    remotes:       string[];
    displayName:   string;
  }>({
    romeCodes:     [],
    primarySkills: [],
    skills:        [],
    sectors:       [],
    nafCodes:      [],
    themes:        [],
    contexts:      [],
    threshold:     70,
    contracts:     ["CDI"],
    remotes:       ["NONE", "PARTIAL", "FULL"],
    displayName:   "",
  });

  // Populate from existing profile
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (profile) {
      setForm({
        romeCodes:     profile.profile.romeCodes,
        primarySkills: profile.profile.primarySkills,
        skills:        profile.profile.skills,
        sectors:       profile.profile.sectors,
        nafCodes:      profile.profile.nafCodes,
        themes:        profile.profile.themes,
        contexts:      profile.profile.contexts,
        threshold:     profile.preferences.notificationThreshold,
        contracts:     profile.preferences.contractTypes,
        remotes:       profile.preferences.remoteTypes,
        displayName:   profile.displayName ?? "",
      });
    }
  }, [profile, loading, user, router]);

  // ── ROME ────────────────────────────────────────────────────────────────────
  function handleRomeInput(q: string) {
    setRomeInput(q);
    setRomeSugg(q.length >= 2 ? searchRome(q).slice(0, 5) : []);
  }

  function addRome(code: string) {
    if (!form.romeCodes.includes(code)) {
      setForm(f => ({ ...f, romeCodes: [...f.romeCodes, code] }));
    }
    setRomeInput("");
    setRomeSugg([]);
  }

  function removeRome(code: string) {
    setForm(f => ({ ...f, romeCodes: f.romeCodes.filter(r => r !== code) }));
  }

  // ── Skills ───────────────────────────────────────────────────────────────────
  function addSkill(primary = false) {
    const s = skillInput.trim();
    if (!s) return;
    setForm(f => ({
      ...f,
      skills:        f.skills.includes(s)        ? f.skills        : [...f.skills, s],
      primarySkills: primary && !f.primarySkills.includes(s)
        ? [...f.primarySkills, s] : f.primarySkills,
    }));
    setSkillInput("");
  }

  function removeSkill(s: string) {
    setForm(f => ({
      ...f,
      skills:        f.skills.filter(x => x !== s),
      primarySkills: f.primarySkills.filter(x => x !== s),
    }));
  }

  function togglePrimary(s: string) {
    setForm(f => ({
      ...f,
      primarySkills: f.primarySkills.includes(s)
        ? f.primarySkills.filter(x => x !== s)
        : [...f.primarySkills, s],
    }));
  }

  // ── Contract / Remote toggles ────────────────────────────────────────────────
  function toggleArray(key: "contracts" | "remotes", val: string) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val)
        ? f[key].filter((x: string) => x !== val)
        : [...f[key], val],
    }));
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      const prof: Partial<UserProfile> = {
        displayName: form.displayName || undefined,
        preferences: {
          notificationThreshold: form.threshold,
          contractTypes:         form.contracts as UserPreferences["contractTypes"],
          remoteTypes:           form.remotes   as UserPreferences["remoteTypes"],
        },
        profile: {
          ...profile?.profile,
          romeCodes:     form.romeCodes,
          primarySkills: form.primarySkills,
          skills:        form.skills,
          sectors:       form.sectors,
          nafCodes:      form.nafCodes,
          themes:        form.themes,
          contexts:      form.contexts,
          appellations:  profile?.profile.appellations ?? [],
          savoir:        profile?.profile.savoir        ?? [],
          savoirFaire:   profile?.profile.savoirFaire   ?? [],
        } as ProfessionalProfile,
      };
      await saveProfile(user.uid, prof);
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <>
      <Head>
        <title>Alertio — Mon profil</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>
      <style>{STYLES}</style>

      <div className="profile-wrap">
        {/* Header */}
        <header className="profile-header">
          <button className="btn-back" onClick={() => router.push("/dashboard")}>← Retour</button>
          <div className="profile-header__logo">Alert<span>io</span></div>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? "Sauvegarde…" : saved ? "✓ Sauvegardé" : "Sauvegarder"}
          </button>
        </header>

        <div className="profile-body">
          <h1 className="profile-title">Mon profil de recherche</h1>
          <p className="profile-sub">Ces informations alimentent votre score de matching (0–100)</p>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="profile-sections">

            {/* ── Identité ── */}
            <Section title="Identité" hint="Votre nom affiché">
              <div className="field">
                <label className="field__label">Nom affiché</label>
                <input
                  type="text"
                  className="field__input"
                  value={form.displayName}
                  onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                  placeholder="Prénom Nom"
                />
              </div>
            </Section>

            {/* ── Codes ROME ── */}
            <Section title="Codes ROME" hint="Métiers ciblés · poids 40% dans le score">
              <div className="rome-picker">
                <div className="rome-input-wrap">
                  <input
                    type="text"
                    className="field__input"
                    value={romeInput}
                    onChange={e => handleRomeInput(e.target.value)}
                    placeholder="Rechercher un métier ou code ROME…"
                  />
                </div>
                {romeSugg.length > 0 && (
                  <ul className="rome-dropdown">
                    {romeSugg.map((n: ReturnType<typeof searchRome>[number]) => (
                      <li key={n.code} className="rome-option" onClick={() => addRome(n.code)} tabIndex={0}
                          onKeyDown={e => e.key === "Enter" && addRome(n.code)}>
                        <span className="rome-option__code">{n.code}</span>
                        <span className="rome-option__label">{n.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="tag-list" aria-label="Codes ROME sélectionnés">
                {form.romeCodes.map(c => (
                  <span key={c} className="tag tag--rome">
                    {c}
                    <button className="tag__remove" onClick={() => removeRome(c)} aria-label={`Retirer ${c}`}>×</button>
                  </span>
                ))}
                {form.romeCodes.length === 0 && (
                  <span className="field-hint">Aucun code ROME sélectionné</span>
                )}
              </div>
            </Section>

            {/* ── Compétences ── */}
            <Section title="Compétences" hint="Poids 35% · les primaires comptent ×1.4">
              <div className="skill-input-row">
                <input
                  type="text"
                  className="field__input"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  placeholder="React, Node.js, Python…"
                  onKeyDown={e => e.key === "Enter" && addSkill(false)}
                />
                <button className="btn-add" onClick={() => addSkill(false)}>+ Ajouter</button>
                <button className="btn-add btn-add--primary" onClick={() => addSkill(true)} title="Ajouter comme compétence principale (×1.4)">
                  ★ Principale
                </button>
              </div>
              <div className="tag-list skill-list" aria-label="Compétences">
                {form.skills.map(s => {
                  const isPrimary = form.primarySkills.includes(s);
                  return (
                    <span key={s} className={`tag tag--skill ${isPrimary ? "tag--primary" : ""}`}>
                      <button
                        className="tag__star"
                        onClick={() => togglePrimary(s)}
                        aria-label={isPrimary ? "Retirer des principales" : "Marquer comme principale"}
                        title={isPrimary ? "Principale (×1.4)" : "Marquer principale"}
                      >
                        {isPrimary ? "★" : "☆"}
                      </button>
                      {s}
                      <button className="tag__remove" onClick={() => removeSkill(s)} aria-label={`Retirer ${s}`}>×</button>
                    </span>
                  );
                })}
                {form.skills.length === 0 && <span className="field-hint">Aucune compétence ajoutée</span>}
              </div>
              {form.primarySkills.length > 0 && (
                <p className="field-hint" style={{ marginTop: 8 }}>
                  Principales : {form.primarySkills.join(", ")}
                </p>
              )}
            </Section>

            {/* ── Préférences contrat / remote ── */}
            <Section title="Préférences" hint="Types de contrat et télétravail souhaités">
              <div className="pref-group">
                <p className="pref-group__label">Type de contrat</p>
                <div className="chip-row">
                  {["CDI", "CDD", "INTERIM", "FREELANCE", "STAGE", "APPRENTISSAGE"].map(c => (
                    <button
                      key={c}
                      className={`chip ${form.contracts.includes(c) ? "chip--active" : ""}`}
                      onClick={() => toggleArray("contracts", c)}
                    >{c}</button>
                  ))}
                </div>
              </div>
              <div className="pref-group">
                <p className="pref-group__label">Télétravail</p>
                <div className="chip-row">
                  {[
                    { v: "NONE",    l: "Sur site"   },
                    { v: "PARTIAL", l: "Hybride"    },
                    { v: "FULL",    l: "100% Remote"},
                  ].map(({ v, l }) => (
                    <button
                      key={v}
                      className={`chip ${form.remotes.includes(v) ? "chip--active" : ""}`}
                      onClick={() => toggleArray("remotes", v)}
                    >{l}</button>
                  ))}
                </div>
              </div>
            </Section>

            {/* ── Seuil notification ── */}
            <Section title="Seuil de notification" hint="Score minimum pour recevoir une alerte push">
              <div className="threshold-wrap">
                <input
                  type="range"
                  min={50} max={95} step={5}
                  value={form.threshold}
                  onChange={e => setForm(f => ({ ...f, threshold: Number(e.target.value) }))}
                  className="threshold-slider"
                  aria-label="Seuil de notification"
                />
                <div className="threshold-display">
                  <span className="threshold-display__num">{form.threshold}</span>
                  <span className="threshold-display__lbl">/ 100 minimum</span>
                </div>
              </div>
              <p className="field-hint">
                Seules les offres avec un score ≥ {form.threshold} déclencheront une notification push.
              </p>
            </Section>

          </div>

          {/* Save bar */}
          <div className="save-bar">
            {error && <p className="form-error">{error}</p>}
            <button className="btn-save-main" onClick={handleSave} disabled={saving}>
              {saving ? "Sauvegarde en cours…" : saved ? "✓ Profil sauvegardé !" : "Sauvegarder le profil"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="profile-section">
      <div className="profile-section__head">
        <h2 className="profile-section__title">{title}</h2>
        {hint && <p className="profile-section__hint">{hint}</p>}
      </div>
      <div className="profile-section__body">{children}</div>
    </section>
  );
}

const STYLES = `
  :root {
    --bg:#0E0F11; --bg2:#161719; --bg3:#1E2023; --border:#2A2C30;
    --text:#E8E9EB; --muted:#6B6E75;
    --c-accent:#1D9E75; --c-danger:#D85A30; --c-gold:#E09132;
    --font-ui:'Syne',sans-serif; --font-mono:'DM Mono',monospace; --r:10px;
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--bg);color:var(--text);font-family:var(--font-ui);-webkit-font-smoothing:antialiased;}

  .profile-wrap{max-width:760px;margin:0 auto;padding:0 24px 80px;}

  .profile-header{
    display:flex;align-items:center;justify-content:space-between;
    padding:20px 0;border-bottom:1px solid var(--border);margin-bottom:32px;
    position:sticky;top:0;background:var(--bg);z-index:10;
  }
  .profile-header__logo{font-size:18px;font-weight:700;letter-spacing:-0.5px;}
  .profile-header__logo span{color:var(--c-accent);}
  .btn-back{background:none;border:1px solid var(--border);color:var(--muted);padding:7px 12px;border-radius:8px;cursor:pointer;font-family:var(--font-ui);font-size:13px;transition:all .12s;}
  .btn-back:hover{border-color:var(--muted);color:var(--text);}
  .btn-save{background:var(--c-accent);border:none;color:#fff;padding:8px 16px;border-radius:8px;cursor:pointer;font-family:var(--font-ui);font-size:13px;font-weight:600;transition:opacity .12s;}
  .btn-save:hover:not(:disabled){opacity:.85;}
  .btn-save:disabled{opacity:.5;cursor:not-allowed;}

  .profile-title{font-size:24px;font-weight:700;letter-spacing:-0.5px;margin-bottom:6px;}
  .profile-sub{font-size:13px;color:var(--muted);margin-bottom:32px;}

  .profile-sections{display:flex;flex-direction:column;gap:1px;border:1px solid var(--border);border-radius:var(--r);overflow:hidden;}

  .profile-section{background:var(--bg2);}
  .profile-section__head{padding:20px 24px 0;}
  .profile-section__title{font-size:15px;font-weight:600;margin-bottom:3px;}
  .profile-section__hint{font-size:12px;color:var(--muted);margin-bottom:16px;}
  .profile-section__body{padding:0 24px 20px;}
  .profile-section + .profile-section{border-top:1px solid var(--border);}

  .field{margin-bottom:12px;}
  .field__label{display:block;font-size:12px;font-weight:600;margin-bottom:6px;}
  .field__input{width:100%;padding:9px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--font-ui);font-size:13px;outline:none;transition:border-color .12s;}
  .field__input:focus{border-color:var(--c-accent);}
  .field__input::placeholder{color:var(--muted);}
  .field-hint{font-size:11px;color:var(--muted);}

  .form-error{font-size:12px;color:var(--c-danger);padding:8px 12px;background:color-mix(in srgb,var(--c-danger) 10%,transparent);border-radius:6px;border-left:3px solid var(--c-danger);margin-bottom:16px;}

  /* ROME picker */
  .rome-picker{position:relative;margin-bottom:12px;}
  .rome-input-wrap{position:relative;}
  .rome-dropdown{position:absolute;top:calc(100% + 4px);left:0;right:0;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);list-style:none;z-index:50;box-shadow:0 8px 24px rgba(0,0,0,.4);overflow:hidden;}
  .rome-option{display:flex;gap:10px;align-items:baseline;padding:9px 14px;cursor:pointer;transition:background .1s;}
  .rome-option:hover{background:var(--bg3);}
  .rome-option__code{font-family:var(--font-mono);font-size:11px;color:var(--c-accent);flex-shrink:0;}
  .rome-option__label{font-size:13px;}

  /* Tags */
  .tag-list{display:flex;flex-wrap:wrap;gap:6px;min-height:28px;}
  .tag{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:6px;font-size:12px;background:var(--bg3);border:1px solid var(--border);}
  .tag--rome{font-family:var(--font-mono);color:var(--c-accent);border-color:color-mix(in srgb,var(--c-accent) 30%,var(--border));}
  .tag--skill{color:var(--text);}
  .tag--primary{background:color-mix(in srgb,var(--c-gold) 12%,var(--bg3));border-color:color-mix(in srgb,var(--c-gold) 30%,var(--border));color:var(--c-gold);}
  .tag__remove{background:none;border:none;color:var(--muted);cursor:pointer;font-size:14px;line-height:1;padding:0 2px;}
  .tag__remove:hover{color:var(--c-danger);}
  .tag__star{background:none;border:none;cursor:pointer;font-size:13px;line-height:1;padding:0;color:inherit;}

  /* Skill input */
  .skill-input-row{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;}
  .skill-input-row .field__input{flex:1;min-width:180px;}
  .btn-add{background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:9px 14px;border-radius:8px;cursor:pointer;font-family:var(--font-ui);font-size:12px;white-space:nowrap;transition:all .12s;}
  .btn-add:hover{border-color:var(--c-accent);color:var(--c-accent);}
  .btn-add--primary{border-color:color-mix(in srgb,var(--c-gold) 40%,var(--border));color:var(--c-gold);}
  .btn-add--primary:hover{border-color:var(--c-gold);}

  /* Chips */
  .chip-row{display:flex;flex-wrap:wrap;gap:6px;}
  .pref-group{margin-bottom:16px;}
  .pref-group__label{font-size:12px;font-weight:600;margin-bottom:8px;color:var(--muted);}
  .chip{padding:6px 12px;border-radius:99px;border:1px solid var(--border);background:transparent;color:var(--muted);font-family:var(--font-ui);font-size:12px;cursor:pointer;transition:all .12s;}
  .chip:hover{border-color:var(--muted);color:var(--text);}
  .chip--active{background:var(--c-accent);border-color:var(--c-accent);color:#fff;}

  /* Threshold */
  .threshold-wrap{display:flex;align-items:center;gap:20px;margin-bottom:8px;}
  .threshold-slider{flex:1;accent-color:var(--c-accent);cursor:pointer;height:4px;}
  .threshold-display{display:flex;align-items:baseline;gap:5px;flex-shrink:0;}
  .threshold-display__num{font-family:var(--font-mono);font-size:28px;font-weight:500;color:var(--c-accent);}
  .threshold-display__lbl{font-size:12px;color:var(--muted);}

  /* Save bar */
  .save-bar{position:fixed;bottom:0;left:0;right:0;background:var(--bg2);border-top:1px solid var(--border);padding:16px 24px;display:flex;justify-content:center;align-items:center;gap:16px;z-index:20;}
  .btn-save-main{background:var(--c-accent);border:none;color:#fff;padding:11px 32px;border-radius:8px;cursor:pointer;font-family:var(--font-ui);font-size:14px;font-weight:600;transition:opacity .12s;min-width:240px;}
  .btn-save-main:hover:not(:disabled){opacity:.88;}
  .btn-save-main:disabled{opacity:.5;cursor:not-allowed;}
`;
