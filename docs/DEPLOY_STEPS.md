# Deploy in ~15 minutes — do these in order. Deadline: TONIGHT 11:59 PM.

## 1. Gemini API key (3 min)
1. Go to https://aistudio.google.com/apikey (sign in with Google).
2. Create API key → copy it. Free tier is enough.

## 2. GitHub (4 min)
1. Go to https://github.com/new → name: `scheme-sahayak` → **Public** → Create (no README — we have one).
2. On your computer, in the project folder:
   ```bash
   git init
   git add .
   git commit -m "Scheme Sahayak — AI welfare scheme eligibility assistant (Idea2Impact 2026)"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/scheme-sahayak.git
   git push -u origin main
   ```
   (`.env` is gitignored — never commit your key.)

## 3. Vercel (5 min)
1. Go to https://vercel.com → sign up/in **with GitHub**.
2. Add New → Project → Import `scheme-sahayak`.
3. Framework should auto-detect **Vite**. Don't change build settings.
4. Expand **Environment Variables** → add `GEMINI_API_KEY` = your key.
5. Deploy. You get `https://scheme-sahayak-xxxx.vercel.app`.

## 4. Verify (3 min) — do NOT skip
- Open the URL **on your phone** (different network if possible).
- Run the full flow in Telugu AND English. Confirm AI guidance renders.
- Test the chat with one question.
- If AI fails: Vercel dashboard → Project → Settings → Environment Variables (check the key), then Deployments → Redeploy.

## 5. Update links
- In `README.md`, replace `<DEPLOYED_URL>` and `<VIDEO_URL>`, then:
  ```bash
  git add README.md && git commit -m "Add live demo + video links" && git push
  ```

## 6. Record video (15 min)
Follow `docs/DEMO_SCRIPT.md`. Upload to YouTube (Unlisted). Test the link in incognito.

## 7. Submit (before 11:30 PM — leave buffer!)
Form: https://forms.ccbp.in/acad-online-hackathon-project-submission
- **Theme**: Sustainability & Social Impact
- **Problem statement**: copy from `docs/PROBLEM_STATEMENT.md` (sections 1–3, condensed)
- **Solution description**: copy from `docs/PROBLEM_STATEMENT.md` section 4 + tech stack. Mention: Gemini 2.5 Flash, rules-engine + AI grounding architecture, 3 languages, 21 schemes, 9 unit tests.
- **GitHub**: your public repo URL
- **Deployed link**: your vercel.app URL
- **Demo video**: your YouTube unlisted URL
