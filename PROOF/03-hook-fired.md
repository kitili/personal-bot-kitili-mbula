# Proof 3 — Hook fired (event)

**Prompt used:** "Every time I save a file in my notes folder, run my Daily Wrap-Up skill."

**Hook config:** `.claude/settings.json` → `PostToolUse` on `Write|Edit` → `.claude/hooks/on-notes-save.sh`

**How simulated:** Piped JSON with `notes/2026-07-09.md` path into hook script with `WRAPUP_TRIGGER=hook`

**Hook response:**
```json
{"additionalContext": "Daily Wrap-Up hook fired after notes save. Summary written to log/."}
```

**Proof log entry:**
```
[2026-07-09T08:41:00+03:00] trigger=hook output=.../log/2026-07-09-wrapup.md
```
