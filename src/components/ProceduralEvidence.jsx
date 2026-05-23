const STATUS_CONFIG = {
  present: { icon: "ti-circle-check", color: "#27ae60", labelRu: "Есть",        labelEn: "Present" },
  weak:    { icon: "ti-alert-circle", color: "#e67e22", labelRu: "Слабое",      labelEn: "Weak"    },
  missing: { icon: "ti-circle-x",    color: "#c0392b", labelRu: "Отсутствует", labelEn: "Missing" },
};

const LABELS = {
  ru: { title: "Доказательная база", noData: "Нет данных о доказательствах", recommend: "Рекомендация" },
  en: { title: "Evidence base",       noData: "No evidence data",              recommend: "Recommendation" },
  de: { title: "Beweisgrundlage",     noData: "Keine Beweisdaten",             recommend: "Empfehlung" },
  fr: { title: "Base de preuves",     noData: "Aucune donnée de preuve",       recommend: "Recommandation" },
  zh: { title: "证据基础",              noData: "无证据数据",                     recommend: "建议" },
  es: { title: "Base probatoria",     noData: "Sin datos de prueba",           recommend: "Recomendación" },
};

export default function ProceduralEvidence({ evidence, lang }) {
  const l = LABELS[lang] || LABELS.en;
  const isRu = lang === "ru";
  if (!evidence?.length) return <div style={{ color: "#999", fontSize: 13, padding: "1rem 0" }}>{l.noData}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {evidence.map(ev => {
        const cfg = STATUS_CONFIG[ev.status] || STATUS_CONFIG.weak;
        return (
          <div key={ev.id} style={{ borderRadius: 10, border: `0.5px solid ${cfg.color}33`, background: `${cfg.color}08`, padding: "0.9rem 1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <i className={`ti ${cfg.icon}`} style={{ fontSize: 16, color: cfg.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18", flex: 1 }}>{ev.title}</span>
              <span style={{ fontSize: 11, color: cfg.color, fontWeight: 600, background: `${cfg.color}18`, padding: "2px 8px", borderRadius: 20, flexShrink: 0 }}>
                {isRu ? cfg.labelRu : cfg.labelEn}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6, marginBottom: ev.recommendation ? 8 : 0 }}>{ev.description}</div>
            {ev.recommendation && (
              <div style={{ fontSize: 12, color: "#555", background: "#fff", borderRadius: 6, padding: "6px 10px", borderLeft: "3px solid #378ADD" }}>
                <span style={{ fontWeight: 600, color: "#378ADD" }}>{l.recommend}: </span>
                {ev.recommendation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
