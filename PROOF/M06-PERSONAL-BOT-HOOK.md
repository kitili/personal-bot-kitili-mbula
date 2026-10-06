# M06 resubmission — Personal Bot + Hook

**Submit this repo (not memory-tuneup):**  
https://github.com/kitili/personal-bot-kitili-mbula

This project is separate from `memory-tuneup-kitili-mbula` and from the Ops Desk / Ticketing- repos.

## Hook (hard requirement)

| File | Role |
|------|------|
| `.claude/settings.json` | `hooks.PostToolUse` on `Write\|Edit` |
| `.claude/hooks/on-notes-save.sh` | Runs Daily Wrap-Up when `notes/` is saved |

## Loop evidence (hard requirement)

| File | Proof |
|------|--------|
| `tasks.json` | Task `m06-wrapup-2026-10-06`: **waiting → working → done** |
| `log/2026-10-06-wrapup.md` | Output of the loop |
| `PROOF/proof-log.txt` | Timestamped `trigger=loop` and `trigger=hook` lines |
| `LOOPS.md` + `.claude/loop.md` | Weekday 18:00 schedule |
| `scripts/run-loop-once.sh` | Attended loop runner used for this proof |

## Skill

`.claude/skills/daily-wrap-up/SKILL.md` — reads `notes/`, writes `log/YYYY-MM-DD-wrapup.md`.
