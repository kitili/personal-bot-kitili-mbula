# Kitili's Personal Bot

Claude Code personal bot with Daily Wrap-Up skill, loop (weekdays 6pm), and hook (on notes save) — plus a **live Princess Palace web UI** (pink & yellow, ponies, dolls, stickers).

**Live URL:** https://personal-bot-kitili-mbula.netlify.app  
**Repo:** https://github.com/kitili/personal-bot-kitili-mbula  
**Project blurb:** see [`PROJECT.md`](./PROJECT.md)

## Princess Palace (web)

Rooms after login:

| Room | What it does |
|------|----------------|
| Wrap-Up | Notes → Done / Doing / Next (+ evening mood) |
| Morning | Seal a daily intention |
| Mood | Mood garden + streak |
| Stickers | Sparkle points unlock pony/doll/palace stickers |
| Diary | Local history + JSON export |
| Affirm | Daily affirmation mirror |

### Local run

```bash
cp .env.example .env
# edit .env — set APP_USERNAME, APP_PASSWORD, and optional API_KEY
npm install
npm start
```

Open http://localhost:3000 — log in, explore the palace rooms.

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
