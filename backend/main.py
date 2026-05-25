import os
import httpx
import json
import logging
import time
from datetime import datetime, timezone
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("lexai")

API_KEY      = os.getenv("ANTHROPIC_API_KEY")
TAVILY_KEY   = os.getenv("TAVILY_API_KEY")
TAVILY_URL   = "https://api.tavily.com/search"
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
MAX_DOC_BYTES = 2_000_000
MAX_SEARCH_ROUNDS = 3   # max tool-call iterations per analysis

# Legal sources by jurisdiction and type (for Tavily domain filtering)
JURISDICTION_DOMAINS = {
    "RU": {
        "legislation":    ["pravo.gov.ru"],
        "supreme_court":  ["vsrf.ru", "ksrf.ru"],
        "court_practice": ["sudact.ru"],
        "arbitration":    [],  # handled via direct KAD API
    },
    "KZ": {
        "legislation":    ["adilet.zan.kz"],
        "supreme_court":  ["sud.kz"],
        "court_practice": ["sud.kz"],
        "arbitration":    ["sud.kz"],
    },
    "EU": {
        "legislation":    ["eur-lex.europa.eu"],
        "supreme_court":  ["curia.europa.eu"],
        "court_practice": ["curia.europa.eu", "e-justice.europa.eu"],
        "arbitration":    ["eur-lex.europa.eu"],
    },
    "US": {
        "legislation":    ["law.cornell.edu", "govinfo.gov", "congress.gov"],
        "supreme_court":  ["supremecourt.gov"],
        "court_practice": ["courtlistener.com", "justia.com"],
        "arbitration":    ["courtlistener.com"],
    },
    "UK": {
        "legislation":    ["legislation.gov.uk"],
        "supreme_court":  ["judiciary.gov.uk", "supremecourt.uk"],
        "court_practice": ["bailii.org", "judiciary.gov.uk"],
        "arbitration":    ["bailii.org"],
    },
    "DE": {
        "legislation":    ["gesetze-im-internet.de", "dejure.org"],
        "supreme_court":  ["bundesverfassungsgericht.de", "bundesgerichtshof.de"],
        "court_practice": ["bundesgerichtshof.de", "dejure.org"],
        "arbitration":    ["bundesgerichtshof.de"],
    },
}

# Source descriptions per jurisdiction for the tool prompt
JURISDICTION_SOURCE_DESCRIPTIONS = {
    "RU": (
        "legislation — тексты законов (pravo.gov.ru); "
        "supreme_court — Пленумы ВС и Обзоры судебной практики (vsrf.ru, ksrf.ru); "
        "court_practice — решения судов общей юрисдикции (sudact.ru); "
        "arbitration — картотека арбитражных дел (kad.arbitr.ru)"
    ),
    "KZ": (
        "legislation — законодательство РК (adilet.zan.kz); "
        "supreme_court — Верховный суд РК (sud.kz); "
        "court_practice — судебная практика (sud.kz); "
        "arbitration — арбитражные решения (sud.kz)"
    ),
    "EU": (
        "legislation — EU laws and directives (eur-lex.europa.eu); "
        "supreme_court — Court of Justice of the EU (curia.europa.eu); "
        "court_practice — EU court decisions (curia.europa.eu, e-justice.europa.eu); "
        "arbitration — EU legal database (eur-lex.europa.eu)"
    ),
    "US": (
        "legislation — federal statutes and CFR (law.cornell.edu, govinfo.gov, congress.gov); "
        "supreme_court — SCOTUS opinions (supremecourt.gov); "
        "court_practice — federal and state case law (courtlistener.com, justia.com); "
        "arbitration — federal court records (courtlistener.com)"
    ),
    "UK": (
        "legislation — UK statutes and statutory instruments (legislation.gov.uk); "
        "supreme_court — UK Supreme Court and judiciary (judiciary.gov.uk, supremecourt.uk); "
        "court_practice — British and Irish case law (bailii.org); "
        "arbitration — UK court decisions (bailii.org)"
    ),
    "DE": (
        "legislation — Bundesgesetze (gesetze-im-internet.de, dejure.org); "
        "supreme_court — Bundesverfassungsgericht and BGH (bundesverfassungsgericht.de, bundesgerichtshof.de); "
        "court_practice — BGH Urteile (bundesgerichtshof.de, dejure.org); "
        "arbitration — BGH Entscheidungen (bundesgerichtshof.de)"
    ),
}

