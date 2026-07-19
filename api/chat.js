/**
 * POST /api/chat
 * Body: { question, language, profile, matchedSchemeIds: [..], history: [{role, text}] }
 *
 * Grounded follow-up Q&A: answers only from the citizen's matched schemes
 * (dataset context injected server-side), in their language.
 */
import { SCHEMES } from "../lib/schemes.js";
import { geminiGenerate } from "../lib/gemini.js";

const LANG_NAMES = { en: "English", hi: "Hindi (Devanagari script)", te: "Telugu (Telugu script)" };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { question, matchedSchemeIds = [], history = [], profile = {} } = req.body || {};
  const language = ["en", "hi", "te"].includes(req.body?.language) ? req.body.language : "en";

  if (!question || typeof question !== "string" || question.length > 1000) {
    return res.status(400).json({ error: "Invalid question" });
  }

  const context = SCHEMES.filter((s) => matchedSchemeIds.includes(s.id)).map((s) => ({
    name: s.name, benefit: s.benefit, documents: s.documents, officialLink: s.link
  }));

  const system = `You are Scheme Sahayak, helping an Indian citizen understand government welfare schemes they matched with.
Rules:
- Respond ONLY in ${LANG_NAMES[language]}, in simple everyday words. Keep answers under 150 words.
- Answer ONLY from the scheme context provided. If asked about something outside it, say you can only help with their matched schemes and suggest visiting https://www.myscheme.gov.in.
- Never invent amounts, dates, or rules. Recommend verifying on the official portal.
- If the question hints at urgent distress (no food, medical emergency), gently mention local helplines (112 emergency, 1967 food/PDS, 104 health).`;

  const convo = history.slice(-6).map((h) => `${h.role === "user" ? "Citizen" : "Sahayak"}: ${h.text}`).join("\n");

  const user = `Citizen profile: ${JSON.stringify(profile)}
Matched scheme context: ${JSON.stringify(context)}
${convo ? `Conversation so far:\n${convo}\n` : ""}Citizen's question: ${question}`;

  try {
    const answer = await geminiGenerate({ system, user, temperature: 0.5 });
    return res.status(200).json({ answer });
  } catch (e) {
    console.error("Chat failed:", e.message);
    return res.status(502).json({ error: "AI is temporarily unavailable. Please try again." });
  }
}
