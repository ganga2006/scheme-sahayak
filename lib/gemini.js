/**
 * Thin wrapper over the Gemini REST API (no SDK dependency — keeps the
 * serverless bundle tiny and cold starts fast).
 */
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
// Separate free-tier quota bucket (higher limits) — used when the primary model is rate-limited.
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-flash-lite-latest";
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function geminiGenerate({ system, user, json = false, temperature = 0.4 }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");

  const body = JSON.stringify({
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: 8192,
      ...(json ? { responseMimeType: "application/json" } : {})
    }
  });

  const models = MODEL === FALLBACK_MODEL ? [MODEL] : [MODEL, FALLBACK_MODEL];
  let lastError;

  for (const model of models) {
    // Up to 2 attempts per model; brief pause before the retry (helps with per-minute limits).
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) await sleep(1500);

      const res = await fetch(`${BASE}/${model}:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
        if (text) return text;
        lastError = new Error(`Empty response from Gemini (${model})`);
        break; // empty output — try the fallback model rather than retrying
      }

      const errText = await res.text();
      lastError = new Error(`Gemini API error ${res.status} (${model}): ${errText.slice(0, 300)}`);

      if (res.status === 429) continue;      // rate-limited: retry, then fallback model
      if (res.status === 404) break;         // unknown model: skip straight to fallback
      throw lastError;                       // 400/401/403 etc: key/request problem — fallback won't help
    }
  }

  throw lastError;
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
