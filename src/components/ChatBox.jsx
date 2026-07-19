import { useState, useRef, useEffect } from "react";

export default function ChatBox({ t, lang, profile, matchedIds }) {
  const [history, setHistory] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [history]);

  async function ask(e) {
    e.preventDefault();
    const question = q.trim();
    if (!question || busy) return;
    setQ("");
    setHistory((h) => [...h, { role: "user", text: question }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, language: lang, profile, matchedSchemeIds: matchedIds, history })
      });
      const data = await res.json().catch(() => ({}));
      const text = (typeof data.answer === "string" && data.answer) ||
                   (typeof data.error === "string" && data.error) ||
                   "⚠️ No response — please try again.";
      setHistory((h) => [...h, { role: "ai", text }]);
    } catch {
      setHistory((h) => [...h, { role: "ai", text: "⚠️ Network error — please try again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat">
      <h3>{t.askTitle}</h3>
      <div className="chat-log">
        {history.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>{m.text}</div>
        ))}
        {busy && <div className="msg ai typing">•••</div>}
        <div ref={endRef} />
      </div>
      <form className="chat-input" onSubmit={ask}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.askPlaceholder} maxLength={500} />
        <button type="submit" disabled={busy}>{t.send}</button>
      </form>
    </div>
  );
}
