import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { LANGS, JURISDICTIONS, DOC_TYPES, PROCEDURAL_DOC_TYPES } from "./constants/langs";
import { UI } from "./constants/ui";
import { analysisSystemPrompt, proceduralSystemPrompt } from "./prompts";
import { analyzeDocument } from "./api";
import { parseFile, ACCEPT, FILE_LABELS } from "./fileParser";
import { scoreColor } from "./utils";

const RISK_BADGE = {
  low:          { color: "#27ae60", bg: "#eafaf1", border: "#a9dfbf", ru: "Низкий риск",       en: "Low risk"        },
  medium:       { color: "#e67e22", bg: "#fef9e7", border: "#f9e4b7", ru: "Средний риск",      en: "Medium risk"     },
  high:         { color: "#e74c3c", bg: "#fdedec", border: "#f5b7b1", ru: "Высокий риск",      en: "High risk"       },
  critical:     { color: "#c0392b", bg: "#f9ebea", border: "#e6b0aa", ru: "Критический риск",  en: "Critical risk"   },
  strong:       { color: "#27ae60", bg: "#eafaf1", border: "#a9dfbf", ru: "Сильная позиция",   en: "Strong position" },
  moderate:     { color: "#e67e22", bg: "#fef9e7", border: "#f9e4b7", ru: "Умеренная позиция", en: "Moderate"        },
  weak:         { color: "#e74c3c", bg: "#fdedec", border: "#f5b7b1", ru: "Слабая позиция",    en: "Weak position"   },
  insufficient: { color: "#c0392b", bg: "#f9ebea", border: "#e6b0aa", ru: "Недостаточная",     en: "Insufficient"    },
  favorable:    { color: "#27ae60", bg: "#eafaf1", border: "#a9dfbf", ru: "Благоприятные",     en: "Favorable"       },
  uncertain:    { color: "#e67e22", bg: "#fef9e7", border: "#f9e4b7", ru: "Неопределённые",    en: "Uncertain"       },
  unfavorable:  { color: "#e74c3c", bg: "#fdedec", border: "#f5b7b1", ru: "Неблагоприятные",   en: "Unfavorable"     },
  poor:         { color: "#c0392b", bg: "#f9ebea", border: "#e6b0aa", ru: "Плохие",            en: "Poor"            },
};
import {
  PLAN_CONFIG, CHARS_PER_PAGE,
  pagesToChars, charsToPages, calcCreditCost,
  getCreditsUsed, getBonusCredits, addBonusCredits, deductCredits,
} from "./credits";
import { getUserId } from "./user";
import Select from "./components/Select";
import CreditPacksModal from "./components/CreditPacksModal";
import RiskChecklist from "./components/RiskChecklist";
import Comments from "./components/Comments";
import LegalRefs from "./components/LegalRefs";
import Summary from "./components/Summary";
import Consultant from "./components/Consultant";
import ProceduralPosition from "./components/ProceduralPosition";
import ProceduralEvidence from "./components/ProceduralEvidence";
import ProceduralCounterargs from "./components/ProceduralCounterargs";
import ProceduralProspects from "./components/ProceduralProspects";
import PricingModal from "./components/PricingModal";
import ConsentModal from "./components/ConsentModal";
import OnboardingModal from "./components/OnboardingModal";
import PrivacyBar from "./components/PrivacyBar";
import HistoryPanel from "./components/HistoryPanel";
import { saveToHistory } from "./history";

