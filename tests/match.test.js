/** Unit tests for the eligibility engine. Run: npm test */
import { matchSchemes, normalizeProfile } from "../lib/match.js";
import assert from "node:assert";

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`✓ ${name}`);
}

const ids = (r) => r.map((x) => x.scheme.id);

test("Rural woman farmer, low income → PM-KISAN, Ujjwala, PMAY-G, PM-JAY", () => {
  const p = normalizeProfile({ age: 35, gender: "female", state: "Telangana", residence: "rural", occupation: "farmer", incomeAnnual: 120000, category: "obc", maritalStatus: "married" });
  const r = ids(matchSchemes(p, 20));
  for (const s of ["pm-kisan", "ujjwala", "pmay-g", "pm-jay", "pmfby", "kcc"]) assert(r.includes(s), `missing ${s}`);
  assert(!r.includes("svanidhi"), "street vendor scheme should not match a farmer");
});

test("Widow, 45, rural, BPL → widow pension matches and ranks high", () => {
  const p = normalizeProfile({ age: 45, gender: "female", state: "Bihar", residence: "rural", occupation: "homemaker", incomeAnnual: 60000, category: "general", maritalStatus: "widowed" });
  const r = matchSchemes(p);
  assert(ids(r).includes("ignwps"));
  assert.strictEqual(ids(r)[0], "ignwps", "widow pension should rank first (most specific)");
});

test("Urban street vendor → SVANidhi + Mudra, not PM-KISAN", () => {
  const p = normalizeProfile({ age: 30, gender: "male", state: "Maharashtra", residence: "urban", occupation: "street-vendor", incomeAnnual: 150000, category: "general", maritalStatus: "married" });
  const r = ids(matchSchemes(p, 20));
  assert(r.includes("svanidhi") && r.includes("mudra"));
  assert(!r.includes("pm-kisan") && !r.includes("pmay-g"));
});

test("SC student, low income → post-matric scholarship + Stand-Up India", () => {
  const p = normalizeProfile({ age: 19, gender: "male", state: "Andhra Pradesh", residence: "rural", occupation: "student", incomeAnnual: 90000, category: "sc", maritalStatus: "single" });
  const r = ids(matchSchemes(p, 20));
  assert(r.includes("nsp-postmatric") && r.includes("standup") && r.includes("pmkvy"));
});

test("Senior citizen 65, BPL → old age pension; not APY (max 40)", () => {
  const p = normalizeProfile({ age: 65, gender: "male", state: "Odisha", residence: "rural", occupation: "farmer", incomeAnnual: 80000, category: "general", maritalStatus: "married" });
  const r = ids(matchSchemes(p, 20));
  assert(r.includes("ignoaps"));
  assert(!r.includes("apy"), "APY has max entry age 40");
  assert(!r.includes("pmjjby"), "PMJJBY max age 50");
});

test("High income salaried professional → no BPL schemes", () => {
  const p = normalizeProfile({ age: 32, gender: "male", state: "Karnataka", residence: "urban", occupation: "salaried", incomeAnnual: 1500000, category: "general", maritalStatus: "single" });
  const r = ids(matchSchemes(p, 20));
  assert(!r.includes("pm-jay") && !r.includes("ujjwala") && !r.includes("pmay-u"));
  assert(r.includes("pmsby"), "universal accident insurance should still match");
});

test("Pregnant woman with daughter under 10 → PMMVY + Sukanya", () => {
  const p = normalizeProfile({ age: 26, gender: "female", state: "Uttar Pradesh", residence: "rural", occupation: "homemaker", incomeAnnual: 100000, category: "obc", maritalStatus: "married", motherhood: true, girlChild: true });
  const r = ids(matchSchemes(p, 20));
  assert(r.includes("pmmvy") && r.includes("sukanya"));
});

test("Disabled adult, BPL → disability pension", () => {
  const p = normalizeProfile({ age: 40, gender: "male", state: "Rajasthan", residence: "rural", occupation: "unemployed", incomeAnnual: 50000, category: "general", maritalStatus: "single", disability: true });
  const r = matchSchemes(p);
  assert.strictEqual(ids(r)[0], "igndps", "disability pension should rank first");
});

test("Invalid profile rejected", () => {
  assert.throws(() => normalizeProfile({ age: -5, gender: "female", residence: "rural", incomeAnnual: 0 }));
  assert.throws(() => normalizeProfile({ age: 30, gender: "x", residence: "rural", incomeAnnual: 0 }));
});

console.log(`\n${passed} tests passed ✅`);
