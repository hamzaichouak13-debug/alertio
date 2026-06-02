// ─────────────────────────────────────────────
// ALERTIO — components/jobs/JobFilters.tsx
// ─────────────────────────────────────────────

import { useState } from "react";
import type { JobsFilters } from "../../lib/api";
import { searchRome } from "../../../../../packages/core/src/romeTree";

interface JobFiltersProps {
  filters:    JobsFilters;
  onChange:   (f: Partial<JobsFilters>) => void;
  totalCount: number;
  lastRefresh: Date | null;
}

const CONTRACT_OPTIONS = [
  { value: "",          label: "Tous contrats" },
  { value: "CDI",       label: "CDI" },
  { value: "CDD",       label: "CDD" },
  { value: "INTERIM",   label: "Intérim" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "STAGE",     label: "Stage" },
];

const REMOTE_OPTIONS = [
  { value: "",        label: "Tous" },
  { value: "FULL",    label: "100% Remote" },
  { value: "PARTIAL", label: "Hybride" },
  { value: "NONE",    label: "Sur site" },
];

export function JobFilters({ filters, onChange, totalCount, lastRefresh }: JobFiltersProps) {
  const [romeSearch, setRomeSearch] = useState("");
  const [romeSuggestions, setRomeSuggestions] = useState<ReturnType<typeof searchRome>>([]);
  const [showRomePicker, setShowRomePicker] = useState(false);

  function handleRomeInput(q: string) {
    setRomeSearch(q);
    if (q.length >= 2) {
      setRomeSuggestions(searchRome(q).slice(0, 6));
      setShowRomePicker(true);
    } else {
      setRomeSuggestions([]);
      setShowRomePicker(false);
    }
  }

  function selectRome(code: string) {
    onChange({ romeCode: code });
    setRomeSearch(code);
    setShowRomePicker(false);
  }

  const refreshAge = lastRefresh
    ? Math.floor((Date.now() - lastRefresh.getTime()) / 60000)
    : null;

  return (
    <div className="job-filters">
      {/* Status bar */}
      <div className="job-filters__status">
        <span className="job-filters__count">{totalCount} offre{totalCount !== 1 ? "s" : ""}</span>
        {refreshAge !== null && (
          <span className="job-filters__refresh">
            <span className="refresh-dot" />
            mis à jour {refreshAge === 0 ? "à l'instant" : `il y a ${refreshAge} min`}
          </span>
        )}
      </div>

      {/* Filter row */}
      <div className="job-filters__row">
        {/* Contract chips */}
        <div className="chip-group" role="group" aria-label="Type de contrat">
          {CONTRACT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`chip ${(filters.contract ?? "") === opt.value ? "chip--active" : ""}`}
              onClick={() => onChange({ contract: opt.value || undefined })}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Remote chips */}
        <div className="chip-group" role="group" aria-label="Télétravail">
          {REMOTE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`chip ${(filters.remote ?? "") === opt.value ? "chip--active" : ""}`}
              onClick={() => onChange({ remote: opt.value || undefined })}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ROME search */}
        <div className="rome-search" role="search">
          <div className="rome-search__input-wrap">
            <input
              type="text"
              placeholder="Code ROME (ex: M1805)"
              value={romeSearch}
              onChange={e => handleRomeInput(e.target.value)}
              onFocus={() => romeSearch.length >= 2 && setShowRomePicker(true)}
              className="rome-search__input"
              aria-label="Rechercher par code ROME"
              aria-expanded={showRomePicker}
              aria-haspopup="listbox"
            />
            {filters.romeCode && (
              <button
                className="rome-search__clear"
                onClick={() => { onChange({ romeCode: undefined }); setRomeSearch(""); }}
                aria-label="Effacer le filtre ROME"
              >
                ×
              </button>
            )}
          </div>

          {showRomePicker && romeSuggestions.length > 0 && (
            <ul className="rome-search__dropdown" role="listbox">
              {romeSuggestions.map(node => (
                <li
                  key={node.code}
                  className="rome-search__option"
                  role="option"
                  onClick={() => selectRome(node.code)}
                  onKeyDown={e => e.key === "Enter" && selectRome(node.code)}
                  tabIndex={0}
                >
                  <span className="rome-search__code">{node.code}</span>
                  <span className="rome-search__label">{node.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
