const TEXTS = {
  ru: [
    { icon: "ti-database-off", text: "Документы не сохраняются" },
    { icon: "ti-lock",         text: "Передача только по HTTPS" },
    { icon: "ti-shield",       text: "API-ключ только на сервере" },
    { icon: "ti-alert-triangle", text: "Анализ — не юр. консультация", warn: true },
  ],
  en: [
    { icon: "ti-database-off", text: "Documents not stored" },
    { icon: "ti-lock",         text: "HTTPS encrypted transfer" },
    { icon: "ti-shield",       text: "API key server-side only" },
    { icon: "ti-alert-triangle", text: "Analysis ≠ legal advice", warn: true },
  ],
};

export default function PrivacyBar({ lang }) {
  const items = TEXTS[lang] || TEXTS.en;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 12px", borderRadius: 8, background: "#f4f4f1", border: "0.5px solid #e0e0da", marginBottom: "1rem" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: item.warn ? "#BA7517" : "#5a5a56" }}>
          <i className={`ti ${item.icon}`} style={{ fontSize: 13 }} aria-hidden="true" />
          {item.text}
          {i < items.length - 1 && <span style={{ color: "#ccc", marginLeft: 4 }}>·</span>}
        </div>
      ))}
    </div>
  );
}
