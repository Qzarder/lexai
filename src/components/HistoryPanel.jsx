import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getHistory, deleteFromHistory, extendEntry, daysUntilExpiry, isExpiringSoon, MAX_EXT } from "../history";

const RISK_COLOR = {
  low: "#27ae60", medium: "#e67e22", high: "#e74c3c", critical: "#c0392b",
  strong: "#27ae60", moderate: "#e67e22", weak: "#e74c3c", insufficient: "#c0392b",
  favorable: "#27ae60", uncertain: "#e67e22", unfavorable: "#e74c3c", poor: "#c0392b",
};

const L = {
  ru: {
    title: "Мои документы",
    empty: "История анализов пуста",
    emptyHint: "Запустите анализ — результат сохранится здесь автоматически",
    open: "Открыть",
    delete: "Удалить",
    extend: "Продлить",
    expiresIn: (d) => `Удалится через ${d} дн.`,
    extended: (n) => `Продлено ${n}× из ${MAX_EXT}`,
    maxExtended: "Достигнут максимальный срок",
    contract: "Договор",
    procedural: "Процессуальный",
    cacheWarning: "Данные хранятся в браузере. При очистке кэша вся история будет удалена безвозвратно.",
    docs: (n) => n === 1 ? "1 документ" : `${n} документа`,
  },
  en: {
    title: "My Documents",
    empty: "No analyses yet",
    emptyHint: "Run an analysis — the result will be saved here automatically",
    open: "Open",
    delete: "Delete",
    extend: "Extend",
    expiresIn: (d) => `Deletes in ${d}d`,
    extended: (n) => `Extended ${n}× of ${MAX_EXT}`,
    maxExtended: "Maximum retention reached",
    contract: "Contract",
    procedural: "Procedural",
    cacheWarning: "Data is stored in your browser. Clearing browser cache will permanently delete all history.",
    docs: (n) => n === 1 ? "1 document" : `${n} documents`,
  },
};
L.de = { ...L.en, title: "Meine Dokumente", empty: "Keine Analysen", cacheWarning: "Daten im Browser gespeichert. Beim Löschen des Cache geht die gesamte Historie verloren." };
L.fr = { ...L.en, title: "Mes documents",   empty: "Aucune analyse",  cacheWarning: "Données stockées dans le navigateur. Vider le cache supprimera tout l'historique." };
L.zh = { ...L.en, title: "我的文件",          empty: "暂无分析记录",    cacheWarning: "数据存储在浏览器中。清除缓存将永久删除所有历史记录。" };
L.es = { ...L.en, title: "Mis documentos",  empty: "Sin análisis",    cacheWarning: "Datos almacenados en el navegador. Limpiar la caché eliminará todo el historial." };

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}

export default function HistoryPanel({ lang, onOpen, onClose }) {
  const t = L[lang] || L.en;
  const [entries, setEntries] = useState([]);

  useEffect(() => { setEntries(getHistory()); }, []);

  const handleDelete = (id) => {
    deleteFromHistory(id);
    setEntries(getHistory());
  };

  const handleExtend = (id) => {
    extendEntry(id);
    setEntries(getHistory());
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", zIndex: 2000 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 420, height: "100%", background: "#fff", boxShadow: "-4px 0 24px rgba(0,0,0,0.14)", display: "flex", flexDirection: "column", overflowY: "auto" }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "0.5px solid #e8e8e2", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-archive" style={{ fontSize: 18, color: "#555" }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>{t.title}</span>
            {entries.length > 0 && (
              <span style={{ fontSize: 11, background: "#f0f0ec", color: "#666", padding: "2px 7px", borderRadius: 20 }}>{entries.length}</span>
            )}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#888", lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>

        {/* Cache warning */}
        <div style={{ margin: "1rem 1.5rem 0", padding: "10px 12px", background: "#fff8e6", border: "0.5px solid #f5d87a", borderRadius: 8, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <i className="ti ti-alert-triangle" style={{ fontSize: 14, color: "#c8960c", flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: "#7a5c00", lineHeight: 1.5 }}>{t.cacheWarning}</span>
        </div>

        {/* List */}
        <div style={{ flex: 1, padding: "1rem 1.5rem" }}>
          {entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "#aaa" }}>
              <i className="ti ti-files" style={{ fontSize: 36, display: "block", marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 500, color: "#666", marginBottom: 6 }}>{t.empty}</div>
              <div style={{ fontSize: 12 }}>{t.emptyHint}</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {entries.map(entry => {
                const days    = daysUntilExpiry(entry);
                const warning = isExpiringSoon(entry);
                const levelKey = entry.mode === "procedural" ? entry.level : entry.overallRisk;
                const color   = RISK_COLOR[levelKey] || "#888";
                const docNames = Array.isArray(entry.docNames) ? entry.docNames : [entry.docNames].filter(Boolean);
                const canExtend = (entry.extensions || 0) < MAX_EXT;

                return (
                  <div key={entry.id} style={{ border: `0.5px solid ${warning ? "#f5d87a" : "#e8e8e2"}`, borderRadius: 10, padding: "0.9rem 1rem", background: warning ? "#fffdf0" : "#fafaf8" }}>
                    {/* Top row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: entry.mode === "procedural" ? "#f0f0ff" : "#f0f0ec", color: entry.mode === "procedural" ? "#5b5bd6" : "#555" }}>
                        {entry.mode === "procedural" ? t.procedural : t.contract}
                      </span>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#aaa", marginLeft: "auto" }}>{formatDate(entry.date)}</span>
                    </div>

                    {/* Doc names */}
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a18", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {docNames.join(" · ") || "—"}
                    </div>

                    {/* Verdict */}
                    <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {entry.verdict}
                    </div>

                    {/* Expiry */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <i className="ti ti-clock" style={{ fontSize: 12, color: warning ? "#c8960c" : "#bbb" }} />
                      <span style={{ fontSize: 11, color: warning ? "#c8960c" : "#bbb" }}>
                        {warning ? t.expiresIn(days) : t.expiresIn(days)}
                      </span>
                      {entry.extensions > 0 && (
                        <span style={{ fontSize: 11, color: "#aaa", marginLeft: 4 }}>
                          · {canExtend ? t.extended(entry.extensions) : t.maxExtended}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => { onOpen(entry); onClose(); }}
                        style={{ flex: 1, padding: "7px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", background: "#1a1a18", color: "#fff", cursor: "pointer" }}
                      >
                        {t.open}
                      </button>
                      {warning && canExtend && (
                        <button
                          onClick={() => handleExtend(entry.id)}
                          style={{ padding: "7px 12px", fontSize: 12, borderRadius: 8, border: "0.5px solid #f5d87a", background: "#fff8e6", color: "#7a5c00", cursor: "pointer" }}
                        >
                          {t.extend}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(entry.id)}
                        style={{ padding: "7px 10px", fontSize: 13, borderRadius: 8, border: "0.5px solid #e8e8e2", background: "#fff", color: "#bbb", cursor: "pointer" }}
                      >
                        <i className="ti ti-trash" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
