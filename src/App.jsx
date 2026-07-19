import { useState } from "react";
import { T } from "./translations.js";
import ProfileForm from "./components/ProfileForm.jsx";
import SchemeCard from "./components/SchemeCard.jsx";
import ChatBox from "./components/ChatBox.jsx";

export default function App() {
  const [lang, setLang] = useState(null);
  const [step, setStep] = useState("welcome"); // welcome | form | loading | results
  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const t = T[lang || "en"];

  async function findSchemes(p) {
    setProfile(p);
    setStep("loading");
    setError(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: p, language: lang })
      });
      if (!res.ok) throw new Error((await res.json()).error || "Request failed");
      setResults(await res.json());
      setStep("results");
    } catch (e) {
      setError(e.message);
      setStep("form");
    }
  }

  function reset() {
    setStep("welcome");
    setResults(null);
    setProfile(null);
    setLang(null);
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo" onClick={reset} role="button">
          <span className="logo-mark">🪷</span>
          <span className="logo-text">{t.appName}</span>
        </div>
        {lang && (
          <div className="lang-switch">
            {["en", "hi", "te"].map((l) => (
              <button key={l} className={l === lang ? "active" : ""} onClick={() => setLang(l)}>
                {l === "en" ? "EN" : l === "hi" ? "हिं" : "తె"}
              </button>
            ))}
          </div>
        )}
      </header>

      {step === "welcome" && (
        <section className="hero">
          <h1>{T.en.tagline}</h1>
          <p className="hero-sub">{T.en.langPrompt}</p>
          <div className="lang-grid">
            <button className="lang-card" onClick={() => { setLang("en"); setStep("form"); }}>
              <span className="lang-big">English</span><span>Check My Schemes →</span>
            </button>
            <button className="lang-card" onClick={() => { setLang("hi"); setStep("form"); }}>
              <span className="lang-big">हिंदी</span><span>मेरी योजनाएँ देखें →</span>
            </button>
            <button className="lang-card" onClick={() => { setLang("te"); setStep("form"); }}>
              <span className="lang-big">తెలుగు</span><span>నా పథకాలు చూడండి →</span>
            </button>
          </div>
          <div className="hero-stats">
            <div><strong>21</strong><span>schemes covered</span></div>
            <div><strong>3</strong><span>languages</span></div>
            <div><strong>1 min</strong><span>to check eligibility</span></div>
          </div>
        </section>
      )}

      {step === "form" && (
        <section className="panel">
          <h2>{t.formTitle}</h2>
          <p className="hint">{t.formHint}</p>
          {error && <div className="error">⚠️ {error}</div>}
          <ProfileForm t={t} onSubmit={findSchemes} initial={profile} />
        </section>
      )}

      {step === "loading" && (
        <section className="panel center">
          <div className="spinner" />
          <p className="checking">{t.checking}</p>
        </section>
      )}

      {step === "results" && results && (
        <section className="results">
          <button className="back" onClick={() => setStep("form")}>← {t.back}</button>
          {results.matches.length === 0 ? (
            <div className="panel"><p>{t.noMatches}</p></div>
          ) : (
            <>
              {typeof results.summary === "string" && results.summary && (
                <div className="summary">
                  <span className="badge ai">✨ {t.aiBadge}</span>
                  <p>{results.summary}</p>
                </div>
              )}
              {results.aiError && <div className="error">⚠️ {results.aiError}</div>}
              <h2>{t.resultsTitle} ({results.matches.length})</h2>
              <div className="cards">
                {results.matches.map((m) => <SchemeCard key={m.id} m={m} t={t} />)}
              </div>
              <ChatBox t={t} lang={lang} profile={profile} matchedIds={results.matches.map((m) => m.id)} topScheme={results.matches[0]?.name} />
            </>
          )}
        </section>
      )}

      <footer className="footer">
        <p>{t.disclaimer}</p>
        <p className="credit">Scheme Sahayak · Idea2Impact 2026 · Data: official Government of India scheme portals</p>
      </footer>
    </div>
  );
}
