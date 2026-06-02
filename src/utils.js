export const riskColor = (level) => ({
  critical: { bg: "var(--color-background-danger)", color: "var(--color-text-danger)", dot: "#E24B4A" },
  warning:  { bg: "var(--color-background-warning)", color: "var(--color-text-warning)", dot: "#EF9F27" },
  ok:       { bg: "var(--color-background-success)", color: "var(--color-text-success)", dot: "#639922" },
}[level] || { bg: "var(--color-background-secondary)", color: "var(--color-text-secondary)", dot: "#888" });

export const commentIcon = {
  issue:      "ti-alert-triangle",
  suggestion: "ti-bulb",
  neutral:    "ti-info-circle",
};

export const commentColor = {
  issue:      "var(--color-text-danger)",
  suggestion: "var(--color-text-warning)",
  neutral:    "var(--color-text-secondary)",
};

export const scoreColor = (s) =>
  s >= 80 ? "var(--color-text-success)"
  : s >= 50 ? "var(--color-text-warning)"
  : "var(--color-text-danger)";

// ---- Weighted risk scoring (deterministic) -------------------------------
// The model only judges each axis (severity 0–3). The final risk category is
// computed HERE, by fixed arithmetic, so the same severities always produce
// the same verdict — that is what makes the score reproducible.
export const SCORING_AXES = {
  legality:       { weight: 3, core: true },
  fairness:       { weight: 3, core: true },
  liability:      { weight: 3, core: true },
  penalties:      { weight: 3, core: true },
  termination:    { weight: 2, core: false },
  governing_law:  { weight: 2, core: false },
  enforceability: { weight: 2, core: false },
  data_ip:        { weight: 1, core: false },
};

const RANK_RISK = ["low", "medium", "high", "critical"];

// Returns { riskIndex, overallRisk, drivers } or { overallRisk: null } when the
// document carries no applicable axes (e.g. procedural analysis) — caller then
// keeps the model's own summary.overallRisk.
export function computeScoring(axes) {
  const list = Array.isArray(axes) ? axes : [];
  let num = 0, den = 0, floor = -1;
  const drivers = [];
  for (const a of list) {
    const cfg = SCORING_AXES[a?.key];
    if (!cfg) continue;
    if (a.applicable === false || a.severity == null) continue;
    const sev = Math.max(0, Math.min(3, Number(a.severity) || 0));
    num += sev * cfg.weight;
    den += 3 * cfg.weight;
    if (sev === 3) floor = Math.max(floor, cfg.core ? 3 : 2); // core→critical, else→high
    if (sev >= 2) drivers.push({ key: a.key, w: sev * cfg.weight });
  }
  if (den === 0) return { riskIndex: 0, overallRisk: null, drivers: [] };
  const riskIndex = num / den;
  let base;
  if (riskIndex < 0.15) base = 0;
  else if (riskIndex < 0.35) base = 1;
  else if (riskIndex < 0.60) base = 2;
  else base = 3;
  const rank = Math.max(base, floor);
  drivers.sort((x, y) => y.w - x.w);
  return {
    riskIndex: Math.round(riskIndex * 100) / 100,
    overallRisk: RANK_RISK[rank],
    drivers: drivers.slice(0, 3).map((d) => d.key),
  };
}
