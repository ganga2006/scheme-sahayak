/**
 * Thin wrapper over the Gemini REST API (no SDK dependency — keeps the
 * serverless bundle tiny and cold starts fast).
 */
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export async function geminiGenerate({ system, user, json = false, temperature = 0.4 }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");

  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: 8192,
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

/**
 * Parse JSON out of a model response.
 * Tolerates code fences AND truncated output (models sometimes get cut off
 * mid-JSON): we trim back to the last structural boundary and append the
 * missing closing brackets until it parses.
 */
export function parseModelJson(text) {
  const cleaned = text.replace(/^```(json)?/m, "").replace(/```\s*$/m, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return repairJson(cleaned);
  }
}

/** Compute the closing brackets needed to balance a JSON prefix, or null if it can't be balanced. */
function closersFor(s) {
  const stack = [];
  let inStr = false, esc = false;
  for (const ch of s) {
    if (esc) { esc = false; continue; }
    if (inStr) {
      if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") {
      if (stack.pop() !== ch) return null;
    }
  }
  return inStr ? null : stack.reverse().join("");
}

function repairJson(text) {
  // Walk backwards to each structural boundary and try to close + parse.
  for (let end = text.length; end > 0; end--) {
    const ch = text[end - 1];
    if (ch !== "}" && ch !== "]" && ch !== '"') continue;
    const slice = text.slice(0, end);
    const suffix = closersFor(slice);
    if (suffix === null) continue;
    try {
      return JSON.parse(slice + suffix);
    } catch { /* keep walking back */ }
  }
  throw new Error("Model returned unrepairable JSON");
}
