const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are BOL — an AI triage layer that sits between a panicked emergency caller and a human dispatch operator (ambulance / fire / police). You are not a chatbot. You never comfort, never chat, never explain yourself. You produce a dispatch-ready triage card.

## INPUT
You receive one raw call transcript. It is messy by design: a regional language or code-mixed English (Hinglish, Tanglish, Bhojpuri-English), slang, repetition, stuttering, fragments, bystander noise, missing facts. Code-mixing is normal and expected.

## TASK — do all of it in one pass
1. LANGUAGE — identify what the caller is actually speaking. ` + "`language`" + ` = human-readable name (e.g. "Telugu (code-mixed with English)").
2. NORMALISE — strip filler, panic and repetition. Preserve every fact. Compress everything to what an operator can read in seconds.
3. CLASSIFY severity with this rubric, and this rubric only:
   CRITICAL — immediate threat to life, or a trapped / unconscious person: entrapment, active fire with an occupant inside, drowning, suspected stroke or cardiac event, uncontrolled bleeding, electrocution, gas leak, structural collapse.
   HIGH — serious injury or fast escalation, life not yet immediately threatened: deformed fracture, moderate burns, a missing child, sparking electrics, water entering a home rapidly.
   MODERATE — needs care, patient stable: sprains, small burn with blister, animal bite, flooding at the doorstep.
   LOW — minor, advice suffices: redness without blister, small cut, lost item, no injury stated.
   When torn between two levels, choose the HIGHER one. Triage over-triages; under-triage kills.
