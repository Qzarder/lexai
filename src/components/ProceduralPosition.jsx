const LEVEL_CONFIG = {
  strong:       { color: "#27ae60", bg: "#eafaf1", border: "#a9dfbf", ru: "Сильная позиция",   en: "Strong position"  },
  moderate:     { color: "#e67e22", bg: "#fef9e7", border: "#f9e4b7", ru: "Умеренная позиция", en: "Moderate position"},
  weak:         { color: "#e74c3c", bg: "#fdedec", border: "#f5b7b1", ru: "Слабая позиция",    en: "Weak position"   },
  insufficient: { color: "#c0392b", bg: "#f9ebea", border: "#e6b0aa", ru: "Недостаточная",     en: "Insufficient"    },
};

const LABELS = {
  ru: { weakPoints: "Слабые места", noData: "Нет данных о позиции" },
  en: { weakPoints: "Weak points",  noData: "No position data"     },
  de: { weakPoints: "Schwachstellen", noData: "Keine Daten"        },
  fr: { weakPoints: "Points faibles", noData: "Aucune donnée"      },
  es: { weakPoints: "Puntos débiles", noData: "Sin datos"          },
};

export default function ProceduralPosition({ position, lang }) {
  const l = LABELS[lang] || LABELS.en;
  if (!position) return <div style={{ color: "#999", fontSize: 13, padding: "1rem 0" }}>{l.noData}</div>;

  const cfg = LEVEL_CONFIG[position.level] || LEVEL_CONFIG.moderate;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Level badge + verdict */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "1rem", background: cfg.bg, borderRadius: 12, border: `1px solid ${cfg.border}` }}>
        <div style={{ flexShrink: 0, padding: "5px 14px", background: "#fff", border: `1px solid ${cfg.border}`, borderRadius: 20, fontSize: 12, fontWeight: 700, color: cfg.color, whiteSpace: "nowrap" }}>
          {lang === "ru" ? cfg.ru : cfg.en}
        </div>
        <div style={{ fontSize: 14, color: "#1a1a18", lineHeight: 1.5 }}>{position.verdict}</div>
      </div>

      {/* Analysis */}
      {position.analysis && (
        <div style={{ fontSize: 13, color: "#333", lineHeight: 1.65, padding: "0 2px" }}>
          {position.analysis}
        </div>
      )}

      {/* Weak points */}
      {position.weakPoints?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#c0392b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l.weakPoints}</div>
          {position.weakPoints.map((pt, i) => (
            <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: "0.5px solid #f0f0ec", fontSize: 13 }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: 14, color: "#e67e22", flexShrink: 0, marginTop: 1 }} />
              <span style={{ color: "#444" }}>{pt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
