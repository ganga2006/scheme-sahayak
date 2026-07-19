/**
 * Deterministic eligibility matching engine.
 *
 * Why rules + AI (and not AI alone)?
 * Eligibility is a compliance decision — it must be reproducible and
 * explainable. The engine filters schemes against structured criteria,
 * produces human-readable reasons, and ranks by specificity so the most
 * targeted schemes surface first. The LLM then explains and guides —
 * it never decides eligibility. This keeps hallucination out of the
 * decision path.
 */
import { SCHEMES } from "./schemes.js";

/** Check a single criteria block against a profile. Returns {pass, reasons, specificity}. */
function checkCriteria(criteria, profile) {
  const reasons = [];
  let specificity = 0;

  const fail = (msg) => ({ pass: false, reasons: [msg], specificity: 0 });

  if (criteria.minAge != null) {
    specificity++;
    if (profile.age < criteria.minAge) return fail(`Minimum age is ${criteria.minAge}`);
    reasons.push(`Age ${profile.age} meets minimum ${criteria.minAge}`);
  }
  if (criteria.maxAge != null) {
    specificity++;
    if (profile.age > criteria.maxAge) return fail(`Maximum age is ${criteria.maxAge}`);
    reasons.push(`Age ${profile.age} is within limit ${criteria.maxAge}`);
  }
  if (criteria.gender) {
    specificity += 2;
    if (profile.gender !== criteria.gender) return fail(`Only for ${criteria.gender} applicants`);
    reasons.push(`Gender criterion met`);
  }
  if (criteria.maxIncome != null) {
    specificity += 2;
    if (profile.incomeAnnual > criteria.maxIncome)
      return fail(`Annual household income must be ≤ ₹${criteria.maxIncome.toLocaleString("en-IN")}`);
    reasons.push(`Income within ₹${criteria.maxIncome.toLocaleString("en-IN")} limit`);
  }
  if (criteria.occupations) {
    specificity += 3;
    if (!criteria.occupations.includes(profile.occupation))
      return fail(`Meant for: ${criteria.occupations.join(", ")}`);
    reasons.push(`Occupation "${profile.occupation}" is covered`);
  }
  if (criteria.categories) {
    specificity += 2;
    if (!criteria.categories.includes(profile.category))
      return fail(`Reserved for ${criteria.categories.join("/").toUpperCase()} categories`);
    reasons.push(`Category ${profile.category.toUpperCase()} is covered`);
  }
  if (criteria.residence) {
    specificity += 2;
    if (profile.residence !== criteria.residence) return fail(`Only for ${criteria.residence} residents`);
    reasons.push(`${criteria.residence} residence criterion met`);
  }
  if (criteria.disability) {
    specificity += 3;
    if (!profile.disability) return fail("Requires a disability certificate");
    reasons.push("Disability criterion met");
  }
  if (criteria.maritalStatus) {
    specificity += 3;
    if (profile.maritalStatus !== criteria.maritalStatus)
      return fail(`Only for ${criteria.maritalStatus} applicants`);
    reasons.push(`Marital status criterion met`);
  }
  if (criteria.motherhood) {
    specificity += 3;
    if (!profile.motherhood) return fail("For pregnant women / new mothers");
    reasons.push("Maternity criterion met");
  }
  if (criteria.girlChild) {
    specificity += 3;
    if (!profile.girlChild) return fail("Requires a daughter below 10 years");
    reasons.push("Girl-child criterion met");
  }
  if (criteria.studentOnly) {
    specificity += 3;
    if (profile.occupation !== "student") return fail("Only for students");
    reasons.push("Student criterion met");
  }
  if (criteria.anyOf) {
    specificity += 2;
    const sub = criteria.anyOf.map((c) => checkCriteria(c, profile));
    const passed = sub.find((s) => s.pass);
    if (!passed) return fail("Does not meet any of the alternative criteria");
    reasons.push(...passed.reasons);
  }

  return { pass: true, reasons, specificity };
}

/**
 * Match a citizen profile against all schemes.
 * @returns {Array<{scheme, reasons, specificity}>} sorted most-targeted first
 */
export function matchSchemes(profile, limit = 6) {
  const results = [];
  for (const scheme of SCHEMES) {
    const r = checkCriteria(scheme.criteria, profile);
    if (r.pass) results.push({ scheme, reasons: r.reasons, specificity: r.specificity });
  }
  results.sort((a, b) => b.specificity - a.specificity);
  return results.slice(0, limit);
}

/** Normalise + validate an incoming profile. Throws on invalid input. */
export function normalizeProfile(raw) {
  const p = {
    age: Number(raw.age),
    gender: String(raw.gender || "").toLowerCase(),
    state: String(raw.state || "").trim(),
    residence: String(raw.residence || "").toLowerCase(),
    occupation: String(raw.occupation || "").toLowerCase(),
    incomeAnnual: Number(raw.incomeAnnual),
    category: String(raw.category || "general").toLowerCase(),
    maritalStatus: String(raw.maritalStatus || "single").toLowerCase(),
    disability: Boolean(raw.disability),
    motherhood: Boolean(raw.motherhood),
    girlChild: Boolean(raw.girlChild)
  };
  if (!Number.isFinite(p.age) || p.age < 0 || p.age > 120) throw new Error("Invalid age");
  if (!Number.isFinite(p.incomeAnnual) || p.incomeAnnual < 0) throw new Error("Invalid income");
  if (!["male", "female", "other"].includes(p.gender)) throw new Error("Invalid gender");
  if (!["rural", "urban"].includes(p.residence)) throw new Error("Invalid residence");
  return p;
}
