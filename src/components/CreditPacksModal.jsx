import { createPortal } from "react-dom";
import { CREDIT_PACKS } from "../credits";

const L = {
  ru: {
    title: "Добавить кредиты",
    subtitle: "Не сгорают · накапливаются поверх месячного лимита",
    buy: "Купить",
    popular: "Популярный",
    credits: "кредитов",
    perCredit: "кредит",
    note: "Демо-режим — реальных платежей нет. Кредиты начислятся сразу.",
  },
  en: {
    title: "Add credits",
    subtitle: "Never expire · stack on top of your monthly allowance",
    buy: "Buy",
    popular: "Popular",
    credits: "credits",
    perCredit: "credit",
    note: "Demo mode — no real payments. Credits are added instantly.",
  },
  de: {
    title: "Credits kaufen",
    subtitle: "Verfallen nicht · zum Monatslimit hinzugefügt",
    buy: "Kaufen",
    popular: "Beliebt",
    credits: "Credits",
    perCredit: "Credit",
    note: "Demo-Modus — keine echten Zahlungen. Credits werden sofort gutgeschrieben.",
  },
  fr: {
    title: "Ajouter des crédits",
    subtitle: "N'expirent pas · s'ajoutent au quota mensuel",
    buy: "Acheter",
    popular: "Populaire",
    credits: "crédits",
    perCredit: "crédit",
    note: "Mode démo — aucun paiement réel. Crédits ajoutés instantanément.",
  },
  zh: {
    title: "购买积分",
    subtitle: "永不过期 · 叠加在月度配额之上",
    buy: "购买",
    popular: "热门",
    credits: "积分",
    perCredit: "积分",
    note: "演示模式 — 无真实付款。积分立即到账。",
  },
  es: {
    title: "Agregar créditos",
    subtitle: "No caducan · se suman a tu cuota mensual",
    buy: "Comprar",
    popular: "Popular",
    credits: "créditos",
    perCredit: "crédito",
    note: "Modo demo — sin pagos reales. Los créditos se añaden al instante.",
  },
};

export default function CreditPacksModal({ lang, onBuy, onClose }) {
  const t = L[lang] || L.en;

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "1rem" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", width: "100%", maxWidth: 600, border: "0.5px solid #ddd", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>{t.title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#888", lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>
        <div style={{ fontSize: 12, color: "#aaa", marginBottom: "1.25rem" }}>{t.subtitle}</div>

        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, WebkitOverflowScrolling: "touch" }}>
          {CREDIT_PACKS.map((pack, i) => (
            <div
              key={pack.id}
              onClick={() => onBuy(pack)}
              style={{ flex: "1 1 160px", minWidth: 150, border: pack.badge ? "2px solid #378ADD" : "0.5px solid #e0e0da", borderRadius: 12, padding: "1rem", cursor: "pointer", background: pack.badge ? "#f0f6ff" : "#fafaf8", position: "relative" }}
            >
              {pack.badge && (
                <div style={{ fontSize: 11, background: "#378ADD", color: "#fff", padding: "2px 8px", borderRadius: 20, display: "inline-block", marginBottom: 8 }}>
                  {t.popular}
                </div>
              )}
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{pack.label}</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#378ADD", marginBottom: 12 }}>
                ${pack.price}
              </div>
              <div style={{ fontSize: 12, color: "#555", display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 5 }}>
                <span style={{ color: "#639922", fontWeight: 700, flexShrink: 0 }}>✓</span>
                {pack.credits} {t.credits}
              </div>
              <div style={{ fontSize: 12, color: "#555", display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 5 }}>
                <span style={{ color: "#639922", fontWeight: 700, flexShrink: 0 }}>✓</span>
                ${(pack.price / pack.credits).toFixed(2)}/{t.perCredit}
              </div>
              <div style={{ fontSize: 12, color: "#555", display: "flex", gap: 6, alignItems: "flex-start" }}>
                <span style={{ color: "#639922", fontWeight: 700, flexShrink: 0 }}>✓</span>
                {lang === "ru" ? "Не сгорают" : lang === "de" ? "Verfallen nicht" : lang === "fr" ? "N'expirent pas" : lang === "zh" ? "永不过期" : lang === "es" ? "No caducan" : "Never expire"}
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, color: "#aaa", marginTop: "1rem", textAlign: "center" }}>{t.note}</div>
      </div>
    </div>,
    document.body
  );
}
