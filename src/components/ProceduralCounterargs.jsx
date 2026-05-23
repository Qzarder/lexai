const RISK_CONFIG = {
  high:   { color: "#c0392b", labelRu: "Высокий риск", labelEn: "High risk"    },
  medium: { color: "#e67e22", labelRu: "Средний риск", labelEn: "Medium risk"  },
  low:    { color: "#27ae60", labelRu: "Низкий риск",  labelEn: "Low risk"     },
};

const LABELS = {
  ru: { noData: "Нет данных", argument: "Аргумент оппонента", response: "Ответная позиция" },
  en: { noData: "No data",    argument: "Opposing argument",  response: "Counter-response"  },
  de: { noData: "Keine Daten", argument: "Gegenargument",     response: "Gegenantwort"      },
  fr: { noData: "Aucune donnée", argument: "Argument adverse", response: "Contre-argument"  },
  zh: { noData: "无数据",        argument: "对方论点",           response: "反驳要点"           },
  es: { noData: "Sin datos",  argument: "Argumento contrario", response: "Contra-argumento" },
};

export default function ProceduralCounterargs({ counterarguments, lang }) {
  const l = LABELS[lang] || LABELS.en;
  const isRu = lang === "ru";
  if (!counterarguments?.length) return <div style={{ color: "#999", fontSize: 13, padding: "1rem 0" }}>{l.noData}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {counterarguments.map(ca => {
        const cfg = RISK_CONFIG[ca.risk] || RISK_CONFIG.medium;
        return (
          <div key={ca.id} style={{ borderRadius: 10, border: "0.5px solid #e8e8e2", background: "#fafaf8", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: `${cfg.color}0d`, borderBottom: "0.5px solid #e8e8e2" }}>
              <i className="ti ti-shield-half" style={{ fontSize: 14, color: cfg.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {isRu ? cfg.labelRu : cfg.labelEn}
              </span>
            </div>
            {/* Argument */}
            <div style={{ padding: "10px 12px 0" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 4 }}>{l.argument}</div>
              <div style={{ fontSize: 13, color: "#333", lineHeight: 1.6 }}>{ca.argument}</div>
            </div>
            {/* Response */}
            {ca.response && (
              <div style={{ padding: "10px 12px 12px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#27ae60", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 4 }}>{l.response}</div>
                <div style={{ fontSize: 13, color: "#333", lineHeight: 1.6 }}>{ca.response}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
