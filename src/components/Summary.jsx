import { scoreColor } from "../utils";
import { UI } from "../constants/ui";

export default function Summary({ summary, lang }) {
  if (!summary) return null;
  const ui = UI[lang] || UI.en;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem", border: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 4 }}>{ui.summaryVerdict}</div>
        <div style={{ fontSize: 15 }}>{summary.verdict}</div>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{ui.summaryKeyIssues}</div>
        {(summary.keyIssues || []).map((issue, i) => (
          <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 13 }}>
            <i className="ti ti-point" style={{ fontSize: 14, color: "var(--color-text-danger)", marginTop: 1, flexShrink: 0 }} aria-hidden="true" />
            {issue}
          </div>
        ))}
      </div>
      <div style={{ background: "var(--color-background-info)", borderRadius: "var(--border-radius-md)", padding: "1rem", border: "0.5px solid var(--color-border-info)" }}>
        <div style={{ fontSize: 12, color: "var(--color-text-info)", marginBottom: 4, fontWeight: 500 }}>{ui.summaryRecommendation.toUpperCase()}</div>
        <div style={{ fontSize: 13, color: "var(--color-text-info)" }}>{summary.recommendation}</div>
      </div>
      <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", fontStyle: "italic" }}>
        {ui.summaryDisclaimer}
      </div>
    </div>
  );
}
