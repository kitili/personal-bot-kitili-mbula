# Kitili's Personal Bot

Your daily thinking partner. Keep notes in `notes/`, get automatic end-of-day summaries in `log/`.

## Progressive disclosure (load only what you need)

| Need | File |
|------|------|
| Bot personality & rules | `BOT.md` |
| Today's raw notes | `notes/YYYY-MM-DD.md` |
| Past summaries | `log/YYYY-MM-DD-wrapup.md` |
| Daily Wrap-Up skill | `.claude/skills/daily-wrap-up/SKILL.md` |
| Loop schedule (6pm weekdays) | `LOOPS.md` |
| Hook config | `.claude/settings.json` |

## Quick rules

- Notes go in `notes/` as `YYYY-MM-DD.md`
- Summaries go in `log/` as `YYYY-MM-DD-wrapup.md`
- Run `/daily-wrap-up` manually, or let the **loop** (6pm weekdays) or **hook** (on notes save) trigger it

## Laws (Module 6)

- **Skill:** `daily-wrap-up` — read notes → write done/doing/next summary
- **Loop:** Weekdays 6pm — see `LOOPS.md` and `.claude/loop.md`
- **Hook:** After any save in `notes/` — see `.claude/settings.json`
