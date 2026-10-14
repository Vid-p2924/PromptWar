# BOL — Multilingual AI Triage for Emergency Dispatch

> **BOL turns a panicked, multilingual emergency call into a dispatch-ready triage card in under 3 seconds — so no one dies because information got lost in translation.**

*PromptWar · Emergency Response track · solo entry*

---

## The problem

When someone calls a helpline, the operator needs exactly four facts, fast:

1. **What happened?**
2. **How bad is it?**
3. **Where — exactly?**
4. **Is anyone trapped or hurt?**

In India, the caller often speaks Telugu, Tulu, Bhojpuru or Tanglish. The operator speaks Hindi or English. The caller is crying, talking over bystanders, describing what they can see ("near the big banyan tree"). The operator asks the same question twice. Translation eats the clock. The location stays vague. The ambulance goes to the wrong spot or waits for a second call.

Existing tools assume a calm person typing precise text into a well-designed app. **Emergences have none of those things.**

> ### People don't die because ambulances are slow.
> ### They die because information is lost between the caller and the responder.

Nobody is at fault — the caller can't help being panicked and unilingual, the operator can't speak 121 languages, and every app in this space was built for a smartphone user with good GPS. That gap is where BOL works.

---

## How BOL answers the challenge

| Challenge criterion | Where BOL delivers |
|---|---|
| Real-world problem | Emergency calls lost in translation — measurable, life-or-death, overlooked |
| AI / intelligent automation | One engineered Gemini triage prompt + strict JSON schema, not a chatbot |
| Impact on everyday life | First 60 seconds of every emergency call, across 11 languages |
| Accessibility & inclusive communities | First aid read aloud in the caller's own language; works without a smartphone app |
| Public safety & emergency response | Dispatch-ready handoff card for ambulance / fire / police operators |
| Responsible AI | Over-triage rubric, no invented locations or victims, confidence caps, bystander safety rules |

## What BOL does

Listens to the raw call → extracts a structured triage card → hands it to the operator, and reads first aid back **in the caller's own language**.

```
┌─ CRITICAL ──────────────────────────── Road traffic collision · entrapment ─┐
│ Motorcycle rider pinned beneath a lorry on Rayalaseema Highway near the     │
│ RTC bus stop — active bleeding, 1 entrapped.                                │
│                                                                             │
│ LOCATION    Rayalaseema Hwy, next to RTC bus stop · MEDIUM                  │
│             Approach from the bus stop side; lorry blocks one lane          │
│ CASUALTIES  1 entrapped (rider), condition unconfirmed                      │
│ HAZARDS     [traffic] [fuel spill] [do not pull the victim]                 │
│                                                                             │
│ FIRST AID · తెలుగు        ▶ read aloud in caller's language              │
│   1. బాధితుడిని లాగవద్దు…   Do not pull or drag — spine injury possible     │
│   2. శుభ్రమైన గుడ్డుతో…      Press a clean cloth firmly on the wound        │
│                                                                             │
│ OPERATOR HANDOFF                                                       ⧉ copy│
│   1. Dispatch ambulance with trauma team — entrapment confirmed             │
│   2. Alert fire/rescue for hydraulic cutter                                 │
│   3. Ask caller for the nearest milestone number                           │
│                                                                             │
│ ASK THE CALLER   ? Is he conscious and breathing?                           │
│ CONFIDENCE ▓▓▓▓▓▓▓▓▓▓▓▓░░ 92%                 1.84s · SCHEMA-VALID · LIVE │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Run it in 60 seconds

```bash
git clone <your-repo-url>
cd bol
python3 -m http.server 8080     # or just open index.html
```

- Press **▶ Run demo reel** → four scripted calls render four dispatch cards. **No API key needed.**
- Press **●** and speak → live browser transcription, any of 11 languages.
- Add a free Gemini key (⚙ API key) → every call gets real live triage. Key lives in `sessionStorage` only.
- `Ctrl/Cmd + Enter` dispatches from anywhere.

---

## How it works

| Stage | What happens |
|---|---|
| **Hear** | Web Speech API captures the call, or a raw transcript is pasted. No app, no account, no GPS. |
| **Understand** | `gemini-2.5-flash` runs one engineered triage prompt: language ID → normalisation → severity rubric → landmark geolocation → hazard extraction → first aid → operator actions. |
| **Structure** | Strict JSON `responseSchema` output. No free text, no hallucinated coordinates — every field is grounded in the transcript or marked `UNKNOWN`. |
| **Act** | Card renders for the operator, first aid reads aloud in the caller's language via `speechSynthesis`, handoff copies straight into dispatch. |

Zero backend. Zero committed secrets. One prompt, one schema, one page.

---

## The prompt is the product

The full system prompt lives in **[`app.js:4`](app.js#L4)**; the response schema in **[`app.js:40`](app.js#L40)**. Design decisions inside it:

- **Over-triage rule** — *"when torn between two levels, choose the HIGHER one."* Under-triage kills; over-triage costs a siren.
- **Severity rubric, explicit** — CRITICAL/HIGH/MODERATE/LOW defined by threat-to-life, not vibes.
- **Landmark geolocation, never invented coordinates** — confidence `HIGH` only for a unique navigable landmark; `UNKNOWN` caps the whole card's confidence at `0.55`.
- **Bilingual first aid** — every step ships as `step_local` + `step_en` + `speak_code` (BCP-47) so it can be *spoken back to the caller* in their own tongue.
- **Clarifying questions that change dispatch** — max 3, never asking for anything already in the transcript.
- **Safety rail in the prompt** — the model is forbidden from telling a bystander to enter a burning building, move an entrapped patient, or feed a suspected-stroke patient.
- **One compact few-shot** — anchors format without inflating latency.

Garbage-in tolerance is the point: the input is code-mixed, fragmented and panicked *on purpose*.

---

## Guardrails

- API key is entered by the user, stored in `sessionStorage`, and **never committed** — `.gitignore` blocks `.env*` and `*.key`.
- Only transcript text goes to Google's API. No location, no identity, no storage.
- Demo mode works with **no key at all**, so the repo can be judged without any secrets or setup.

---

## Built with

`gemini-2.5-flash` · structured output (`responseSchema`) · Web Speech API · `speechSynthesis` · vanilla HTML/CSS/JS — no framework, no build step, no server.

---

## Roadmap (deliberately cut for a 2-hour build)

- Real GPS + reverse geocoding from the caller's device (currently landmark text)
- SMS fallback mode for feature phones with no data connection
- Multi-agent pipeline (normaliser → triage → geocoder) for parallel latency
- Two-way voice: BOL talks the caller through first aid while the operator is en route
- Integration layer for existing 108 / 112 / 112-IVR call centres

---

## Verify

```bash
node validate.js
```

Schema-validates all four recorded dispatch cards (severity enums, field caps, BCP-47 codes, the 0.55 UNKNOWN-location confidence cap) and scans the source for committed API keys. Exits non-zero on any failure.

---

## License

MIT
