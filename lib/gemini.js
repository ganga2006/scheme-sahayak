/**
 * Thin wrapper over the Gemini REST API (no SDK dependency — keeps the
 * serverless bundle tiny and cold starts fast).
 */
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export async function geminiGenerate({ system, user, json = false, temperature = 0.4 }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");

  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: 4096,
      ...(json ? { responseMimeType: "application/json" } : {})
    }
  };

  const res = await fetch(`${BASE}/${MODEL}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

/** Parse JSON out of a model response, tolerating stray code fences. */
export function parseModelJson(text) {
  const cleaned = text.replace(/^```(json)?/m, "").replace(/```\s*$/m, "").trim();
  return JSON.parse(cleaned);
}
