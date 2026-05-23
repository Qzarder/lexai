import { createPortal } from "react-dom";
import { UI } from "../constants/ui";

export default function PricingModal({ lang, onSelect, onClose }) {
  const ui = UI[lang] || UI.en;

  const title = { ru: "Выберите план", es: "Elige tu plan", de: "Plan wählen", fr: "Choisissez votre plan", zh: "选择方案" }[lang] || "Choose your plan";
  const popular = { ru: "Популярный", es: "Más popular", de: "Beliebt", fr: "Populaire", zh: "最受欢迎" }[lang] || "Most popular";
  const demoNote = { ru: "Демо-режим — реальных платежей нет. Выберите план для разблокировки функций.", es: "Modo demo — sin pagos reales. Seleccione un plan para desbloquear funciones." }[lang] || "Demo mode — no real payments. Select a plan to unlock features.";

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", width: "100%", maxWidth: 600, border: "0.5px solid #ddd", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#888", lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>

        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, WebkitOverflowScrolling: "touch" }}>
          {ui.plans.map((p, i) => (
            <div
              key={i}
              onClick={() => onSelect(p.toLowerCase())}
              style={{ flex: "1 1 160px", minWidth: 150, border: i === 1 ? "2px solid #378ADD" : "0.5px solid #e0e0da", borderRadius: 12, padding: "1rem", cursor: "pointer", background: i === 1 ? "#f0f6ff" : "#fafaf8" }}
            >
              {i === 1 && (
                <div style={{ fontSize: 11, background: "#378ADD", color: "#fff", padding: "2px 8px", borderRadius: 20, display: "inline-block", marginBottom: 8 }}>
                  {popular}
                </div>
              )}
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{p}</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#378ADD", marginBottom: 12 }}>{ui.planPrice[i]}</div>
              {ui.planDesc[i].split("\n").map((line, j) => (
                <div key={j} style={{ fontSize: 12, color: "#555", display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 5 }}>
                  <span style={{ color: "#639922", fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {line}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, color: "#aaa", marginTop: "1rem", textAlign: "center" }}>{demoNote}</div>
      </div>
    </div>,
    document.body
  );
}
