export default function SchemeCard({ m, t }) {
  return (
    <article className="card">
      <div className="card-head">
        <span className="sector">{m.sector}</span>
        <h3>{m.name}</h3>
        <p className="benefit">{m.benefit}</p>
      </div>

      {m.ai ? (
        <div className="ai-block">
          {m.ai.why && <p className="why"><strong>{t.whyYou}:</strong> {String(m.ai.why)}</p>}
          {Array.isArray(m.ai.steps) && m.ai.steps.length > 0 && (
            <div className="steps">
              <strong>{t.howToApply}:</strong>
              <ol>{m.ai.steps.map((s, i) => <li key={i}>{String(s)}</li>)}</ol>
            </div>
          )}
          {m.ai.docTip && <p className="doctip">💡 <strong>{t.docTip}:</strong> {String(m.ai.docTip)}</p>}
        </div>
      ) : (
        <ul className="reasons">
          {(m.engineReasons || []).map((r, i) => <li key={i}>✓ {r}</li>)}
        </ul>
      )}

      <div className="docs">
        <strong>{t.documents}:</strong> {m.documents.join(" · ")}
      </div>

      <div className="card-foot">
        <span className="badge engine" title={t.engineBadge}>⚙ {t.engineBadge}</span>
        <a href={m.link} target="_blank" rel="noreferrer" className="official">{t.official} ↗</a>
      </div>
    </article>
  );
}