KAD_URL     = "https://kad.arbitr.ru/Kad/SearchInstances"
KAD_HEADERS = {
    "Content-Type":    "application/json",
    "Accept":          "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "Referer":         "https://kad.arbitr.ru/",
    "User-Agent":      "Mozilla/5.0 (compatible; LexAI/1.0)",
}

def build_legal_search_tool(jurisdiction: str) -> dict:
    source_desc = JURISDICTION_SOURCE_DESCRIPTIONS.get(
        jurisdiction,
        JURISDICTION_SOURCE_DESCRIPTIONS["US"]  # fallback
    )
    return {
        "name": "search_legal_sources",
        "description": (
            f"Search authoritative legal sources for jurisdiction: {jurisdiction}. "
            "Use this tool to find laws, court decisions, and legal practice. "
            "Make no more than 4 searches total. If a search returns no results, "
            "move on — do NOT retry the same query."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query in the language appropriate for the jurisdiction"
                },
                "source": {
                    "type": "string",
                    "enum": ["legislation", "supreme_court", "court_practice", "arbitration"],
                    "description": source_desc
                }
            },
            "required": ["query", "source"]
        }
    }

# Token pricing per million tokens (update here when model changes)
MODEL_PRICING = {
    "claude-sonnet-4-5": {"input": 3.00, "output": 15.00},
    "claude-sonnet-4-6": {"input": 3.00, "output": 15.00},
}

LOGS_DIR = Path(__file__).parent / "logs"
LOGS_DIR.mkdir(exist_ok=True)
USAGE_LOG = LOGS_DIR / "usage.jsonl"

app = FastAPI(title="LexAI Proxy")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def kad_search(query: str) -> str:
    """Search kad.arbitr.ru via its internal JSON API."""
    payload = {
        "Page":         1,
        "Count":        10,
        "Words":        query,
        "Sides":        [],
        "Judges":       [],
        "Courts":       [],
        "DateFrom":     None,
        "DateTo":       None,
        "WithVKS":      False,
        "WithSPbGS":    False,
    }
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(KAD_URL, json=payload, headers=KAD_HEADERS)
        if resp.status_code == 451:
            return "[kad.arbitr.ru: геоблок — доступен только с российских IP. Используйте российский VPS или прокси.]"
        if resp.status_code != 200:
            log.warning(f"kad.arbitr.ru returned {resp.status_code}")
            return f"[kad.arbitr.ru недоступен: HTTP {resp.status_code}]"

        data = resp.json()
        items = data.get("Result", {}).get("Items", [])
        if not items:
            return "По данному запросу в картотеке арбитражных дел ничего не найдено."

        parts = []
        for item in items[:7]:
            number   = item.get("CaseId", "")
            court    = item.get("CourtName", "")
            date     = item.get("DateStr", "")
            sides    = item.get("Sides", [])
            claimant = sides[0].get("Name", "") if len(sides) > 0 else ""
            respondent = sides[1].get("Name", "") if len(sides) > 1 else ""
            url      = f"https://kad.arbitr.ru/Card/{number}" if number else ""
            parts.append(
                f"Дело №{number} | {court} | {date}\n"
                f"Истец: {claimant}\nОтветчик: {respondent}\n"
                f"Ссылка: {url}"
            )
        return "\n\n---\n\n".join(parts)

    except Exception as e:
        log.error(f"kad.arbitr.ru search error: {e}")
        return f"[Ошибка поиска в картотеке: {e}]"


async def tavily_search(query: str, source: str, jurisdiction: str = "RU") -> str:
    if source == "arbitration" and jurisdiction == "RU":
        return await kad_search(query)

    if not TAVILY_KEY:
        return "[Search unavailable: TAVILY_API_KEY not configured]"

    jur_domains = JURISDICTION_DOMAINS.get(jurisdiction, JURISDICTION_DOMAINS["US"])
    domains = jur_domains.get(source, [])
    payload = {
        "api_key": TAVILY_KEY,
        "query": query,
        "search_depth": "basic",
        "max_results": 3,
        "include_answer": True,
        "include_raw_content": False,
    }
    if domains:
        payload["include_domains"] = domains

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(TAVILY_URL, json=payload)
        data = resp.json()
    except Exception as e:
        log.error(f"Tavily search error: {e}")
        return f"[Ошибка поиска: {e}]"

    answer = data.get("answer", "")
    results = data.get("results", [])

    parts = []
    if answer:
        parts.append(f"Краткий ответ: {answer}")
    for r in results:
        title   = r.get("title", "")
        url     = r.get("url", "")
        content = r.get("content", "")[:600]   # обрезаем чтобы не раздувать контекст
        parts.append(f"[{title}]\n{url}\n{content}")

    if not parts:
        return "По данному запросу ничего не найдено."
    return "\n\n---\n\n".join(parts)