export default function App() {
  const [lang, setLang] = useState("ru");
  const [mode, setMode] = useState("contract"); // "contract" | "procedural"
  const [jurisdiction, setJurisdiction] = useState("RU");
  const [docType, setDocType] = useState(0);
  const [docs, setDocs] = useState([]);       // [{id, name, text, size, chars}]
  const [pasteText, setPasteText] = useState("");
  const [tab, setTab] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streamProgress, setStreamProgress] = useState(0);
  const [streamHint, setStreamHint] = useState("");
  const [error, setError] = useState("");
  const [plan, setPlan] = useState("free");
  const [showPricing, setShowPricing] = useState(false);
  const [showCreditPacks, setShowCreditPacks] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [fileParsing, setFileParsing] = useState(false);
  const [fileParsingHint, setFileParsingHint] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [skipModeWarning] = useState(() => localStorage.getItem("lexai_skip_mode_warn") === "1");
  // re-render when credits change
  const [creditsUsed, setCreditsUsed] = useState(() => getCreditsUsed());
  const fileRef = useRef();

  const ui = UI[lang] || UI.en;
  const jurLabel = JURISDICTIONS.find(j => j.code === jurisdiction)?.label || jurisdiction;
  const docTypes = mode === "procedural"
    ? (PROCEDURAL_DOC_TYPES[lang] || PROCEDURAL_DOC_TYPES.en)
    : (DOC_TYPES[lang] || DOC_TYPES.en);
  const planCfg = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
  const [bonusCredits, setBonusCredits] = useState(() => getBonusCredits());
  const monthlyRemaining = Math.max(0, planCfg.credits - creditsUsed);
  const creditsRemaining = monthlyRemaining + bonusCredits;

  const hasContent = docs.length > 0 || pasteText.trim().length > 0;

  const combinedText = [
    ...docs.map((d, i) => `=== ${lang === "ru" ? "ДОКУМЕНТ" : "DOCUMENT"} ${i + 1}: ${d.name} ===\n\n${d.text}`),
    pasteText.trim() ? `=== ${lang === "ru" ? "ВСТАВЛЕННЫЙ ТЕКСТ" : "PASTED TEXT"} ===\n\n${pasteText.trim()}` : null,
  ].filter(Boolean).join("\n\n---\n\n");

  const totalChars = combinedText.length;
  const analysisCost = hasContent ? calcCreditCost(totalChars) : 0;
  // char limit passed to API — total context budget for this plan
  const charLimit = pagesToChars(planCfg.docPages) * planCfg.maxDocs;

  const handleFiles = async (files) => {
    const labels = FILE_LABELS[lang] || FILE_LABELS.en;
    const available = planCfg.maxDocs - docs.length;
    if (available <= 0) {
      if (plan === "free") { setShowPricing(true); return; }
      setError(lang === "ru" ? `Максимум ${planCfg.maxDocs} документа для вашего плана.` : `Max ${planCfg.maxDocs} documents for your plan.`);
      return;
    }

    setFileParsing(true);
    setFileParsingHint("");
    setError("");
    const maxChars = pagesToChars(planCfg.docPages);
    const newDocs = [];

    for (const file of Array.from(files).slice(0, available)) {
      try {
        const fileLabels = FILE_LABELS[lang] || FILE_LABELS.en;
        let text = await parseFile(file, {
          onProgress: (type, cur, total) => {
            if (type === "ocr")     setFileParsingHint(fileLabels.ocr);
            if (type === "ocrPage") setFileParsingHint(fileLabels.ocrPage(cur, total));
          },
        });
        // enforce per-document page limit
        if (text.length > maxChars) {
          text = text.slice(0, maxChars);
          setError(lang === "ru"
            ? `${file.name}: документ обрезан до ${planCfg.docPages} стр. Обновитесь для анализа полного документа.`
            : `${file.name}: truncated to ${planCfg.docPages} pages. Upgrade for full document analysis.`);
        }
        newDocs.push({
          id: Date.now() + Math.random(),
          name: file.name,
          text,
          size: (file.size / 1024).toFixed(0) + " KB",
          chars: text.length,
          pages: charsToPages(text.length),
        });
      } catch (e) {
        if (e.message === "size") setError(`${file.name}: ${labels.errorSize}`);
        else if (e.message === "type") setError(`${file.name}: ${labels.errorType}`);
        else if (e.message === "scanned") setError(lang === "ru" ? `${file.name}: PDF без текстового слоя.` : `${file.name}: PDF has no text layer.`);
        else setError(lang === "ru" ? `Не удалось прочитать: ${file.name}` : `Could not read: ${file.name}`);
      }
    }

    if (newDocs.length > 0) setDocs(prev => [...prev, ...newDocs]);
    setFileParsing(false);
    setFileParsingHint("");
  };

  const removeDoc = (id) => setDocs(prev => prev.filter(d => d.id !== id));

  const handleDrop = useCallback(e => {
    e.preventDefault();
    handleFiles(Array.from(e.dataTransfer.files));
  }, [lang, plan, docs.length]);

  const analyze = async () => {
    if (!hasContent) {
      setError(lang === "ru" ? "Добавьте документ для анализа." : "Add a document to analyze.");
      return;
    }
    if (analysisCost > creditsRemaining) {
      setShowPricing(true);
      return;
    }

    setLoading(true); setError(""); setResult(null); setStreamProgress(0); setStreamHint("");

    // Fake progress: slowly crawl from 12% to 70% while backend works
    setStreamProgress(12);
    const hints = lang === "ru"
      ? ["Ищем в базе законодательства...", "Проверяем позиции Верховного суда...", "Анализируем судебную практику...", "Формируем результат..."]
      : ["Searching legislation...", "Checking Supreme Court positions...", "Analyzing court practice...", "Generating result..."];
    let hintIdx = 0;
    const progressTimer = setInterval(() => {
      setStreamProgress(p => {
        if (p >= 68) { clearInterval(progressTimer); return p; }
        return p + (Math.random() * 2 + 1);
      });
      setStreamHint(hints[hintIdx % hints.length]);
      hintIdx++;
    }, 3500);

    try {
      const sysPrompt = mode === "procedural"
        ? proceduralSystemPrompt(jurLabel, jurisdiction, docTypes[docType], lang)
        : analysisSystemPrompt(jurLabel, jurisdiction, docTypes[docType], lang);

      const meta = {
        user_id:          getUserId(),
        plan,
        credits_deducted: analysisCost,
        total_chars:      totalChars,
        docs: docs.map(d => ({ name: d.name, pages: d.pages, chars: d.chars })),
      };

      const { result: parsed } = await analyzeDocument({
        systemPrompt: sysPrompt,
        docText: combinedText,
        charLimit,
        meta,
        onProgress: (progress, hint) => {
          setStreamProgress(progress);
          setStreamHint(hint);
        },
      });

      clearInterval(progressTimer);
      deductCredits(analysisCost, plan);
      setCreditsUsed(getCreditsUsed());
      setBonusCredits(getBonusCredits());
      setStreamProgress(100);
      setStreamHint("");
      setResult(parsed);
      setTab(0);

      // Save to history
      saveToHistory({
        id:                Date.now().toString(36),
        date:              new Date().toISOString(),
        docNames:          docs.length > 0 ? docs.map(d => d.name) : [lang === "ru" ? "Вставленный текст" : "Pasted text"],
        mode,
        jurisdiction,
        jurisdictionLabel: jurLabel,
        docType:           docTypes[docType],
        overallRisk:       parsed.summary?.overallRisk,
        level:             parsed.position?.level || parsed.prospects?.level,
        verdict:           parsed.summary?.verdict || parsed.position?.verdict,
        result:            parsed,
      });
    } catch {
      clearInterval(progressTimer);
      setError(lang === "ru" ? "Ошибка анализа. Проверьте документ и попробуйте снова." : "Analysis failed. Please check your document and try again.");
    }
    setLoading(false);
  };

  const TAB_COMPONENTS = mode === "procedural" ? [
    <ProceduralPosition position={result?.position} lang={lang} />,
    <ProceduralEvidence evidence={result?.evidence} lang={lang} />,
    <ProceduralCounterargs counterarguments={result?.counterarguments} lang={lang} />,
    <ProceduralProspects prospects={result?.prospects} lang={lang} />,
  ] : [
    <RiskChecklist risks={result?.risks} />,
    <Comments comments={result?.comments} />,
    <LegalRefs legalRefs={result?.legalRefs} />,
    <Summary summary={result?.summary} lang={lang} />,
    <Consultant
      jurLabel={jurLabel}
      jurisdictionCode={jurisdiction}
      lang={lang}
      result={result}
      docText={combinedText}
      isPro={plan !== "free"}
      onUpgrade={() => setShowPricing(true)}
    />,
  ];

  const creditPct = Math.round((creditsRemaining / planCfg.credits) * 100);
  const creditColor = creditPct > 40 ? "var(--color-text-success)" : creditPct > 15 ? "var(--color-text-warning)" : "var(--color-text-danger)";

  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: 680, margin: "0 auto", padding: "1rem 0" }}>
      <h2 className="sr-only">LexAI Legal Document Analyzer</h2>

      {!onboardingDone && (
        <OnboardingModal onSelect={code => { setLang(code); setOnboardingDone(true); setShowConsent(true); }} />
      )}

      {showConsent && onboardingDone && (
        <ConsentModal
          lang={lang}
          onAccept={() => { setConsentGiven(true); setShowConsent(false); }}
          onDecline={() => { setShowConsent(false); setConsentGiven(false); }}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-scale" style={{ fontSize: 22, color: "var(--color-text-primary)" }} aria-hidden="true" />
            <span style={{ fontSize: 20, fontWeight: 500 }}>LexAI</span>
            <span style={{ fontSize: 11, background: "var(--color-background-info)", color: "var(--color-text-info)", padding: "2px 8px", borderRadius: 20 }}>BETA</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>{ui.tagline}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={lang} onChange={e => setLang(e.target.value)} style={{ fontSize: 13, padding: "4px 8px" }}>
            {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v.flag} {v.name}</option>)}
          </select>
          <button
            onClick={() => setShowHistory(true)}
            style={{ fontSize: 12, padding: "5px 10px", background: "#fff", border: "0.5px solid #ccc", borderRadius: "var(--border-radius-md)", cursor: "pointer", color: "#555", display: "flex", alignItems: "center", gap: 5 }}
          >
            <i className="ti ti-archive" style={{ fontSize: 14 }} />
            <span>{lang === "ru" ? "Мои документы" : lang === "de" ? "Meine Dokumente" : lang === "fr" ? "Mes documents" : lang === "zh" ? "我的文件" : lang === "es" ? "Mis documentos" : "My Documents"}</span>
          </button>
          <button onClick={() => setShowPricing(true)} style={{ fontSize: 13, padding: "5px 12px", background: "var(--color-background-info)", color: "var(--color-text-info)", border: "0.5px solid var(--color-border-info)", borderRadius: "var(--border-radius-md)", cursor: "pointer" }}>
            {plan === "free" ? ui.upgrade : `${planCfg.label} ✓`}
          </button>
        </div>
      </div>

      <PrivacyBar lang={lang} />

      {!consentGiven && !showConsent && (
        <div style={{ textAlign: "center", padding: "2rem", border: "0.5px solid #e0e0da", borderRadius: 12, background: "#fafaf8" }}>
          <i className="ti ti-shield-off" style={{ fontSize: 32, color: "#E24B4A", display: "block", marginBottom: 8 }} aria-hidden="true" />
          <div style={{ fontSize: 14, marginBottom: 12, color: "#444" }}>
            {lang === "ru" ? "Для использования приложения необходимо принять условия обработки данных." : "You must accept the data processing terms to use this application."}
          </div>
          <button onClick={() => setShowConsent(true)} style={{ padding: "8px 20px", fontSize: 14, borderRadius: 8, border: "0.5px solid #378ADD", color: "#378ADD", background: "#fff", cursor: "pointer" }}>
            {lang === "ru" ? "Показать соглашение" : "Show agreement"}
          </button>
        </div>
      )}

      {consentGiven && (
        <>
          {/* Mode toggle */}
          <div style={{ display: "flex", gap: 0, marginBottom: "1rem", background: "#f0f0ec", borderRadius: 10, padding: 3 }}>
            {[
              { key: "contract",   icon: "ti-file-text",  labelRu: "Договоры",          labelEn: "Contracts" },
              { key: "procedural", icon: "ti-gavel",       labelRu: "Процессуальные",    labelEn: "Procedural" },
            ].map(m => {
              const active = mode === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => {
                    if (m.key === mode) return;
                    if (result && !skipModeWarning) { setPendingMode(m.key); return; }
                    setMode(m.key); setDocType(0); setResult(null);
                  }}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "8px 12px", fontSize: 13, fontWeight: active ? 600 : 400,
                    border: "none", borderRadius: 8, cursor: "pointer",
                    background: active ? "#fff" : "transparent",
                    color: active ? "#1a1a18" : "#888",
                    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                    transition: "all 0.18s",
                  }}
                >
                  <i className={`ti ${m.icon}`} style={{ fontSize: 15 }} />
                  {lang === "ru" ? m.labelRu : m.labelEn}
                  {m.key === "procedural" && (
                    <span style={{ fontSize: 10, background: "#378ADD22", color: "#378ADD", padding: "1px 6px", borderRadius: 10, fontWeight: 600 }}>
                      {lang === "ru" ? "НОВОЕ" : "NEW"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selectors */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>{ui.docType}</label>
              <Select
                value={docType}
                onChange={v => setDocType(+v)}
                options={docTypes.map((d, i) => ({ value: i, label: d }))}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>{ui.jurisdiction}</label>
              <Select
                value={jurisdiction}
                onChange={setJurisdiction}
                options={JURISDICTIONS.map(j => ({ value: j.code, label: j.label, flag: j.flag, sub: j.laws }))}
              />
            </div>
          </div>

          {/* Credit bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem", padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)" }}>
            <i className="ti ti-bolt" style={{ fontSize: 14, color: creditColor, flexShrink: 0 }} aria-hidden="true" />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: "var(--color-text-secondary)" }}>
                  {lang === "ru" ? "Кредиты" : "Credits"}
                  {bonusCredits > 0 && (
                    <span style={{ color: "var(--color-text-success)", marginLeft: 6, fontSize: 11 }}>
                      +{bonusCredits} {lang === "ru" ? "бонус" : "bonus"}
                    </span>
                  )}
                  {hasContent && analysisCost > 0 && (
                    <span style={{ color: creditColor, marginLeft: 6 }}>
                      · {lang === "ru" ? "этот анализ:" : "this analysis:"} <strong>{analysisCost}</strong>
                    </span>
                  )}
                </span>
                <span style={{ color: creditColor, fontWeight: 500 }}>
                  {creditsRemaining} / {planCfg.credits}{bonusCredits > 0 ? `+${bonusCredits}` : ""}
                </span>
              </div>
              <div style={{ height: 3, background: "var(--color-border-tertiary)", borderRadius: 2 }}>
                <div style={{ height: 3, width: `${creditPct}%`, background: creditColor, borderRadius: 2, transition: "width 0.3s" }} />
              </div>
            </div>
            <button
              onClick={() => setShowCreditPacks(true)}
              style={{ fontSize: 11, padding: "3px 8px", background: "none", border: "0.5px solid var(--color-border-info)", color: "var(--color-text-info)", borderRadius: "var(--border-radius-md)", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}
            >
              {lang === "ru" ? "Добавить кредиты" : lang === "de" ? "Credits kaufen" : lang === "fr" ? "Ajouter crédits" : lang === "zh" ? "购买积分" : lang === "es" ? "Agregar créditos" : "Add credits"}
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(Array.from(e.dataTransfer.files)); }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current.click()}
            style={{
              border: `1.5px dashed ${dragOver ? "#378ADD" : "#c8c8c0"}`,
              borderRadius: 16,
              padding: "2rem 1.5rem 1.75rem",
              textAlign: "center",
              cursor: "pointer",
              marginBottom: "0.75rem",
              background: dragOver ? "#f0f6ff" : "#fafaf8",
              transition: "border-color 0.2s, background 0.2s",
            }}
          >
            {/* Icon */}
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 52, height: 52, borderRadius: "50%",
              background: dragOver ? "#dbeafe" : "#efefeb",
              marginBottom: 14,
              transition: "background 0.2s",
            }}>
              <i className="ti ti-cloud-upload" aria-hidden="true" style={{ fontSize: 26, color: dragOver ? "#378ADD" : "#888", transition: "color 0.2s" }} />
            </div>

            {/* Main label */}
            <div style={{ fontSize: 15, fontWeight: 500, color: "#1a1a18", lineHeight: 1.4, marginBottom: 6 }}>
              {lang === "ru" ? "Перетащите файлы или нажмите для загрузки" :
               lang === "de" ? "Dateien ablegen oder klicken" :
               lang === "fr" ? "Déposez vos fichiers ou cliquez ici" :
               lang === "zh" ? "拖放文件或点击上传" :
               lang === "es" ? "Arrastre archivos o haga clic" :
               "Drop files here or click to upload"}
            </div>

            {/* Sub label */}
            <div style={{ fontSize: 12, color: "#999", marginBottom: 12 }}>
              {lang === "ru" ? "или вставьте текст в поле ниже" :
               lang === "de" ? "oder Text unten einfügen" :
               lang === "fr" ? "ou collez le texte ci-dessous" :
               lang === "zh" ? "或在下方粘贴文本" :
               lang === "es" ? "o pegue texto abajo" :
               "or paste text in the field below"}
            </div>

            {/* Format chips */}
            <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
              {["PDF", "DOCX", "DOC", "TXT", "RTF"].map(fmt => (
                <span key={fmt} style={{ fontSize: 11, padding: "3px 9px", background: "#eeeee9", borderRadius: 20, color: "#666", fontWeight: 500, letterSpacing: "0.02em" }}>{fmt}</span>
              ))}
            </div>

            {/* Plan limits */}
            <div style={{ fontSize: 11, color: "#b0b0a8" }}>
              {plan === "free"
                ? (lang === "ru"
                    ? `Free: 1 файл · до ${PLAN_CONFIG.free.docPages} стр — Pro: 3 файла — Enterprise: 7 файлов`
                    : `Free: 1 file · up to ${PLAN_CONFIG.free.docPages} pages — Pro: 3 files — Enterprise: 7 files`)
                : (lang === "ru"
                    ? `${docs.length} из ${planCfg.maxDocs} файлов · до ${planCfg.docPages} стр каждый`
                    : `${docs.length} of ${planCfg.maxDocs} files · up to ${planCfg.docPages} pages each`)}
            </div>

            {fileParsing && (
              <div style={{ fontSize: 12, color: "#378ADD", marginTop: 10 }}>
                <i className="ti ti-loader spin" style={{ fontSize: 13, marginRight: 4 }} />
                {fileParsingHint || (FILE_LABELS[lang] || FILE_LABELS.en).loading}
              </div>
            )}
            <input ref={fileRef} type="file" accept={ACCEPT} multiple style={{ display: "none" }} onChange={e => handleFiles(Array.from(e.target.files))} />
          </div>

          {/* Doc list */}
          {docs.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: "0.75rem" }}>
              {docs.map((doc, i) => (
                <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--color-background-secondary)", borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)", fontSize: 13 }}>
                  <i className="ti ti-file-text" style={{ fontSize: 14, color: "var(--color-text-info)", flexShrink: 0 }} aria-hidden="true" />
                  <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", flexShrink: 0, fontWeight: 500 }}>#{i + 1}</span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", flexShrink: 0 }}>
                    ~{doc.pages} {lang === "ru" ? "стр" : "pg"} · {doc.size}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); removeDoc(doc.id); }}
                    aria-label="Remove document"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--color-text-tertiary)", fontSize: 14, flexShrink: 0, lineHeight: 1 }}
                  >
                    <i className="ti ti-x" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Paste textarea */}
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder={ui.paste}
            style={{ width: "100%", minHeight: 120, fontSize: 13, borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)", padding: 10, resize: "vertical", fontFamily: "var(--font-mono)", boxSizing: "border-box", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }}
          />

          {error && <div style={{ fontSize: 13, color: "var(--color-text-danger)", margin: "6px 0" }}>{error}</div>}

          {/* Analyze button */}
          <button
            onClick={analyze}
            disabled={loading || !hasContent}
            style={{ width: "100%", padding: "10px", marginTop: 8, fontSize: 15, fontWeight: 500, cursor: loading || !hasContent ? "not-allowed" : "pointer", opacity: !hasContent ? 0.5 : 1, borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-primary)" }}
          >
            {loading
              ? <><i className="ti ti-loader spin" style={{ fontSize: 15, marginRight: 6 }} aria-hidden="true" />{ui.analyzing}</>
              : analysisCost > creditsRemaining
                ? (lang === "ru" ? "Недостаточно кредитов — обновить план" : "Not enough credits — upgrade")
                : docs.length > 1
                  ? `${ui.analyze} (${docs.length + (pasteText.trim() ? 1 : 0)} ${lang === "ru" ? "документа" : "docs"} · ${analysisCost} кред.)`
                  : hasContent
                    ? `${ui.analyze} · ${analysisCost} ${lang === "ru" ? "кред." : "cr."}`
                    : ui.analyze}
          </button>

          {/* Progress */}
          {loading && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>
                <span>{streamHint}</span>
                <span>{Math.round(streamProgress)}%</span>
              </div>
              <div style={{ height: 4, background: "var(--color-border-tertiary)", borderRadius: 2 }}>
                <div style={{ height: 4, width: `${streamProgress}%`, background: "var(--color-text-info)", borderRadius: 2, transition: "width 0.3s ease" }} />
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div style={{ marginTop: "1.5rem" }}>
              {(() => {
                const levelKey = mode === "procedural" ? result.position?.level : result.summary?.overallRisk;
                const verdict  = mode === "procedural" ? result.position?.verdict : result.summary?.verdict;
                const badge    = RISK_BADGE[levelKey] || RISK_BADGE.medium;
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "1rem", background: badge.bg, borderRadius: "var(--border-radius-lg)", marginBottom: "1rem", border: `1px solid ${badge.border}` }}>
                    <div style={{ flexShrink: 0, padding: "5px 12px", background: "#fff", border: `1px solid ${badge.border}`, borderRadius: 20, fontSize: 12, fontWeight: 700, color: badge.color, whiteSpace: "nowrap" }}>
                      {lang === "ru" ? badge.ru : badge.en}
                    </div>
                    <div style={{ fontSize: 14, color: "#1a1a18", lineHeight: 1.5 }}>{verdict}</div>
                  </div>
                );
              })()}

              <div style={{ display: "flex", borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: "1rem", overflowX: "auto" }}>
                {(mode === "procedural" ? ui.proceduralTabs : ui.tabs).map((label, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (mode !== "procedural" && i === 4 && plan === "free") { setShowPricing(true); return; }
                      setTab(i);
                    }}
                    style={{ padding: "8px 14px", fontSize: 13, border: "none", background: "none", cursor: "pointer", borderBottom: tab === i ? "2px solid var(--color-text-primary)" : "2px solid transparent", color: tab === i ? "var(--color-text-primary)" : "var(--color-text-secondary)", fontWeight: tab === i ? 500 : 400, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", flexShrink: 0 }}
                  >
                    {label}
                    {mode !== "procedural" && i === 4 && plan === "free" && <i className="ti ti-lock" style={{ fontSize: 11 }} aria-hidden="true" />}
                  </button>
                ))}
              </div>

              {TAB_COMPONENTS[tab]}
            </div>
          )}

          {!result && !loading && (
            <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--color-text-tertiary)", fontSize: 13 }}>
              <i className="ti ti-file-text" style={{ fontSize: 32, display: "block", marginBottom: 8 }} aria-hidden="true" />
              {ui.noDoc}
            </div>
          )}
        </>
      )}

      {showPricing && (
        <PricingModal
          lang={lang}
          onSelect={p => { setPlan(p); setShowPricing(false); }}
          onClose={() => setShowPricing(false)}
        />
      )}

      {showHistory && (
        <HistoryPanel
          lang={lang}
          onClose={() => setShowHistory(false)}
          onOpen={entry => {
            setMode(entry.mode);
            setJurisdiction(entry.jurisdiction);
            setResult(entry.result);
            setTab(0);
          }}
        />
      )}

      {pendingMode && createPortal(
        <div
          onClick={() => setPendingMode(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, padding: "1.5rem" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", width: "100%", maxWidth: 360, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", border: "0.5px solid #e0e0da" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: 22, color: "#e67e22" }} />
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                {lang === "ru" ? "Сменить режим?" : "Switch mode?"}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 18 }}>
              {lang === "ru"
                ? "При переключении режима текущий результат анализа будет сброшен. Документы останутся загруженными."
                : "Switching mode will clear the current analysis result. Your documents will remain loaded."}
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#888", marginBottom: 18, cursor: "pointer", userSelect: "none" }}>
              <input
                type="checkbox"
                style={{ width: 15, height: 15, cursor: "pointer" }}
                onChange={e => {
                  if (e.target.checked) localStorage.setItem("lexai_skip_mode_warn", "1");
                  else localStorage.removeItem("lexai_skip_mode_warn");
                }}
              />
              {lang === "ru" ? "Больше не показывать" : "Don't show again"}
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setPendingMode(null)}
                style={{ flex: 1, padding: "9px", fontSize: 13, borderRadius: 9, border: "0.5px solid #ddd", background: "#f5f5f2", color: "#555", cursor: "pointer" }}
              >
                {lang === "ru" ? "Отмена" : "Cancel"}
              </button>
              <button
                onClick={() => { setMode(pendingMode); setDocType(0); setResult(null); setPendingMode(null); }}
                style={{ flex: 1, padding: "9px", fontSize: 13, fontWeight: 600, borderRadius: 9, border: "none", background: "#1a1a18", color: "#fff", cursor: "pointer" }}
              >
                {lang === "ru" ? "Переключить" : "Switch"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showCreditPacks && (
        <CreditPacksModal
          lang={lang}
          onBuy={pack => {
            // placeholder for real payment — just credits the account now
            addBonusCredits(pack.credits);
            setBonusCredits(getBonusCredits());
            setShowCreditPacks(false);
          }}
          onClose={() => setShowCreditPacks(false)}
        />
      )}
    </div>
  );
}
