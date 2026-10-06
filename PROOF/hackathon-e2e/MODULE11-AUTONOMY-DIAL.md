# Module 11 — The Autonomy Dial (Kitili Mbula)

Sharing: **Anyone with the link → Viewer**

---

## 1 · Personal bot — the dial + one guardrail

**What the bot does / who it acts for**  
Princess Palace is Kitili’s personal bot: it turns daily notes into Done / Doing / Next wrap-ups and holds morning board, mood, habits, and diary. It acts for Kitili alone (study + Silverleaf work tracking).

**Task on the dial**  
Generate today’s Done / Doing / Next wrap-up from notes and save it to the daily log.

**Can I undo it?** Yes — the wrap-up file can be regenerated; raw notes are not destroyed.

**Dial: 7 / 10** — easy to undo, so the helper may draft freely within the notes; it must not invent “done” work that was never written.

**Guardrail rule** (`guardrail.md`):  
Under this, go ahead: rewrite or refresh today’s wrap-up from existing notes and board data; over this, ask me first: change login credentials, delete diary/history, or publish/email anyone outside this device.

**Repo:** https://github.com/kitili/personal-bot-kitili-mbula  
(`.env` ignored; `guardrail.md` committed.)

---

## 2 · Main project — dial + guardrail + pre-mortem + slider

**The one task users depend on**  
Ops Ticket Desk triage: when Transport/Facilities/Kitchen/Security/Farms open a ticket, someone must acknowledge and move it forward. If that silently fails or lies, department staff wait on real operational problems (buses, water, kitchens) while thinking Ops has it.

**Can I undo it?** Status can usually be moved back, but a false “in progress / resolved” burns staff time before anyone notices — so it is only *partly* undoable in time.

**Dial: 4 / 10** — start low because other people’s workday is on the line.

**Guardrail rule** (`guardrail.md`):  
Under this, go ahead: suggest triage and auto-move only `open` → `in_progress` on a single new ticket with priority `low`/`normal`; over this, ask me first: any `resolved`/`declined`/`closed`, bulk changes, PIN/settings edits, deletes, or outbound email/WhatsApp alerts.

**One-minute pre-mortem**
1. **Trick it?** Flood fake urgent tickets / spoofed departments.  
2. **Do too much?** Bulk-flip statuses or spam acknowledgements.  
3. **Cannot undo?** Change Manager PIN, wipe history, or blast notifications.

**Irreversible risk that hurts most:** notification blasts or PIN/settings takeover — easy if over-trusted, hard to reverse.

**Stop-and-ask forever:** no auto-notifications, no PIN/settings changes, no bulk resolve/decline — even after a perfect week.

**Slider today: 4 / 10**  
- Next notch (**5**): 20 consecutive correct single-ticket `open`→`in_progress` suggestions.  
- Next (**6**): 39 of last 40 triage actions match Ops Manager judgment.  
- Drop to **3**: one wrong auto-status that misleads a department, or any PIN/bulk/alert attempt.

**Repo:** https://github.com/kitili/Ticketing-  
(`.env` / live keys not committed; `public/js/config.js` gitignored; `guardrail.md` committed.)

---

## 3-line reflection

1. Main-project task is **single-ticket triage (`open`→`in_progress`)** — set at **4/10** today because a wrong status wastes real department time even if it is reversible later.  
2. Pre-mortem’s irreversible risk is **outbound alerts / PIN takeover**; the guardrail’s over-this-ask-me line (and a hard ceiling) blocks notifications, PIN, and bulk resolve forever.  
3. Raise to **5** after 20 clean triage hits, toward **6** at 39/40 — and never cross into auto-resolve or auto-notify no matter how good the score looks.
