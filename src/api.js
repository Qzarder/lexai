const ANALYZE_URL = "/api/analyze";
const CHAT_URL = "/api/chat";

export async function analyzeDocument({ systemPrompt, docText, charLimit, jurisdiction, meta, onProgress }) {
  onProgress?.(10, "Отправляем документ...");

  const truncated = charLimit ? docText.slice(0, charLimit) : docText;

  const res = await fetch(ANALYZE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      max_tokens: 16000,
      system: systemPrompt,
      messages: [{ role: "user", content: `Analyze this document:\n\n${truncated}` }],
      jurisdiction,  // drives backend web-search domain filtering
      meta,  // {user_id, plan, credits_deducted, docs:[{name,pages,chars}], total_chars}
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[LexAI] Error:", res.status, err);
    throw new Error(`Proxy error: ${res.status}`);
  }

  onProgress?.(70, "Получаем анализ...");
  const data = await res.json();
  onProgress?.(90, "Обрабатываем результат...");

  const text = data.text || "";
  const stripped = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in response");

  return {
    result:     JSON.parse(stripped.slice(start, end + 1)),
    tokens_in:  data.tokens_in  || 0,
    tokens_out: data.tokens_out || 0,
    cost_usd:   data.cost_usd   || 0,
  };
}

export async function chatWithConsultant({ systemPrompt, messages, meta }) {
  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      max_tokens: 1000,
      system: systemPrompt,
      messages,
      meta,
    }),
  });
  if (!res.ok) throw new Error(`Chat error: ${res.status}`);
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
}
