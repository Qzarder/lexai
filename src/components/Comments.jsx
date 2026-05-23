import { commentIcon, commentColor } from "../utils";

export default function Comments({ comments }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(comments || []).map(c => (
        <div key={c.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <i className={`ti ${commentIcon[c.type] || "ti-info-circle"}`} style={{ fontSize: 15, color: commentColor[c.type] }} aria-hidden="true" />
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)" }}>{c.section}</span>
          </div>
          <div style={{ fontSize: 13 }}>{c.text}</div>
        </div>
      ))}
    </div>
  );
}
