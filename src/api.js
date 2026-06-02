const ANALYZE_URL = "/api/analyze";
const CHAT_URL = "/api/chat";

export async function analyzeDocument({ systemPrompt, docText, charLimit, jurisdiction, meta, onProgress, outputLang = "Russian" }) {
  onProgress?.(10, "Отправляем документ...");

  const truncated = charLimit ? docText.slice(0, charLimit) : docText;

  // Reinforce the output language right next to the document. The system
  // prompt alone is often overridden by a long source document in another
  // language, making the model mirror the document's language instead.
  const userContent =
    `Analyze this document. The required OUTPUT LANGUAGE is ${outputLang}.\n\n` +
    `${truncated}\n\n` +
    `--- END OF DOCUMENT ---\n` +
    `REMINDER: Write your ENTIRE response — every JSON field value (verdict, ` +
    `summaries, risks, recommendations) — in ${outputLang}, regardless of the ` +
    `language the document is written in. Do NOT reply in the document's language.`;

  const res = await fetch(ANALYZE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      max_tokens: 16000,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
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

// Cheap pre-flight: ask the model which jurisdiction the document is drafted for,
// before the user spends credits on a full analysis. Uses /chat (no web search,
// tiny max_tokens). Fails open — returns null on any error so analysis proceeds.
export async function detectJurisdiction({ docText, jurisdictionCode, jurLabel, userId }) {
  const excerpt = docText.slice(0, 3000);
  const system =
    "You identify which jurisdiction a legal document is drafted for. " +
    "Allowed codes: RU=Russia, EU=European Union, US=United States, UK=United Kingdom, " +
    "DE=Germany, KZ=Kazakhstan, LATAM=Latin America, OTHER=anything else or unclear. " +
    "Judge by the governing-law clause, cited statutes, currency, addresses, court names and legal terminology. " +
    'Respond with ONLY a compact JSON object and nothing else: {"code":"<one allowed code>","name":"<short jurisdiction name>"}.';
  const user = `Selected jurisdiction: ${jurLabel} (${jurisdictionCode}).\n\nDocument excerpt:\n${excerpt}`;

  try {
    const res = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        max_tokens: 80,
        system,
        messages: [{ role: "user", content: user }],
        meta: { user_id: userId, plan: "detect" },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.content?.map(b => b.text || "").join("") || "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
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
