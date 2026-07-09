# Proof 2 — Loop fired (clock)

**Prompt used:** "Every weekday at 6 p.m., run my Daily Wrap-Up skill."

**Loop config:**
- `.claude/loop.md` — default maintenance prompt for `/loop`
- `LOOPS.md` — cron command: `/loop 0 18 * * 1-5 Run the daily-wrap-up skill`

**How simulated:** `WRAPUP_TRIGGER=loop bash scripts/daily-wrap-up.sh`

**Proof log entry:**
```
[2026-07-09T08:40:59+03:00] trigger=loop output=.../log/2026-07-09-wrapup.md
```

In Claude Code, start the real loop with:
```
/loop 0 18 * * 1-5 Run the daily-wrap-up skill
```
