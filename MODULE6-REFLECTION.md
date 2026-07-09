# Module 6 Reflection — Loop vs. Hook

**Student:** Kitili Mbula  
**Project:** Personal Bot — https://github.com/kitili/personal-bot-kitili-mbula  
**Date:** July 9, 2026

---

## Loop vs. Hook (in my own words)

A **loop** is a clock — it fires on a schedule whether or not anything changed. My Daily Wrap-Up loop runs every weekday at 6pm (`0 18 * * 1-5`) so I always get an end-of-day summary even if I forgot to save notes at the last minute.

A **hook** is an event — it fires when something happens. My notes-save hook runs the same Daily Wrap-Up skill whenever I write or edit a file in `notes/`, so the summary stays fresh as I work.

Same skill, two triggers: **time-driven** (loop) vs **event-driven** (hook).

---

## What I learned

- Skills are the reusable recipe; loops and hooks are the **laws** that decide when the recipe runs automatically.
- Progressive disclosure (`CLAUDE.md` short index → `BOT.md` details) keeps the bot's context lean.
- Hooks in `.claude/settings.json` react to tool events (like file saves); loops via `/loop` or `loop.md` react to cron schedules.
- Proof matters — I logged each trigger in `PROOF/proof-log.txt` so I can show the skill, loop, and hook all fired.

---

## How I'll use this

| Use case | Tool |
|----------|------|
| End-of-day summary even if I forget | Loop at 6pm weekdays |
| Live summary while taking notes | Hook on notes/ save |
| Silverleaf deploy checks | Loop on CI polling |
| Auto-format after edits | Hook on Write/Edit (like Prettier) |
| Offline-sync QA after schema change | Hook or agent on migration commit |

On my SLA project, I'll add a hook that reminds Claude to update `offline-store.js` whenever `schema.sql` is edited — the same pattern as "wrap up when notes change."
