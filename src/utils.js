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
