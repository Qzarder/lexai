export default function LegalRefs({ legalRefs }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(legalRefs || []).map(ref => (
        <div key={ref.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{ref.article}</div>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{ref.law}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{ref.relevance}</div>
              {ref.location && <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 2 }}>↳ {ref.location}</div>}
            </div>
            {!ref.verified && (
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--color-background-warning)", color: "var(--color-text-warning)", whiteSpace: "nowrap", flexShrink: 0 }}>VERIFY</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
