import { useState, useRef, useEffect, useCallback } from "react";

/** Starter questions per language — one tap to ask (also great for demos). */
const SUGGESTIONS = {
  en: ["Where do I get an income certificate?", "What documents do I need first?", "Can I apply at a CSC centre?"],
  hi: ["आय प्रमाणपत्र कहाँ से बनेगा?", "सबसे पहले कौन से दस्तावेज़ चाहिए?", "क्या मैं CSC केंद्र पर आवेदन कर सकता हूँ?"],
  te: ["ఆదాయ ధృవీకరణ పత్రం ఎక్కడ వస్తుంది?", "ముందుగా ఏ పత్రాలు కావాలి?", "CSC కేంద్రంలో దరఖాస్తు చేయవచ్చా?"]
};

const REQUEST_TIMEOUT_MS = 30000;

export default function ChatBox({ t, lang, profile, matchedIds }) {
  const [history, setHistory] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [failedQuestion, setFailedQuestion] = useState(null);

  const logRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  // Abort any in-flight request when the component unmounts.
  useEffect(() => () => abortRef.current?.abort("unmount"), []);

  // Smart auto-scroll via scrollTop (never scrollIntoView — extensions can
  // monkey-patch it and crash React's commit phase). Only follow new messages
  // if the user is already near the bottom, so we never yank them mid-read.
  useEffect(() => {
    try {
      const el = logRef.current;
      if (!el) return;
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      const lastIsUser = history[history.length - 1]?.role === "user";
      if (nearBottom || lastIsUser) el.scrollTop = el.scrollHeight;
    } catch { /* scrolling is cosmetic — never let it crash the UI */ }
  }, [history, busy]);

  const sendQuestion = useCallback(async (raw) => {
    const question = String(raw || "").trim().slice(0, 500);
    if (!question || busy) return;

    setQ("");
    setFailedQuestion(null);
    setHistory((h) => [...h, { role: "user", text: question }]);
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(() => controller.abort("timeout"), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          question,
          language: lang,
          profile,
          matchedSchemeIds: matchedIds,
          history: history.slice(-6)
        })
      });
      const data = await res.json().catch(() => ({}));
      const text =
        (typeof data.answer === "string" && data.answer) ||
        (typeof data.error === "string" && data.error) ||
        "⚠️ No response — please try again.";
      setHistory((h) => [...h, { role: "ai", text }]);
      if (!res.ok) setFailedQuestion(question);
    } catch (err) {
      if (controller.signal.reason === "unmount") return; // component gone — do nothing
      const text = controller.signal.reason === "timeout"
        ? "⚠️ The assistant took too long. Please try again."
        : "⚠️ Network error — please try again.";
      setHistory((h) => [...h, { role: "ai", text }]);
      setFailedQuestion(question);
    } finally {
      clearTimeout(timer);
      setBusy(false);
      try { inputRef.current?.focus(); } catch { /* focus is cosmetic */ }
    }
  }, [busy, lang, profile, matchedIds, history]);

  const suggestions = SUGGESTIONS[lang] || SUGGESTIONS.en;

  return (
    <div className="chat">
      <h3>{t.askTitle}</h3>

      {history.length === 0 && (
        <div className="chips">
          {suggestions.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => sendQuestion(s)} disabled={busy}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="chat-log" ref={logRef}>
        {history.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>{m.text}</div>
        ))}
        {busy && <div className="msg ai typing">•••</div>}
      </div>

      {failedQuestion && !busy && (
        <button type="button" className="chip retry" onClick={() => sendQuestion(failedQuestion)}>
          ↻ {t.send}: "{failedQuestion.slice(0, 40)}{failedQuestion.length > 40 ? "…" : ""}"
        </button>
      )}

      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); sendQuestion(q); }}>
        <input
          id="chat-question"
          name="question"
          autoComplete="off"
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.askPlaceholder}
          maxLength={500}
        />
        <button type="submit" disabled={busy || !q.trim()}>{t.send}</button>
      </form>
    </div>
  );
}