def calc_cost(model: str, tokens_in: int, tokens_out: int) -> float:
    pricing = MODEL_PRICING.get(model, {"input": 3.00, "output": 15.00})
    return round((tokens_in * pricing["input"] + tokens_out * pricing["output"]) / 1_000_000, 6)


def write_log(entry: dict):
    try:
        with open(USAGE_LOG, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception as e:
        log.error(f"Failed to write log: {e}")


@app.post("/analyze")
async def analyze(request: Request):
    log.info("=== /analyze called ===")
    if not API_KEY:
        raise HTTPException(500, "API key not configured")

    body = await request.json()
    initial_messages = body.get("messages", [])

    for msg in initial_messages:
        content = msg.get("content", "")
        if isinstance(content, str) and len(content.encode()) > MAX_DOC_BYTES:
            raise HTTPException(413, "Document too large")

    model       = body.get("model", "claude-sonnet-4-5")
    system      = body.get("system", "")
    max_tokens  = body.get("max_tokens", 8000)
    jurisdiction = body.get("jurisdiction", "RU")

    meta        = body.get("meta", {})
    user_id     = meta.get("user_id", "unknown")
    plan        = meta.get("plan", "free")
    credits     = meta.get("credits_deducted", 0)
    docs_info   = meta.get("docs", [])
    total_chars = meta.get("total_chars", 0)

    log.info(f"user={user_id} plan={plan} docs={len(docs_info)} chars={total_chars}")

    full_text  = ""
    tokens_in  = 0
    tokens_out = 0
    searches   = 0
    started_at = time.monotonic()
    status     = "ok"

    anthro_headers = {
        "x-api-key":         API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type":      "application/json",
    }

    messages = list(initial_messages)

    try:
        async with httpx.AsyncClient(timeout=300) as client:
            for iteration in range(MAX_SEARCH_ROUNDS + 1):
                payload = {
                    "model":       model,
                    "max_tokens":  max_tokens,
                    "temperature": 0,
                    "system":      system,
                    "messages":    messages,
                    "tools":       [build_legal_search_tool(jurisdiction)],
                }

                resp = await client.post(ANTHROPIC_URL, json=payload, headers=anthro_headers)
                if resp.status_code != 200:
                    log.error(f"Anthropic error {resp.status_code}: {resp.text}")
                    raise HTTPException(502, f"Anthropic error: {resp.status_code}")

                data        = resp.json()
                stop_reason = data.get("stop_reason")
                content     = data.get("content", [])
                usage       = data.get("usage", {})

                tokens_in  += usage.get("input_tokens", 0)
                tokens_out += usage.get("output_tokens", 0)

                log.info(f"Iteration {iteration}: stop_reason={stop_reason} searches_so_far={searches}")

                if stop_reason == "tool_use":
                    # append assistant turn
                    messages.append({"role": "assistant", "content": content})

                    tool_results = []
                    for block in content:
                        if block.get("type") != "tool_use":
                            continue
                        tool_input = block.get("input", {})
                        query  = tool_input.get("query", "")
                        source = tool_input.get("source", "legislation")
                        log.info(f"Search [{source}]: {query}")
                        searches += 1
                        result = await tavily_search(query, source, jurisdiction)
                        tool_results.append({
                            "type":        "tool_result",
                            "tool_use_id": block["id"],
                            "content":     result,
                        })

                    messages.append({"role": "user", "content": tool_results})

                    if iteration >= MAX_SEARCH_ROUNDS:
                        log.warning("Max search rounds reached, forcing final answer")
                        # one last call without tools to get final text
                        payload["tools"] = []
                        resp2 = await client.post(ANTHROPIC_URL, json=payload, headers=anthro_headers)
                        data2 = resp2.json()
                        content = data2.get("content", [])
                        usage2  = data2.get("usage", {})
                        tokens_in  += usage2.get("input_tokens", 0)
                        tokens_out += usage2.get("output_tokens", 0)
                        full_text = "".join(b.get("text", "") for b in content if b.get("type") == "text")
                        break

                else:
                    # end_turn or max_tokens — extract final text
                    full_text = "".join(b.get("text", "") for b in content if b.get("type") == "text")
                    break

    except HTTPException:
        status = "error"
        raise
    except httpx.ReadTimeout:
        log.error("ReadTimeout from Anthropic")
        status = "timeout"
        raise HTTPException(504, "Anthropic timeout")
    except Exception as e:
        log.error(f"Error: {type(e).__name__}: {e}")
        status = "error"
        raise HTTPException(500, str(e))
    finally:
        duration_ms = int((time.monotonic() - started_at) * 1000)
        cost_usd    = calc_cost(model, tokens_in, tokens_out)

        write_log({
            "ts":               datetime.now(timezone.utc).isoformat(),
            "user_id":          user_id,
            "action":           "analyze",
            "plan":             plan,
            "model":            model,
            "docs":             docs_info,
            "total_chars":      total_chars,
            "tokens_in":        tokens_in,
            "tokens_out":       tokens_out,
            "cost_usd":         cost_usd,
            "credits_deducted": credits,
            "searches":         searches,
            "duration_ms":      duration_ms,
            "status":           status,
        })
        log.info(
            f"Logged: user={user_id} tokens={tokens_in}+{tokens_out} searches={searches} "
            f"cost=${cost_usd:.4f} credits={credits} dur={duration_ms}ms status={status}"
        )

    return JSONResponse(content={
        "text":       full_text,
        "tokens_in":  tokens_in,
        "tokens_out": tokens_out,
        "cost_usd":   cost_usd,
    })


@app.post("/chat")
async def chat(request: Request):
    log.info("=== /chat called ===")
    if not API_KEY:
        raise HTTPException(500, "API key not configured")

    body = await request.json()
    model = body.get("model", "claude-sonnet-4-5")
    meta  = body.get("meta", {})

    payload = {
        "model":      model,
        "max_tokens": body.get("max_tokens", 1000),
        "system":     body.get("system", ""),
        "messages":   body.get("messages", []),
    }

    started_at = time.monotonic()
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            ANTHROPIC_URL,
            json=payload,
            headers={
                "x-api-key": API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
        )

    duration_ms = int((time.monotonic() - started_at) * 1000)
    resp_data = resp.json()
    usage = resp_data.get("usage", {})
    tokens_in  = usage.get("input_tokens", 0)
    tokens_out = usage.get("output_tokens", 0)
    cost_usd   = calc_cost(model, tokens_in, tokens_out)

    write_log({
        "ts":          datetime.now(timezone.utc).isoformat(),
        "user_id":     meta.get("user_id", "unknown"),
        "action":      "chat",
        "plan":        meta.get("plan", "free"),
        "model":       model,
        "tokens_in":   tokens_in,
        "tokens_out":  tokens_out,
        "cost_usd":    cost_usd,
        "duration_ms": duration_ms,
        "status":      "ok" if resp.status_code == 200 else "error",
    })

    log.info(f"Chat: user={meta.get('user_id','?')} tokens={tokens_in}+{tokens_out} cost=${cost_usd:.4f}")
    return JSONResponse(content=resp_data, status_code=resp.status_code)


@app.get("/admin/logs")
async def admin_logs(
    limit: int = Query(100, ge=1, le=10000),
    user_id: str = Query(None),
    action: str = Query(None),
):
    """Return recent log entries. Add auth before exposing publicly."""
    if not USAGE_LOG.exists():
        return JSONResponse(content={"entries": [], "total": 0})

    entries = []
    with open(USAGE_LOG, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                e = json.loads(line)
                if user_id and e.get("user_id") != user_id:
                    continue
                if action and e.get("action") != action:
                    continue
                entries.append(e)
            except json.JSONDecodeError:
                continue

    # latest first
    entries.reverse()
    total = len(entries)
    entries = entries[:limit]

    # aggregate stats
    total_cost = sum(e.get("cost_usd", 0) for e in entries)
    total_tokens_in  = sum(e.get("tokens_in", 0) for e in entries)
    total_tokens_out = sum(e.get("tokens_out", 0) for e in entries)

    return JSONResponse(content={
        "total":            total,
        "shown":            len(entries),
        "total_cost_usd":   round(total_cost, 4),
        "total_tokens_in":  total_tokens_in,
        "total_tokens_out": total_tokens_out,
        "entries":          entries,
    })


@app.get("/admin/stats")
async def admin_stats():
    """Per-user and per-plan aggregated stats."""
    if not USAGE_LOG.exists():
        return JSONResponse(content={})

    users: dict = {}
    plans: dict = {}

    with open(USAGE_LOG, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                e = json.loads(line)
            except json.JSONDecodeError:
                continue

            uid  = e.get("user_id", "unknown")
            plan = e.get("plan", "free")
            cost = e.get("cost_usd", 0)
            cr   = e.get("credits_deducted", 0)

            if uid not in users:
                users[uid] = {"actions": 0, "cost_usd": 0, "credits": 0, "plan": plan}
            users[uid]["actions"] += 1
            users[uid]["cost_usd"] = round(users[uid]["cost_usd"] + cost, 6)
            users[uid]["credits"]  += cr
            users[uid]["plan"] = plan  # last known plan

            if plan not in plans:
                plans[plan] = {"actions": 0, "cost_usd": 0, "users": set()}
            plans[plan]["actions"] += 1
            plans[plan]["cost_usd"] = round(plans[plan]["cost_usd"] + cost, 6)
            plans[plan]["users"].add(uid)

    # sets aren't JSON-serialisable
    for p in plans.values():
        p["unique_users"] = len(p.pop("users"))

    return JSONResponse(content={"by_user": users, "by_plan": plans})


from fastapi.responses import HTMLResponse

@app.get("/terms", response_class=HTMLResponse)
async def terms():
    return HTMLResponse(content="""
<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>LexAI — Условия использования</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:720px;margin:40px auto;padding:0 20px;color:#1a1a2e;line-height:1.7}h1{color:#4f46e5}h2{color:#374151;margin-top:2em}a{color:#4f46e5}</style></head>
<body>
<h1>Условия использования LexAI</h1>
<p><em>Последнее обновление: май 2025</em></p>
<h2>1. Общие положения</h2>
<p>LexAI («Сервис») предоставляет инструменты для анализа юридических документов с помощью искусственного интеллекта. Используя Сервис, вы соглашаетесь с настоящими Условиями.</p>
<h2>2. Не является юридической консультацией</h2>
<p>Результаты анализа LexAI носят исключительно информационный характер и <strong>не являются юридической консультацией</strong>. Для принятия юридически значимых решений обращайтесь к лицензированному юристу.</p>
<h2>3. Передача данных</h2>
<p>Текст загруженных документов передаётся на серверы Anthropic (США) для обработки моделью Claude AI. Anthropic не использует данные API для обучения моделей согласно своей политике конфиденциальности.</p>
<h2>4. Ограничения использования</h2>
<p>Запрещается загружать документы, содержащие государственную тайну, персональные данные третьих лиц без их согласия, а также материалы, раскрытие которых запрещено законом или условиями NDA.</p>
<h2>5. Ограничение ответственности</h2>
<p>Сервис предоставляется «как есть». LexAI не несёт ответственности за убытки, возникшие в результате использования результатов анализа.</p>
<h2>6. Контакты</h2>
<p>По вопросам: <a href="mailto:support@lexai.app">support@lexai.app</a></p>
</body></html>
""")


@app.get("/privacy", response_class=HTMLResponse)
async def privacy():
    return HTMLResponse(content="""
<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>LexAI — Политика конфиденциальности</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:720px;margin:40px auto;padding:0 20px;color:#1a1a2e;line-height:1.7}h1{color:#4f46e5}h2{color:#374151;margin-top:2em}a{color:#4f46e5}</style></head>
<body>
<h1>Политика конфиденциальности LexAI</h1>
<p><em>Последнее обновление: май 2025</em></p>
<h2>1. Какие данные мы собираем</h2>
<ul>
<li>Данные Google-аккаунта при авторизации (имя, email, фото)</li>
<li>Метаданные анализов (тип документа, юрисдикция, дата) — без содержимого документов</li>
<li>Технические логи (токены, время запроса, ошибки) без персональных данных</li>
</ul>
<h2>2. Что мы НЕ храним</h2>
<p>LexAI <strong>не сохраняет содержимое ваших документов</strong>. Текст документа используется только для генерации анализа и не записывается в базы данных.</p>
<h2>3. Передача данных третьим лицам</h2>
<ul>
<li><strong>Anthropic</strong> — текст документа для анализа (не используется для обучения моделей)</li>
<li><strong>Google Firebase</strong> — авторизация и хранение истории анализов</li>
<li><strong>Tavily</strong> — поисковые запросы для поиска правовых источников (без текста документа)</li>
</ul>
<h2>4. Безопасность</h2>
<p>Передача данных осуществляется по зашифрованному соединению HTTPS. API-ключи хранятся только на серверах LexAI и никогда не передаются на устройство пользователя.</p>
<h2>5. Ваши права</h2>
<p>Вы можете запросить удаление своих данных, написав на <a href="mailto:support@lexai.app">support@lexai.app</a>.</p>
<h2>6. Контакты</h2>
<p><a href="mailto:support@lexai.app">support@lexai.app</a></p>
</body></html>
""")
