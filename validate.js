const fs = require("fs");

const src = fs.readFileSync(__dirname + "/fixtures.js", "utf8");
const FIXTURES = new Function(src + "\n;return FIXTURES;")();

const ENUM = ["CRITICAL", "HIGH", "MODERATE", "LOW"];
const REQ = ["language", "severity", "incident_type", "headline", "location", "casualties", "hazards", "first_aid", "operator_actions", "clarifying_questions", "confidence_score"];

let fails = 0;
const fail = (m) => { fails++; console.log("  ✗ " + m); };

for (const f of FIXTURES) {
  console.log("→ " + f.chip);
  if (!f.input || f.input.length < 40) fail("transcript too short");
  const d = f.out;
  for (const k of REQ) if (d[k] === undefined || d[k] === null) fail("missing field: " + k);
  if (!ENUM.includes(d.severity)) fail("bad severity: " + d.severity);
  if (d.headline.split(/\s+/).length > 35) fail("headline too long: " + d.headline.split(/\s+/).length + " words");
  if (!["HIGH", "MEDIUM", "LOW"].includes(d.location.confidence)) fail("bad location confidence");
  if (!d.location.description) fail("empty location");
  if (d.hazards.length < 1 || d.hazards.length > 6) fail("hazards count " + d.hazards.length);
  if (d.first_aid.length < 3 || d.first_aid.length > 5) fail("first_aid count " + d.first_aid.length);
  if (d.operator_actions.length < 3 || d.operator_actions.length > 5) fail("operator_actions count " + d.operator_actions.length);
  if (d.clarifying_questions.length < 1 || d.clarifying_questions.length > 3) fail("questions count " + d.clarifying_questions.length);
  if (typeof d.confidence_score !== "number" || d.confidence_score < 0 || d.confidence_score > 1) fail("bad confidence");
  if (/UNKNOWN/.test(d.location.description) && d.confidence_score > 0.55) fail("confidence exceeds 0.55 cap with UNKNOWN location");
  d.first_aid.forEach((s, i) => {
    for (const k of ["step_local", "step_en", "speak_code"]) if (!s[k]) fail(`first_aid[${i}] missing ${k}`);
    if (!/^[a-z]{2,3}(-[A-Za-z0-9]+)*$/.test(s.speak_code)) fail(`first_aid[${i}] bad BCP-47: ${s.speak_code}`);
  });
  const words = (o) => String(o).split(/\s+/).length;
  d.first_aid.forEach((s, i) => { if (words(s.step_en) > 30) fail(`first_aid[${i}] step_en over 30 words`); });
  d.operator_actions.forEach((a, i) => { if (words(a) > 25) fail(`operator_actions[${i}] over 25 words`); });
  const nonAscii = [...f.input].some((c) => c.charCodeAt(0) > 127);
  if (!nonAscii) console.log("  · note: transcript is ASCII-only (English/Hinglish) — expected for this script");
  console.log("  severity=" + d.severity + " confidence=" + d.confidence_score + " steps=" + d.first_aid.length);
}

const app = fs.readFileSync(__dirname + "/app.js", "utf8");
if (!app.includes("responseSchema")) fail("app.js does not send responseSchema");
if (!app.includes("sessionStorage")) fail("app.js does not use sessionStorage for the key");
if (/AIza[A-Za-z0-9_\-]{20,}/.test(app + src + fs.readFileSync(__dirname + "/index.html", "utf8"))) fail("an API key looks committed in source");

console.log("\n" + (fails ? fails + " CHECK(S) FAILED" : "ALL CHECKS PASSED · " + FIXTURES.length + " fixtures"));
process.exit(fails ? 1 : 0);
