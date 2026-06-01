import { LANGS } from "../constants/langs";

// Marketing landing — first-touch screen shown before the analyzer.
// Honest copy only: every figure here is a real product fact (jurisdictions,
// languages, formats). No invented adoption/accuracy numbers.
const T = {
  ru: {
    badge: "AI для юридических документов",
    h1a: "Разбор юридического документа",
    h1b: "за одну минуту",
    sub: "Загрузите договор, претензию или процессуальный документ — LexAI найдёт риски, оценит сильные и слабые стороны позиции и даст конкретные рекомендации.",
    cta: "Анализировать документ",
    ctaSub: "Бесплатно на время запуска · вход через Google",
    how: "Как это работает",
    free: "Бесплатно на время запуска",
    chips: ["7 юрисдикций", "5 языков", "PDF · DOCX · фото", "Поиск по практике"],
    featuresTitle: "Что умеет LexAI",
    features: [
      ["ti-file-text", "Анализ договоров", "Риски, невыгодные условия и на что обратить внимание до подписания."],
      ["ti-gavel", "Процессуальный режим", "Оценка позиции по спору, перспективы и аргументы сторон."],
      ["ti-message-chatbot", "AI-консультант", "Задайте уточняющие вопросы прямо по вашему документу в чате."],
      ["ti-scale", "Поиск практики", "Законы и судебные решения по выбранной юрисдикции."],
      ["ti-photo-scan", "Любой формат", "PDF, DOCX, DOC, TXT, RTF и фото документов с распознаванием текста."],
      ["ti-world", "Юрисдикции и языки", "РФ, ЕС, США, Великобритания, Германия, Казахстан, Латам. 5 языков."],
    ],
    stepsTitle: "Три шага до результата",
    steps: [
      ["Загрузите документ", "Перетащите файл, сделайте фото или вставьте текст."],
      ["Выберите юрисдикцию и тип", "LexAI проверит, соответствует ли документ выбранной юрисдикции."],
      ["Получите разбор", "Риски, оценка позиции и рекомендации — за минуту."],
    ],
    forWhoTitle: "Для кого",
    forWho: "Для юристов, предпринимателей, фрилансеров и всех, кому нужно быстро понять суть документа и его риски — до того, как подписать или оспорить.",
    disclaimer: "LexAI предоставляет информацию и анализ, но не является юридической консультацией и не заменяет лицензированного юриста.",
    finalCta: "Начать анализ",
    privacy: "Конфиденциальность",
    terms: "Условия",
  },
  en: {
    badge: "AI for legal documents",
    h1a: "Break down a legal document",
    h1b: "in one minute",
    sub: "Upload a contract, claim or court filing — LexAI finds the risks, weighs the strong and weak points of your position and gives concrete recommendations.",
    cta: "Analyze a document",
    ctaSub: "Free during launch · sign in with Google",
    how: "How it works",
    free: "Free during launch",
    chips: ["7 jurisdictions", "5 languages", "PDF · DOCX · photo", "Case-law search"],
    featuresTitle: "What LexAI does",
    features: [
      ["ti-file-text", "Contract analysis", "Risks, unfavorable terms and what to check before signing."],
      ["ti-gavel", "Procedural mode", "Assessment of your position in a dispute, prospects and arguments."],
      ["ti-message-chatbot", "AI consultant", "Ask follow-up questions about your own document in chat."],
      ["ti-scale", "Case-law search", "Laws and court decisions for the selected jurisdiction."],
      ["ti-photo-scan", "Any format", "PDF, DOCX, DOC, TXT, RTF and photos of documents with text recognition."],
      ["ti-world", "Jurisdictions & languages", "Russia, EU, US, UK, Germany, Kazakhstan, LatAm. 5 languages."],
    ],
    stepsTitle: "Three steps to a result",
    steps: [
      ["Upload a document", "Drop a file, take a photo or paste the text."],
      ["Pick jurisdiction and type", "LexAI checks whether the document matches the selected jurisdiction."],
      ["Get the breakdown", "Risks, position assessment and recommendations — in a minute."],
    ],
    forWhoTitle: "Who it's for",
    forWho: "Lawyers, entrepreneurs, freelancers and anyone who needs to quickly grasp a document and its risks — before signing or challenging it.",
    disclaimer: "LexAI provides information and analysis but is not legal advice and does not replace a licensed attorney.",
    finalCta: "Start analysis",
    privacy: "Privacy",
    terms: "Terms",
  },
};

const BLUE = "#378ADD";
const INK = "#1a1a18";
const MUTED = "#6b6b66";

