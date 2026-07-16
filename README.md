# Kitili's Personal Bot

Claude Code personal bot with Daily Wrap-Up skill, loop (weekdays 6pm), and hook (on notes save) — plus a **live web UI** with login.

**Live URL:** _(set after Render deploy)_  
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

### Deploy (Render)

1. Push this repo to GitHub.
2. On [Render](https://render.com) → **New** → **Web Service** → connect this repo.
3. Build: `npm install` · Start: `npm start` · Instance: Free.
4. **Environment** tab — add:
   - `APP_USERNAME`
   - `APP_PASSWORD`
   - `API_KEY` (optional — local wrap-up still works without it)
   - `SESSION_SECRET` (any long random string)
   - `NODE_ENV=production`
5. Save (redeploys). Open the `*.onrender.com` URL.

Or use the Blueprint: `render.yaml` → **New** → **Blueprint**.

## Module 6 Assessment

| Component | Location |
|-----------|----------|
| Skill | `.claude/skills/daily-wrap-up/SKILL.md` |
| Loop | `LOOPS.md` + `.claude/loop.md` |
| Hook | `.claude/settings.json` + `.claude/hooks/on-notes-save.sh` |
| Proof | `PROOF/` + `PROOF/proof-log.txt` |

## Author

Kitili Mbula
