import { riskColor } from "../utils";

export default function RiskChecklist({ risks }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(risks || []).map(r => {
        const c = riskColor(r.level);
        return (
          <div key={r.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{r.title}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: c.bg, color: c.color }}>{r.level}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{r.description}</div>
              {r.clause && <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 4, fontStyle: "italic" }}>"{r.clause}"</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
