# Kitili's Personal Bot

Claude Code personal bot with Daily Wrap-Up skill, loop (weekdays 6pm), and hook (on notes save).

**Live URL:** https://personal-bot-kitili-mbula.netlify.app  
**Repo:** https://github.com/kitili/personal-bot-kitili-mbula

## Module 6 Assessment

| Component | Location |
|-----------|----------|
| Skill | `.claude/skills/daily-wrap-up/SKILL.md` |
| Loop | `LOOPS.md` + `.claude/loop.md` |
| Hook | `.claude/settings.json` + `.claude/hooks/on-notes-save.sh` |
| Proof | `PROOF/` + `PROOF/proof-log.txt` |

## Quick start

1. Open this folder in Claude Code
2. Add notes to `notes/YYYY-MM-DD.md`
3. Run wrap-up: `bash scripts/daily-wrap-up.sh`
4. Start loop: `/loop 0 18 * * 1-5 Run the daily-wrap-up skill`

## Author

Kitili Mbula
