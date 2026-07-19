# Demo Video Script (2:30) — record with screen + voice

Use OBS, Loom, or Windows Game Bar (Win+Alt+R). One take is fine. Speak naturally.

**[0:00–0:20] The problem** *(show myscheme.gov.in briefly, then your app's landing page)*
"India has hundreds of welfare schemes, but crores of eligible citizens never claim them — the rules are complex, the portals are in English, and nobody tells you which schemes are YOURS. I built Scheme Sahayak to fix exactly that."

**[0:20–0:35] Language-first** *(click తెలుగు or हिंदी on landing page)*
"It starts with language — English, Hindi, or Telugu. The entire experience, including the AI guidance, comes in the citizen's own language."

**[0:35–1:00] The 1-minute profile** *(fill form: age 45, female, Telangana, rural, homemaker, income 60000, widowed)*
"Eleven simple questions. No login, nothing stored. Let's take a real case: a 45-year-old widowed homemaker in a Telangana village, household income sixty thousand a year."

**[1:00–1:40] Results — the core** *(results load; scroll slowly)*
"Here's the key design decision: eligibility is decided by a deterministic rules engine over a curated dataset of 21 central schemes — not by the AI — so there are zero hallucinated eligibilities. She matches the widow pension first because the engine ranks by specificity. Then Gemini takes over and does what AI is actually good at: this personalised summary, why SHE qualifies, exact application steps, and document tips — all generated in Telugu."

**[1:40–2:10] Grounded chat** *(ask in the chat: "ఆదాయ ధృవీకరణ పత్రం ఎక్కడ వస్తుంది?" or "Where do I get an income certificate?")*
"Follow-up questions go to a grounded chat that answers only from her matched schemes' verified data — and every card links to the official government portal."

**[2:10–2:30] Close** *(show README architecture diagram or GitHub repo)*
"Rules decide, AI explains. React and Vite on the front, Vercel serverless functions calling Gemini on the back, nine unit tests on the eligibility engine, deployed and live. Scheme Sahayak — from 'I've heard of some scheme' to 'here's my document list and my first step,' in one minute, in your language. Thank you."

## Recording tips
- Pre-fill a second tab with the Telugu flow already loaded, in case the live AI call is slow on camera.
- Keep browser zoom at 110–125% so text is readable in the video.
- Upload to YouTube as **Unlisted**, verify the link works in an incognito window.
