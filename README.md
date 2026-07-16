# Kitili's Personal Bot

Claude Code personal bot with Daily Wrap-Up skill, loop (weekdays 6pm), and hook (on notes save) — plus a **live web UI** with login.

**Live URL:** https://personal-bot-kitili-mbula.netlify.app  
**Repo:** https://github.com/kitili/personal-bot-kitili-mbula

## Module 7 — Live bot (web)

| Piece | Location |
|-------|----------|
| Server | `server.js` |
| Wrap-up logic | `lib/wrapup.js` (+ optional AI polish in `lib/ai.js`) |
| UI | `public/` |
| Secrets template | `.env.example` (real values only in `.env` / host env) |

### Local run

```bash
cp .env.example .env
# edit .env — set APP_USERNAME, APP_PASSWORD, and optional API_KEY
npm install
npm start
```

Open http://localhost:3000 — log in, paste notes, click **Run**.

`API_KEY` is read **only on the server**. The browser never sees it.

### Deploy (Netlify — current live host)

Hosted at the Live URL above. Secrets live in **Site configuration → Environment variables** (never in git):

- `APP_USERNAME` / `APP_PASSWORD` — login gate
- `SESSION_SECRET` — cookie signing
- `API_KEY` — optional; paste your own OpenAI-compatible key for AI polish (server-side only)
- `NODE_ENV=production`

Optional alternate host: `render.yaml` for a Render Web Service (`npm start`).

## Module 6 Assessment

| Component | Location |
|-----------|----------|
| Skill | `.claude/skills/daily-wrap-up/SKILL.md` |
| Loop | `LOOPS.md` + `.claude/loop.md` |
| Hook | `.claude/settings.json` + `.claude/hooks/on-notes-save.sh` |
| Proof | `PROOF/` + `PROOF/proof-log.txt` |

## Author

Kitili Mbula
