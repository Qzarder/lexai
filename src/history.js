const KEY       = "lexai_history";
const TTL_MS    = 90  * 24 * 60 * 60 * 1000; // 3 months base
const EXT_MS    = 90  * 24 * 60 * 60 * 1000; // +3 months per extension
const MAX_EXT   = 2;                           // max 2 extensions → 9 months total
const MAX_ITEMS = 100;
const WARN_DAYS = 14;                          // warn X days before expiry

export function saveToHistory({ id, date, docNames, mode, jurisdiction, jurisdictionLabel, docType, overallRisk, level, verdict, result }) {
  const entries = getRaw();
  const entry = {
    id,
    date,
    docNames,    // string or array
    mode,
    jurisdiction,
    jurisdictionLabel,
    docType,
    overallRisk, // contract mode
    level,       // procedural mode
    verdict,
    result,
    expiresAt:   Date.now() + TTL_MS,
    extensions:  0,
  };
  const updated = [entry, ...entries.filter(e => e.id !== id)].slice(0, MAX_ITEMS);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function getHistory() {
  const now = Date.now();
  const entries = getRaw().filter(e => e.expiresAt > now);
  // prune expired silently
  localStorage.setItem(KEY, JSON.stringify(entries));
  return entries;
}

export function deleteFromHistory(id) {
  const entries = getRaw().filter(e => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function extendEntry(id) {
  const entries = getRaw().map(e => {
    if (e.id !== id) return e;
    if ((e.extensions || 0) >= MAX_EXT) return e;
    return { ...e, expiresAt: e.expiresAt + EXT_MS, extensions: (e.extensions || 0) + 1 };
  });
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function daysUntilExpiry(entry) {
  return Math.ceil((entry.expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
}

export function isExpiringSoon(entry) {
  return daysUntilExpiry(entry) <= WARN_DAYS;
}

export { MAX_EXT, WARN_DAYS };

function getRaw() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}