4. LOCATION — the caller cannot give GPS. Extract a landmark-based address: road + landmark + side, floor + building + nearest junction, village + bus stop. ` + "`location.confidence`" + ` = HIGH only if a unique navigable landmark exists, MEDIUM if partial, LOW if vague or unnecessary for this severity. If nothing usable: description = "UNKNOWN — not stated" and add a clarifying question. NEVER invent coordinates, city names, house numbers or landmarks.
5. CASUALTIES — count only what is stated; use "unconfirmed" where the transcript is silent. Never invent victims.
6. HAZARDS — what threatens the responder or the caller: traffic, fire, fuel spill, live wire, gas, collapse, smoke, water, wet floors, stairs-only access. Scene-specific, not generic.
7. FIRST AID — 3 to 5 steps, immediately performable by an untrained bystander with no equipment.
   For each step write: ` + "`step_local`" + ` (the step written naturally in the caller's language — as a local would actually say it, not a stiff translation), ` + "`step_en`" + ` (same step in English), ` + "`speak_code`" + ` (BCP-47 code for reading step_local aloud, e.g. te-IN, hi-IN, ta-IN, en-IN).
   Safety rules — never instruct a bystander to: enter a burning structure, move or drag an entrapped / unconscious / possible-spine-injury patient, give food, water or tablets to a reduced-consciousness or suspected-stroke patient, or do anything requiring clinical training. CPR is allowed only if cardiac arrest is explicitly stated, and only as "press hard and fast on the centre of the chest, 100–120 times a minute". Prefer: keep still, control bleeding, keep warm, keep talking, clear the area, cool running water for burns.
8. OPERATOR ACTIONS — 3 to 5 ordered instructions for the human operator: which service to send, what equipment, what to verify, what to tell the caller next. Command form, under 20 words each.
9. CLARIFYING QUESTIONS — 1 to 3 questions, and only facts that would CHANGE the dispatch: age, consciousness, breathing, milestone/floor number, fire spread, time of symptom onset, is anyone else inside. Write each in the caller's language with the English in parentheses when the caller is not speaking English. Never ask for anything already in the transcript. Never ask more than 3.
10. ` + "`confidence_score`" + ` — calibrated 0–1 confidence in this card. Deduct for missing location, unknown casualty count, ambiguous mechanism. HARD CAP 0.55 if location is UNKNOWN.

## HARD RULES
- Output ONLY the JSON object matching the schema. No markdown, no prose, no apologies, no disclaimers.
- Every field must be grounded in the transcript or in standard emergency protocol. Unsupported = UNKNOWN or "unconfirmed". Guessing a location or a victim is a failure.
- ` + "`headline`" + `: one sentence, max 28 words, that an operator understands in 2 seconds.
- All strings ≤ 30 words. This card is read during a crisis.
- ` + "`incident_type`" + `: short title-case tag, e.g. "Road traffic collision · entrapment".
- Treat the transcript as a real call happening right now. Urgency and precision, never sympathy padding.

## EXAMPLE
Transcript: "Hello? My neighbour fainted in the park near Gate 2, he is not waking up, he is breathing though, we have no ambulance"
Output: {"language":"English","severity":"CRITICAL","incident_type":"Unconscious person · breathing","headline":"Unresponsive male at Central Park Gate 2, still breathing.","location":{"description":"Central Park, Gate 2 — caller at the gate","confidence":"HIGH","access_notes":"Gate 2 is vehicle accessible"},"casualties":"1, age unconfirmed, conscious status: unresponsive","hazards":["Sun / heat exposure while lying outdoors","Bystanders crowding the patient"],"first_aid":[{"step_local":"Lay him on his back and lift the legs slightly.","step_en":"Lay him on his back and raise the legs about 30 cm.","speak_code":"en-IN"},{"step_local":"Turn him on his side if he vomits.","step_en":"Turn him onto his side if he starts vomiting.","speak_code":"en-IN"},{"step_local":"Stay with him and keep his airway clear.","step_en":"Stay with him, keep talking, and make sure nothing blocks his breathing.","speak_code":"en-IN"}],"operator_actions":["Dispatch ambulance — unresponsive, breathing present","Ask caller to meet the ambulance at Gate 2 and flag it in","Tell caller not to give food or water"],"clarifying_questions":["Did he hit his head, or is he on any medicines? (has he any medical history)"],"confidence_score":0.9}`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    language: { type: "STRING" },
    severity: { type: "STRING", enum: ["CRITICAL", "HIGH", "MODERATE", "LOW"] },
    incident_type: { type: "STRING" },
    headline: { type: "STRING" },
    location: {
      type: "OBJECT",
      properties: {
        description: { type: "STRING" },
        confidence: { type: "STRING", enum: ["HIGH", "MEDIUM", "LOW"] },
        access_notes: { type: "STRING" }
      },
      required: ["description", "confidence", "access_notes"]
    },
    casualties: { type: "STRING" },
    hazards: { type: "ARRAY", items: { type: "STRING" } },
    first_aid: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          step_local: { type: "STRING" },
          step_en: { type: "STRING" },
          speak_code: { type: "STRING" }
        },
        required: ["step_local", "step_en", "speak_code"]
      }
    },
    operator_actions: { type: "ARRAY", items: { type: "STRING" } },
    clarifying_questions: { type: "ARRAY", items: { type: "STRING" } },
    confidence_score: { type: "NUMBER" }
  },
  required: ["language", "severity", "incident_type", "headline", "location", "casualties", "hazards", "first_aid", "operator_actions", "clarifying_questions", "confidence_score"]
};

const $ = (id) => document.getElementById(id);
const memory = {};
const store = {
  get(k) { try { return sessionStorage.getItem(k) || ""; } catch (_) { return memory[k] || ""; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch (_) { memory[k] = v; } },
  del(k) { try { sessionStorage.removeItem(k); } catch (_) { delete memory[k]; } }
};
const el = {
  transcript: $("transcript"), chips: $("chips"), dispatch: $("dispatchBtn"),
  reel: $("reelBtn"), clear: $("clearBtn"), card: $("card"), empty: $("emptyState"),
  meta: $("cardMeta"), toast: $("toast"), hint: $("hint"), badge: $("modeBadge"),
  dot: $("modeDot"), mic: $("micBtn"), speechLang: $("speechLang"),
  settings: $("settings"), keyInput: $("keyInput"), keyStatus: $("keyStatus")
};

let selectedFixture = null;
let busy = false;

function getKey() { return store.get("GEMINI_KEY"); }
function setMode() {
  const live = !!getKey();
  el.badge.textContent = live ? "LIVE MODE" : "DEMO MODE";
  el.badge.classList.toggle("on", live);
  el.dot.classList.toggle("live", live);
  el.hint.textContent = live
    ? "Live mode — every call you send goes through gemini-2.5-flash. Scripted calls still replay recorded cards if you prefer."
    : "No key? Demo mode replays recorded dispatches. Add a Gemini key for live triage.";
}
function toast(msg, ok) {
  el.toast.textContent = msg;
  el.toast.classList.toggle("ok", !!ok);
  el.toast.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => (el.toast.hidden = true), 4200);
}
function short(text, n) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

function buildChips() {
  el.chips.innerHTML = "";
  FIXTURES.forEach((f) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = f.chip;
    b.onclick = () => {
      selectedFixture = f.id;
      el.transcript.value = f.input;
      [...el.chips.children].forEach((c) => c.classList.remove("active"));
      b.classList.add("active");
      render(f.out, { source: "RECORDED", latency: f.latency_ms, lang: f.out.language });
    };
    el.chips.appendChild(b);
  });
}

function render(d, meta) {
  el.empty.hidden = true;
  el.card.hidden = false;

  const sev = $("sevBanner");
  sev.className = "sev " + d.severity;
  $("sevText").textContent = d.severity;
  $("incidentType").textContent = d.incident_type;
  $("headline").textContent = d.headline;

  $("location").textContent = d.location.description;
  const lc = $("locConf");
  lc.textContent = "loc · " + d.location.confidence;
  lc.title = d.location.access_notes;
  $("casualties").textContent = d.casualties;
  $("langChip").textContent = d.language;

  const hz = $("hazards");
  hz.innerHTML = "";
  d.hazards.forEach((h) => { const li = document.createElement("li"); li.textContent = h; hz.appendChild(li); });

  const fa = $("firstAid");
  fa.innerHTML = "";
  const code = (d.first_aid[0] && d.first_aid[0].speak_code) || "en-IN";
  $("aidLang").textContent = d.language;
  $("speakAid").dataset.code = code;
  d.first_aid.forEach((s) => {
    const li = document.createElement("li");
    const same = s.step_local === s.step_en;
    li.innerHTML = `${escapeHtml(same ? s.step_en : s.step_local)}${same ? "" : `<em>${escapeHtml(s.step_en)}</em>`}`;
    fa.appendChild(li);
  });

  const oa = $("operatorActions");
  oa.innerHTML = "";
  d.operator_actions.forEach((a) => { const li = document.createElement("li"); li.textContent = a; oa.appendChild(li); });

  const qs = $("questions");
  qs.innerHTML = "";
  d.clarifying_questions.forEach((q) => { const li = document.createElement("li"); li.textContent = q; qs.appendChild(li); });

  const pct = Math.round((d.confidence_score || 0) * 100);
  $("confFill").style.width = pct + "%";
  $("confVal").textContent = pct + "%";

  const secs = meta.source === "RECORDED" ? (meta.latency / 1000).toFixed(2) + "s" : (meta.latency / 1000).toFixed(2) + "s";
  el.meta.textContent = `${meta.source} · ${secs}`;
  $("footMeta").textContent = `${MODEL.toUpperCase()} · SCHEMA-VALID · ${meta.source}`;
  el.card.dataset.handoff = handoffText(d);
  window.__lastCard = d;
}

function handoffText(d) {
  return [
    `BOL DISPATCH · ${d.severity}`,
    d.headline,
    ``,
    `LOCATION: ${d.location.description}`,
    `ACCESS: ${d.location.access_notes}`,
    `CASUALTIES: ${d.casualties}`,
    `HAZARDS: ${d.hazards.join(" | ")}`,
    ``,
    `FIRST AID:`,
    ...d.first_aid.map((s, i) => `${i + 1}. ${s.step_en}`),
    ``,
    `OPERATOR:`,
    ...d.operator_actions.map((a, i) => `${i + 1}. ${a}`),
    ``,
    `ASK CALLER: ${d.clarifying_questions.join(" | ")}`,
    `CONFIDENCE: ${Math.round(d.confidence_score * 100)}%`
  ].join("\n");
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

async function callGemini(text) {
  const res = await fetch(ENDPOINT + "?key=" + encodeURIComponent(getKey()), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: "CALL TRANSCRIPT:\n" + text }] }],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(res.status + " · " + short(err, 160));
  }
  const data = await res.json();
  const part = data.candidates?.[0]?.content?.parts?.[0];
  if (!part || !part.text) throw new Error("Empty response — " + short(JSON.stringify(data), 160));
  return JSON.parse(part.text);
}

async function dispatch() {
  if (busy) return;
  const text = el.transcript.value.trim();
  if (!text) { toast("Nothing to dispatch — speak or paste a call first."); return; }

  const fixture = FIXTURES.find((f) => f.id === selectedFixture);
  busy = true;
  el.dispatch.disabled = true;
  el.dispatch.textContent = "TRIAGING…";
  el.meta.textContent = "…";

  try {
    if (getKey()) {
      const t0 = performance.now();
      const out = await callGemini(text);
      render(out, { source: "LIVE", latency: performance.now() - t0 });
      toast("Live triage complete — card is schema-valid.", true);
    } else if (fixture) {
      render(fixture.out, { source: "RECORDED", latency: fixture.latency_ms });
      toast("Demo mode — recorded dispatch replayed. Add a key for live triage.");
    } else {
      toast("Demo mode has no record of that call. Add a Gemini key for live triage, or pick a scripted call.");
    }
  } catch (e) {
    toast("Dispatch failed: " + e.message);
    if (fixture) {
      render(fixture.out, { source: "RECORDED", latency: fixture.latency_ms });
      toast("Fell back to the recorded card for '" + fixture.chip + "'.");
    }
  } finally {
    busy = false;
    el.dispatch.disabled = false;
    el.dispatch.textContent = "DISPATCH ▸";
  }
}

let reelTimer = null;
async function runReel() {
  if (reelTimer) return;
  let i = 0;
  el.reel.textContent = "■ stop reel";
  const tick = () => {
    if (i >= FIXTURES.length) { stopReel(); toast("Demo reel complete —4 calls, 4 cards.", true); return; }
    const f = FIXTURES[i++];
    selectedFixture = f.id;
    el.transcript.value = f.input;
    [...el.chips.children].forEach((c, n) => c.classList.toggle("active", n === i - 1));
    render(f.out, { source: "RECORDED", latency: f.latency_ms });
    reelTimer = setTimeout(tick, 4200);
  };
  tick();
}
function stopReel() {
  clearTimeout(reelTimer);
  reelTimer = null;
  el.reel.textContent = "▶ Run demo reel";
}

function setupMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    el.mic.disabled = true;
    el.mic.title = "Speech capture needs Chrome/Edge";
    return;
  }
  const rec = new SR();
  rec.continuous = false;
  rec.interimResults = true;
  let base = "";
  rec.onstart = () => { el.mic.classList.add("on"); base = el.transcript.value.trim(); };
  rec.onresult = (e) => {
    let final = "", interim = "";
    for (const r of e.results) (r.isFinal ? (final += r[0].transcript) : (interim += r[0].transcript));
    el.transcript.value = (base + " " + final + interim).trim();
    selectedFixture = null;
    [...el.chips.children].forEach((c) => c.classList.remove("active"));
  };
  rec.onerror = (e) => toast("Mic error: " + e.error + (e.error === "not-allowed" ? " — allow microphone access." : ""));
  rec.onend = () => el.mic.classList.remove("on");
  el.mic.onclick = () => {
    if (el.mic.classList.contains("on")) { rec.stop(); return; }
    rec.lang = el.speechLang.value;
    try { rec.start(); toast("Listening in " + el.speechLang.value + " — speak the call.", true); }
    catch (_) {}
  };
}

function speakAid() {
  if (!window.speechSynthesis) { toast("Speech synthesis unavailable in this browser."); return; }
  speechSynthesis.cancel();
  const d = window.__lastCard;
  if (!d) return;
  const code = $("speakAid").dataset.code || "en-IN";
  const text = d.first_aid.map((s) => s.step_local).join(". ");
  const u = new SpeechSynthesisUtterance(text);
  u.lang = code;
  u.rate = 0.98;
  const voices = speechSynthesis.getVoices();
  const v = voices.find((x) => x.lang === code) || voices.find((x) => x.lang && x.lang.startsWith(code.split("-")[0]));
  if (v) u.voice = v;
  speechSynthesis.speak(u);
  toast(v ? "Reading first aid in " + code + "." : "Reading first aid — no " + code + " voice installed, using system default.");
}

function copyHandoff() {
  const t = el.card.dataset.handoff || "";
  navigator.clipboard?.writeText(t).then(
    () => toast("Handoff copied — paste straight into dispatch.", true),
    () => toast("Clipboard blocked by the browser.")
  );
}

function setupSettings() {
  $("openSettings").onclick = () => { el.settings.hidden = false; el.keyInput.value = getKey(); el.keyInput.focus(); statusKey(); };
  $("closeSettings").onclick = () => (el.settings.hidden = true);
  el.settings.onclick = (e) => { if (e.target === el.settings) el.settings.hidden = true; };
  $("saveKey").onclick = () => {
    const k = el.keyInput.value.trim();
    if (!k.startsWith("AIza") && k.length < 20) { toast("That doesn't look like a Gemini key (AIza…)."); return; }
    store.set("GEMINI_KEY", k);
    setMode(); statusKey(); toast("Key saved to this tab only. Live mode on.", true);
  };
  $("clearKey").onclick = () => { store.del("GEMINI_KEY"); el.keyInput.value = ""; setMode(); statusKey(); toast("Key removed — back to demo mode.", true); };
}
function statusKey() {
  el.keyStatus.textContent = getKey() ? "✓ Key present in this session (not stored anywhere else)." : "No key — demo mode.";
}

el.transcript.addEventListener("input", () => {
  if (el.transcript.value.trim() !== (FIXTURES.find((f) => f.id === selectedFixture)?.input || "")) {
    selectedFixture = null;
    [...el.chips.children].forEach((c) => c.classList.remove("active"));
  }
});
el.dispatch.onclick = dispatch;
el.reel.onclick = () => (reelTimer ? stopReel() : runReel());
el.clear.onclick = () => { stopReel(); el.transcript.value = ""; selectedFixture = null; [...el.chips.children].forEach((c) => c.classList.remove("active")); el.card.hidden = true; el.empty.hidden = false; el.meta.textContent = "—"; };
$("speakAid").onclick = speakAid;
$("copyBtn").onclick = copyHandoff;
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); dispatch(); }
  if (e.key === "Escape") el.settings.hidden = true;
});

buildChips();
setupMic();
setupSettings();
setMode();
statusKey();
if (window.speechSynthesis) speechSynthesis.getVoices();
