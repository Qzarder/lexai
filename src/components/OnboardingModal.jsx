import { createPortal } from "react-dom";

export default function OnboardingModal({ onSelect }) {
  const langs = [
    { code: "ru", flag: "🇷🇺", label: "Русский",   sub: "Выберите язык" },
    { code: "en", flag: "🇬🇧", label: "English",    sub: "Select language" },
    { code: "de", flag: "🇩🇪", label: "Deutsch",    sub: "Sprache wählen" },
    { code: "fr", flag: "🇫🇷", label: "Français",   sub: "Choisir la langue" },
    { code: "es", flag: "🇪🇸", label: "Español",    sub: "Seleccionar idioma" },
  ];

  return createPortal(
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 950, padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: 18, padding: "2rem 1.75rem", width: "100%", maxWidth: 480, border: "0.5px solid #e0e0da" }}>

        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚖️</div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5 }}>LexAI</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Legal Document Intelligence</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {langs.map(l => (
            <button
              key={l.code}
              onClick={() => onSelect(l.code)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, border: "0.5px solid #e0e0da", background: "#fafaf8", cursor: "pointer", textAlign: "left", transition: "border-color 0.15s, background 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#378ADD"; e.currentTarget.style.background = "#f0f6ff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e0e0da"; e.currentTarget.style.background = "#fafaf8"; }}
            >
              <span style={{ fontSize: 26, lineHeight: 1 }}>{l.flag}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{l.label}</div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>{l.sub}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: "1.25rem" }}>
          LexAI · Legal Document Intelligence
        </div>
      </div>
    </div>,
    document.body
  );
}
