const LEVEL_CONFIG = {
  favorable:   { color: "#27ae60", bg: "#eafaf1", border: "#a9dfbf", ru: "Благоприятные",   en: "Favorable"   },
  uncertain:   { color: "#e67e22", bg: "#fef9e7", border: "#f9e4b7", ru: "Неопределённые",  en: "Uncertain"   },
  unfavorable: { color: "#e74c3c", bg: "#fdedec", border: "#f5b7b1", ru: "Неблагоприятные", en: "Unfavorable" },
  poor:        { color: "#c0392b", bg: "#f9ebea", border: "#e6b0aa", ru: "Плохие",          en: "Poor"        },
};

const LABELS = {
  ru: { proceduralIssues: "Процессуальные проблемы", recommendation: "Рекомендация", noData: "Нет данных" },
  en: { proceduralIssues: "Procedural issues",        recommendation: "Recommendation", noData: "No data" },
  de: { proceduralIssues: "Verfahrensfehler",         recommendation: "Empfehlung",     noData: "Keine Daten" },
  fr: { proceduralIssues: "Problèmes procéduraux",    recommendation: "Recommandation", noData: "Aucune donnée" },
  zh: { proceduralIssues: "程序问题",                  recommendation: "建议",           noData: "无数据" },
  es: { proceduralIssues: "Problemas procesales",     recommendation: "Recomendación",  noData: "Sin datos" },
};

export default function ProceduralProspects({ prospects, lang }) {
  const l = LABELS[lang] || LABELS.en;
  if (!prospects) return <div style={{ color: "#999", fontSize: 13, padding: "1rem 0" }}>{l.noData}</div>;

  const cfg = LEVEL_CONFIG[prospects.level] || LEVEL_CONFIG.uncertain;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Level badge + verdict */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "1rem", background: cfg.bg, borderRadius: 12, border: `1px solid ${cfg.border}` }}>
        <div style={{ flexShrink: 0, padding: "5px 14px", background: "#fff", border: `1px solid ${cfg.border}`, borderRadius: 20, fontSize: 12, fontWeight: 700, color: cfg.color, whiteSpace: "nowrap" }}>
          {lang === "ru" ? cfg.ru : cfg.en}
        </div>
        <div style={{ fontSize: 14, color: "#1a1a18", lineHeight: 1.5 }}>{prospects.verdict}</div>
      </div>

      {/* Procedural issues */}
      {prospects.proceduralIssues?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#c0392b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l.proceduralIssues}</div>
          {prospects.proceduralIssues.map((issue, i) => (
            <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: "0.5px solid #f0f0ec", fontSize: 13 }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 14, color: "#c0392b", flexShrink: 0, marginTop: 1 }} />
              <span style={{ color: "#444" }}>{issue}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recommendation */}
      {prospects.recommendation && (
        <div style={{ background: "#f0f6ff", borderRadius: 10, padding: "1rem", border: "0.5px solid #c0d8f0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#378ADD", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>{l.recommendation}</div>
          <div style={{ fontSize: 13, color: "#2c3e50", lineHeight: 1.65 }}>{prospects.recommendation}</div>
        </div>
      )}
    </div>
  );
}
