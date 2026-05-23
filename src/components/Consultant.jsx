import { useState, useRef } from "react";
import { chatWithConsultant } from "../api";
import { consultantSystemPrompt } from "../prompts";

export default function Consultant({ jurLabel, jurisdictionCode, lang, result, docText, isPro, onUpgrade }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef();

  const send = async () => {
    if (!input.trim() || loading) return;
    if (!isPro) { onUpgrade(); return; }
    const msg = input.trim();
    setInput("");
    const newMsgs = [...messages, { role: "user", content: msg }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const sysPrompt = consultantSystemPrompt(
        jurLabel, jurisdictionCode, lang,
        result ? JSON.stringify(result).slice(0, 2000) : "",
        docText ? docText.slice(0, 2000) : ""
      );
      const reply = await chatWithConsultant({ systemPrompt: sysPrompt, messages: newMsgs });
      setMessages(m => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Error — please try again." }]);
    }
    setLoading(false);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div>
      <div style={{ height: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, padding: "4px 0", marginBottom: 10 }}>
        {messages.length === 0 && (
          <div style={{ fontSize: 13, color: "var(--color-text-tertiary)", textAlign: "center", marginTop: 40 }}>
            <i className="ti ti-message-circle" style={{ fontSize: 24, display: "block", marginBottom: 8 }} aria-hidden="true" />
            Ask about this document or any legal question in {jurLabel} jurisdiction
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "80%", padding: "8px 12px", borderRadius: "var(--border-radius-md)", fontSize: 13, background: m.role === "user" ? "var(--color-background-info)" : "var(--color-background-secondary)", color: m.role === "user" ? "var(--color-text-info)" : "var(--color-text-primary)", border: "0.5px solid var(--color-border-tertiary)", whiteSpace: "pre-wrap" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "8px 12px", borderRadius: "var(--border-radius-md)", fontSize: 13, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", color: "var(--color-text-secondary)" }}>
              <i className="ti ti-dots" style={{ fontSize: 14 }} aria-hidden="true" /> Analyzing...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask the AI consultant..."
          style={{ flex: 1, fontSize: 13, padding: "8px 12px" }}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{ padding: "8px 16px", fontSize: 13 }}>
          Send
        </button>
      </div>
    </div>
  );
}
