# Module 10 — separate databases (fix for duplicate-link blocker)

## Why you were blocked
The form got the **same** Supabase dashboard URL for both projects:
`https://supabase.com/dashboard/project/upbdubfwtuawdugqhszy`

Each project must have its **own** Supabase project / dashboard link.

## Correct distinct links (use these on the form)

| Project | Dashboard link |
|---------|----------------|
| **Main — Ops Ticket Desk** | https://supabase.com/dashboard/project/mrspaumnfgyeqsdoedxd |
| **Personal — Princess Palace** | Create a **new** Supabase project (see below), then use `https://supabase.com/dashboard/project/<NEW_REF>` |

Notes:
- Ticketing already uses `mrspaumnfgyeqsdoedxd` in `public/js/config.js`.
- Princess Palace `.env` still pointed at `upbdubfwtuawdugqhszy`, but that tenant no longer resolves (`ENOTFOUND`). Do **not** reuse the ticketing project.

## Create the Princess Palace database (5 minutes)

1. Open https://supabase.com/dashboard/new → **New project**.
2. Name it e.g. `princess-palace-personal-bot`.
3. Copy the new project ref from the URL:  
   `https://supabase.com/dashboard/project/<REF>`
4. **SQL Editor** → paste and run `db/schema.sql` from this repo.
5. **Project Settings → Database → Connection string (URI)** → put in local `.env` as `DATABASE_URL=...`
6. Optional: set `SUPABASE_URL=https://<REF>.supabase.co`
7. Verify: `npm run db:check` (or `node db/check.js`)

Never commit `.env`.

## Form answers to paste

**Database link of your main project**  
https://supabase.com/dashboard/project/mrspaumnfgyeqsdoedxd

**Database link of your personal bot project**  
https://supabase.com/dashboard/project/<YOUR_NEW_PRINCESS_PALACE_REF>

## After you create it
Tell the agent the new project ref (or dashboard URL). It can update `.env` locally and re-run `db/schema.sql` / `db:check` — still without committing secrets.