export default function Landing({ lang, setLang, onStart }) {
  const t = T[lang] || T.en;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 4px" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <i className="ti ti-scale" style={{ fontSize: 22, color: INK }} aria-hidden="true" />
          <span style={{ fontSize: 20, fontWeight: 600, color: INK }}>LexAI</span>
          <span style={{ fontSize: 11, background: "#eaf2fb", color: BLUE, padding: "2px 8px", borderRadius: 20 }}>BETA</span>
        </div>
        <select value={lang} onChange={e => setLang(e.target.value)} style={{ fontSize: 13, padding: "4px 8px" }}>
          {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v.flag} {v.name}</option>)}
        </select>
      </div>

      {/* Hero */}
      <section style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #f3f7fd 0%, #eef1f6 60%, #f9f9f8 100%)",
        border: "0.5px solid #e2e6ec", borderRadius: 24,
        padding: "clamp(28px, 6vw, 56px)", textAlign: "center",
      }}>
        <div style={{
          position: "absolute", top: -80, right: -80, width: 280, height: 280,
          background: "radial-gradient(circle, rgba(55,138,221,0.16) 0%, rgba(55,138,221,0) 70%)",
        }} aria-hidden="true" />
        <span style={{
          display: "inline-block", fontSize: 12.5, fontWeight: 600, color: BLUE,
          background: "#fff", border: "0.5px solid #d6e4f5", padding: "5px 14px", borderRadius: 20, marginBottom: 20,
        }}>
          <i className="ti ti-sparkles" style={{ fontSize: 13, marginRight: 6 }} />{t.badge}
        </span>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 46px)", lineHeight: 1.1, fontWeight: 600, color: INK, margin: "0 auto", maxWidth: 720 }}>
          {t.h1a}<br /><span style={{ color: BLUE }}>{t.h1b}</span>
        </h1>
        <p style={{ fontSize: "clamp(14px, 2vw, 17px)", color: MUTED, lineHeight: 1.55, maxWidth: 600, margin: "18px auto 0" }}>
          {t.sub}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", alignItems: "center", marginTop: 30 }}>
          <button onClick={onStart} style={{
            fontSize: 16, fontWeight: 600, color: "#fff", background: BLUE,
            border: "none", borderRadius: 12, padding: "14px 30px", cursor: "pointer",
            boxShadow: "0 8px 24px rgba(55,138,221,0.32)", display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            {t.cta}<i className="ti ti-arrow-right" style={{ fontSize: 18 }} />
          </button>
        </div>
        <div style={{ fontSize: 12.5, color: MUTED, marginTop: 12 }}>{t.ctaSub}</div>

        {/* Honest fact chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 26 }}>
          {t.chips.map((c, i) => (
            <span key={i} style={{
              fontSize: 12.5, color: "#42566b", background: "#fff",
              border: "0.5px solid #dde3ea", borderRadius: 20, padding: "6px 13px",
            }}>{c}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ marginTop: 56 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: INK, textAlign: "center", marginBottom: 28 }}>{t.featuresTitle}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {t.features.map(([icon, title, desc], i) => (
            <div key={i} style={{
              background: "#fff", border: "0.5px solid #e6e6e0", borderRadius: 16, padding: "20px 18px",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: "#eaf2fb",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
              }}>
                <i className={`ti ${icon}`} style={{ fontSize: 21, color: BLUE }} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: INK, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ marginTop: 56 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: INK, textAlign: "center", marginBottom: 28 }}>{t.stepsTitle}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {t.steps.map(([title, desc], i) => (
            <div key={i} style={{ position: "relative", padding: "22px 20px", background: "#fafafa", border: "0.5px solid #ececE6", borderRadius: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9, background: BLUE, color: "#fff",
                fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
              }}>{i + 1}</div>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: INK, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* For whom */}
      <section style={{ marginTop: 56, background: "linear-gradient(135deg, #1f2a37 0%, #2c3a4d 100%)", borderRadius: 20, padding: "clamp(26px, 5vw, 40px)", textAlign: "center" }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: "#fff", marginBottom: 12 }}>{t.forWhoTitle}</h2>
        <p style={{ fontSize: 15, color: "#c4ccd6", lineHeight: 1.6, maxWidth: 640, margin: "0 auto 24px" }}>{t.forWho}</p>
        <button onClick={onStart} style={{
          fontSize: 15, fontWeight: 600, color: "#1f2a37", background: "#fff",
          border: "none", borderRadius: 12, padding: "13px 28px", cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          {t.finalCta}<i className="ti ti-arrow-right" style={{ fontSize: 17 }} />
        </button>
      </section>

      {/* Disclaimer + footer */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 28, padding: "14px 16px", background: "#fff8ec", border: "0.5px solid #f3e2c0", borderRadius: 12 }}>
        <i className="ti ti-info-circle" style={{ fontSize: 18, color: "#b8860b", flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12.5, color: "#6b5a2e", lineHeight: 1.5 }}>{t.disclaimer}</div>
      </div>

      <footer style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", alignItems: "center", margin: "32px 0 12px", fontSize: 12.5, color: MUTED }}>
        <span>© {new Date().getFullYear()} LexAI</span>
        <a href="https://lexai-ymhb.onrender.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: MUTED }}>{t.privacy}</a>
        <a href="https://lexai-ymhb.onrender.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: MUTED }}>{t.terms}</a>
      </footer>
    </div>
  );
}
