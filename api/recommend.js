/**
 * POST /api/recommend
 * Body: { profile: {...}, language: "en" | "hi" | "te" }
 *
 * Pipeline:
 *  1. Deterministic eligibility engine picks matching schemes (no AI in the decision).
 *  2. Gemini personalises: why it fits this person, exact next steps, document tips —
 *     in the citizen's language, grounded ONLY in the matched scheme data we pass in.
 */
import { matchSchemes, normalizeProfile } from "../lib/match.js";
import { geminiGenerate, parseModelJson } from "../lib/gemini.js";

const LANG_NAMES = { en: "English", hi: "Hindi (Devanagari script)", te: "Telugu (Telugu script)" };

/** Coerce whatever the model returned into safe, render-ready strings. */
function asText(v) {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map(asText).filter(Boolean).join(" ");
  if (typeof v === "object") return Object.values(v).map(asText).filter(Boolean).join(" ");
  return null;
}

function sanitizeAi(raw) {
  if (!raw || typeof raw !== "object") return null;
  const guidance = (Array.isArray(raw.guidance) ? raw.guidance : [])
    .filter((g) => g && typeof g === "object" && g.id)
    .map((g) => ({
      id: String(g.id),
      why: asText(g.why),
      steps: (Array.isArray(g.steps) ? g.steps : []).map(asText).filter(Boolean),
      docTip: asText(g.docTip)
    }));
  return { summary: asText(raw.summary), guidance };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  let profile;
  try {
    profile = normalizeProfile(req.body?.profile || {});
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
  const language = ["en", "hi", "te"].includes(req.body?.language) ? req.body.language : "en";

  const matches = matchSchemes(profile);
  if (matches.length === 0) {
    return res.status(200).json({ matches: [], summary: null });
  }

  // ---- AI personalisation layer (grounded in engine output) ----
  const schemeContext = matches.map(({ scheme, reasons }) => ({
    id: scheme.id,
    name: scheme.name,
    benefit: scheme.benefit,
    documents: scheme.documents,
    officialLink: scheme.link,
    whyEligible: reasons
  }));

  const system = `You are Scheme Sahayak, a warm, trustworthy assistant helping underserved Indian citizens access government welfare schemes.
Rules:
- Respond ONLY in ${LANG_NAMES[language]}. Use simple words a first-time reader understands. No jargon.
- Ground every statement in the scheme data provided. NEVER invent schemes, amounts, or rules.
- Be encouraging but honest. Always advise verifying details on the official portal before applying.
Output strict JSON matching: {"summary": string, "guidance": [{"id": string, "why": string, "steps": [string], "docTip": string}]}
- "summary": 2-3 sentences, personal, addressed to the citizen, naming their top 1-2 schemes.
- For each scheme: "why" = 1-2 sentences on why THEY qualify and what they gain; "steps" = 3 short, concrete application steps (mention the official portal, CSC centre, or bank as appropriate); "docTip" = one practical tip about documents.
- BE CONCISE: each step under 12 words, docTip under 15 words. Total output must stay well-formed JSON.`;

  const user = `Citizen profile: ${JSON.stringify(profile)}
Matched schemes (from the eligibility engine): ${JSON.stringify(schemeContext)}
Generate the JSON guidance now.`;

  let ai = null;
  let aiError = null;
  try {
    ai = sanitizeAi(parseModelJson(await geminiGenerate({ system, user, json: true })));
  } catch (e) {
    console.error("Gemini personalisation failed:", e.message);
    aiError = "AI guidance temporarily unavailable — showing verified scheme information.";
  }

  const guidanceById = Object.fromEntries((ai?.guidance || []).map((g) => [g.id, g]));

  const payload = matches.map(({ scheme, reasons }) => ({
    id: scheme.id,
    name: scheme.name,
    benefit: scheme.benefit,
    sector: scheme.sector,
    link: scheme.link,
    documents: scheme.documents,
    engineReasons: reasons,
    ai: guidanceById[scheme.id] || null
  }));

  return res.status(200).json({ matches: payload, summary: ai?.summary || null, aiError });
}
