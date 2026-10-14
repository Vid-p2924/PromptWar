const FIXTURES = [
  {
    id: "accident",
    chip: "🚚 Road accident · Telugu",
    input: "అన్నా! అన్నా! Rayalaseema highway daggara — RTC bus stop daggara lorry bike ni kodindi! Oka abbayi kinda trap ayyadu, raktham chala vastondi! Nenu em cheyyalo artham kavatledu, please!",
    latency_ms: 1840,
    out: {
      language: "Telugu (code-mixed with English)",
      severity: "CRITICAL",
      incident_type: "Road traffic collision · entrapment",
      headline: "Motorcycle rider pinned beneath a lorry on Rayalaseema Highway near the RTC bus stop — active bleeding, 1 entrapped.",
      location: {
        description: "Rayalaseema Highway, at/next to the RTC bus stop; caller standing at the stop. No milestone number given.",
        confidence: "MEDIUM",
        access_notes: "Approach from the RTC bus stop side. Lorry is blocking one lane — approach vehicles should be warned."
      },
      casualties: "1 entrapped (rider), condition unconfirmed. Possible second party — unconfirmed.",
      hazards: ["Traffic passing the scene with no diversion", "Fuel spill / fire risk from the bike", "Do not pull the victim — spinal injury possible"],
      first_aid: [
        { step_local: "బాధితుడిని లాగవద్దు, కదలిక ఆపవద్దు — వెన్నెముక గాయం ఉండవచ్చు.", step_en: "Do not pull or drag the victim — spinal injury is possible. Keep them still.", speak_code: "te-IN" },
        { step_local: "శుభ్రమైన గుడ్డుతో గాయంపై గట్టిగా నొక్కి పట్టుకోండి.", step_en: "Press a clean cloth firmly against any bleeding wound and hold it there.", speak_code: "te-IN" },
        { step_local: "చుట్టూ ఉన్నవారిని వెనక్కి పంపండి, వాహనాలను ఆపండి.", step_en: "Move onlookers back and stop traffic around the scene.", speak_code: "te-IN" },
        { step_local: "బాధితుడితో మాట్లాడుతూ ఉండండి — మెల్లగా మాట్లాడుతూ మేల్కొని ఉంచండి.", step_en: "Keep talking to the victim and keep them awake.", speak_code: "te-IN" }
      ],
      operator_actions: [
        "Dispatch ambulance with trauma team — entrapment confirmed",
        "Alert fire/rescue for hydraulic cutter to lift the lorry edge",
        "Ask caller for the nearest milestone (km stone) number to pin the location",
        "Send SMS location link to the caller for live tracking"
      ],
      clarifying_questions: [
        "బాధితుడు మేల్కొని ఉన్నాడా? శ్వాస తీసుకుంటున్నాడా? (Is he conscious and breathing?)",
        "సమీపంలో కిలోమీటరు రాయి సంఖ్య ఏమిటి? (What is the nearest milestone number?)"
      ],
      confidence_score: 0.92
    }
  },
  {
    id: "fire",
    chip: "🔥 House fire · Hindi",
    input: "Bhaisaab! Hamare ghar mein aag lag gayi — Shanti Nagar, gali number 4! Andar bachcha phasa hai, 4 saal ka! Darwaza andar se band hai, dhuans bahut aa rahi hai, hum log bahar hain!",
    latency_ms: 1620,
    out: {
      language: "Hindi (with English code-mix)",
      severity: "CRITICAL",
      incident_type: "Structure fire · occupant trapped",
      headline: "Ground-floor house on fire in Shanti Nagar Gali No. 4 with a 4-year-old child trapped inside — door jammed, heavy smoke.",
      location: {
        description: "Shanti Nagar, Gali No. 4, ground-floor house; caller is standing outside the gate. City not stated.",
        confidence: "MEDIUM",
        access_notes: "Narrow gali — fire tender may not reach the door directly; approach from the main road end."
      },
      casualties: "1 child (approx. 4 yrs) inside, unconfirmed. Caller + others outside, safe.",
      hazards: ["Heavy smoke — toxic inhalation risk", "Fire spreading to adjacent connected houses", "Possible LPG cylinder in the kitchen"],
      first_aid: [
        { step_local: "Jale hue ghar ke andar kabhi mat jaana — sirf smoke se bhi jaan ja sakti hai.", step_en: "Never enter the burning building — smoke alone can be fatal.", speak_code: "hi-IN" },
        { step_local: "Bahar se bachche ko awaaz dete raho, uska naam bulaao — par andar mat jaao.", step_en: "Keep calling the child's name from outside — but do not go in.", speak_code: "hi-IN" },
        { step_local: "Agar aas paas ka dhuaan kam hai to geele kapde se naak-muh dhak lo.", step_en: "If you must stay near smoke, cover nose and mouth with a wet cloth.", speak_code: "hi-IN" },
        { step_local: "Ghar ke darwaze band kar do — aag aur dhuaan ruk jaayega.", step_en: "Close internal doors behind you — this slows the fire and smoke.", speak_code: "hi-IN" },
        { step_local: "Paas ke logon ko hataao, CNG cylinder aur bijli ka main band karwao.", step_en: "Clear bystanders away and have the gas/electricity supply shut off.", speak_code: "hi-IN" }
      ],
      operator_actions: [
        "Dispatch fire tender + ambulance (child trapped, possible inhalation)",
        "Instruct caller: do not let anyone re-enter, keep the gali clear for the tender",
        "Confirm exact house colour/number with caller while en route",
        "Alert nearest fire station for a second unit if the gali is narrow"
      ],
      clarifying_questions: [
        "Aag kitni tez hai — kya chhat tak pahunch gayi? (How far has the fire spread?)",
        "Bachcha kamre mein hai ya kitchen mein? (Is the child in the room or the kitchen?)"
      ],
      confidence_score: 0.89
    }
  },
  {
    id: "stroke",
    chip: "🧠 Suspected stroke · English",
    input: "Hello? My father fell in the bathroom — he can't move his left side and his words are coming out funny. We're on the 3rd floor, Sai Residency, opposite the RTC bus stand — the lift is not working!",
    latency_ms: 1510,
    out: {
      language: "English (Indian)",
      severity: "CRITICAL",
      incident_type: "Suspected stroke with fall",
      headline: "Elderly male, left-side weakness and slurred speech after a bathroom fall — 3rd floor, lift out of service.",
      location: {
        description: "Sai Residency, 3rd floor, opposite RTC bus stand; caller is with the patient.",
        confidence: "HIGH",
        access_notes: "Lift out of service — team must carry by stairs. Confirm building colour/number on arrival."
      },
      casualties: "1 (elderly male), conscious, unconfirmed age.",
      hazards: ["Stairs only, 3rd floor — stretcher carry required", "Possible head injury from the fall", "Wet bathroom floor — slip risk"],
      first_aid: [
        { step_local: "Keep him still, on his back, with the head slightly raised. Do not move him.", step_en: "Keep him still on his back with the head slightly raised — do not move him.", speak_code: "en-IN" },
        { step_local: "Do not give food, water or any tablet.", step_en: "Do not give food, water or any tablet — he may not be able to swallow.", speak_code: "en-IN" },
        { step_local: "Note the exact time symptoms started — every minute of treatment counts.", step_en: "Note the exact time symptoms started — stroke treatment is time-critical.", speak_code: "en-IN" },
        { step_local: "Loosen tight clothing and keep him calm and talking.", step_en: "Loosen tight clothing, keep him calm and keep him talking.", speak_code: "en-IN" },
        { step_local: "Unlock the main door and clear the stairs for the stretcher.", step_en: "Unlock the main door and clear the staircase for the stretcher team.", speak_code: "en-IN" }
      ],
      operator_actions: [
        "Dispatch advanced ambulance — stroke protocol, time-critical",
        "Send a message en route: confirmed time of symptom onset is essential for thrombolysis",
        "Ask caller to send a photo of the building name board for navigation",
        "Pre-alert the receiving hospital's stroke desk"
      ],
      clarifying_questions: [
        "Kab se yeh ho raha hai — exact time yaad hai? (What exact time did the weakness start?)",
        "Kya woh bol pa rahe hain aur saans theek se le rahe hain? (Is he speaking and breathing normally?)"
      ],
      confidence_score: 0.94
    }
  },
  {
    id: "burn",
    chip: "🩹 Kitchen burn · low severity",
    input: "Hi, main kitchen mein tha, thoda tel chhidka aur forearm pe laal pad gaya hai — blister nahi hai, sirf jalan ho rahi hai. Bandha hua ghar hai, main khud handle kar sakta hoon, bas bata do kya karun.",
    latency_ms: 1190,
    out: {
      language: "Hinglish (Hindi + English)",
      severity: "LOW",
      incident_type: "Minor superficial burn",
      headline: "Oil splatter burn on the forearm — redness only, no blister, caller conscious and stable; advice needed.",
      location: {
        description: "Caller's own kitchen, residence not stated — location not required for this severity.",
        confidence: "LOW",
        access_notes: "No unit required. Follow-up call recommended."
      },
      casualties: "1, ambulatory, no injury beyond superficial redness.",
      hazards: ["Burned area may blister if not cooled", "Caller is alone at home"],
      first_aid: [
        { step_local: "Kam se kam 10 minute thande chalne paani mein haath rakho — barf nahi.", step_en: "Hold the forearm under cool running water for at least 10 minutes — not ice.", speak_code: "hi-IN" },
        { step_local: "Safed kapda ya dressing dheere se rakh lo, masalo mat.", step_en: "Cover loosely with a clean cloth or dressing — do not rub it.", speak_code: "hi-IN" },
        { step_local: "Phata, tel, ghee ya toothpaste kabhi mat lagao.", step_en: "Never apply oil, ghee or toothpaste to a burn.", speak_code: "hi-IN" },
        { step_local: "Agar phooli pad jaye ya dard badh jaye to doctor ko dikhao.", step_en: "See a doctor if a blister forms or the pain increases.", speak_code: "hi-IN" }
      ],
      operator_actions: [
        "No dispatch — record as self-care, send SMS first-aid guide to the caller",
        "Schedule a callback in 30 minutes to confirm no blistering",
        "Escalate to a nurse line only if the caller reports blistering or spreading redness"
      ],
      clarifying_questions: [
        "Kya phooli ban rahi hai ya laalat badh rahi hai? (Is it blistering or spreading?)",
        "Kya koi aur ghar par hai jo madad kar sake? (Is anyone else at home who can help?)"
      ],
      confidence_score: 0.88
    }
  }
];
