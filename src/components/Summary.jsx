import { UI } from "../constants/ui";

// Localized axis labels (ru/en, fallback en) — keys match the scoring rubric.
const AXIS = {
  legality:       { ru: "Законность", en: "Legality" },
  fairness:       { ru: "Баланс прав сторон", en: "Balance of rights" },
  liability:      { ru: "Ответственность", en: "Liability" },
  penalties:      { ru: "Санкции и неустойки", en: "Penalties" },
  termination:    { ru: "Расторжение и выход", en: "Termination" },
  governing_law:  { ru: "Право и подсудность", en: "Governing law" },
  enforceability: { ru: "Исполнимость условий", en: "Enforceability" },
  data_ip:        { ru: "Данные и ИС", en: "Data & IP" },
};

const SEV = {
  0: { ru: "ОК",        en: "OK",        color: "var(--color-text-success)",  bg: "var(--color-background-success)" },
  1: { ru: "Внимание",  en: "Note",      color: "var(--color-text-secondary)",bg: "var(--color-background-secondary)" },
  2: { ru: "Переговоры",en: "Negotiate", color: "var(--color-text-warning)",  bg: "var(--color-background-warning)" },
  3: { ru: "Критично",  en: "Critical",  color: "var(--color-text-danger)",   bg: "var(--color-background-danger)" },
};

const L = (lang) => (lang === "ru" ? "ru" : "en");

function ScoreBreakdown({ scoring, lang }) {
  const axes = scoring?.axes;
  if (!Array.isArray(axes) || axes.length === 0) return null;
  const l = L(lang);

  const applicable = axes
    .filter((a) => a && a.applicable !== false && a.severity != null && AXIS[a.key])
    .map((a) => ({ ...a, severity: Math.max(0, Math.min(3, Number(a.severity) || 0)) }))
    .sort((a, b) => b.severity - a.severity);
  if (applicable.length === 0) return null;

  const naKeys = axes
    .filter((a) => a && (a.applicable === false || a.severity == null) && AXIS[a.key])
    .map((a) => AXIS[a.key][l]);

  const title = l === "ru" ? "Оценка по критериям" : "Score by criteria";
  const naLabel = l === "ru" ? "Не применимо" : "Not applicable";
  const driverKeys = Array.isArray(scoring?.drivers) ? scoring.drivers : [];

  return (
    <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem", border: "0.5px solid var(--color-border-tertiary)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
        {typeof scoring?.riskIndex === "number" && (
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
            {l === "ru" ? "Индекс" : "Index"} {scoring.riskIndex.toFixed(2)}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {applicable.map((a) => {
          const sev = SEV[a.severity];
          const isDriver = driverKeys.includes(a.key);
          return (
            <div key={a.key} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: isDriver ? 600 : 400 }}>
                  {AXIS[a.key][l]}
                  {isDriver && <span style={{ color: "var(--color-text-danger)", marginLeft: 5 }} aria-hidden="true">●</span>}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: sev.color, background: sev.bg, borderRadius: 999, padding: "2px 8px", flexShrink: 0 }}>
                  {sev[l]}
                </span>
              </div>
              {a.justification && (
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{a.justification}</div>
              )}
            </div>
          );
        })}
      </div>

      {naKeys.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--color-text-tertiary)" }}>
          {naLabel}: {naKeys.join(", ")}
        </div>
      )}
    </div>
  );
}

export default function Summary({ summary, scoring, lang }) {
  if (!summary) return null;
  const ui = UI[lang] || UI.en;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem", border: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 4 }}>{ui.summaryVerdict}</div>
        <div style={{ fontSize: 15 }}>{summary.verdict}</div>
      </div>
      <ScoreBreakdown scoring={scoring} lang={lang} />
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
