# Loop — Daily Wrap-Up (clock)

## Schedule
**Every weekday at 6:00 PM (local time / EAT)**

## Claude Code command
Paste this in Claude Code to start the loop:

```
/loop 0 18 * * 1-5 Run the daily-wrap-up skill: read today's notes and write the summary to log/
```

Cron expression: `0 18 * * 1-5` = minute 0, hour 18 (6pm), any day-of-month, any month, Monday–Friday.

## What happens
1. Claude Code scheduler fires at 6pm on weekdays
2. Prompt invokes the `daily-wrap-up` skill
3. Summary lands in `log/YYYY-MM-DD-wrapup.md`

## Stop the loop
Press `Esc` while waiting, or ask Claude to cancel the scheduled task.

## Proof
See `PROOF/02-loop-fired.md` — simulated loop trigger with `WRAPUP_TRIGGER=loop`.
