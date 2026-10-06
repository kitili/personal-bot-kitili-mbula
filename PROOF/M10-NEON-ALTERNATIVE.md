# Module 10 — Princess Palace DB without a new Supabase project

Supabase free-plan project slots are full. Princess Palace can use **Neon** (free Postgres) instead — same `db/schema.sql`, **different** dashboard URL from ticketing’s Supabase.

## Form answers

| Field | Link |
|-------|------|
| **Main project (Ops Ticket Desk)** | https://supabase.com/dashboard/project/mrspaumnfgyeqsdoedxd *(keep Supabase)* |
| **Personal bot (Princess Palace)** | Your **Neon project console** URL, e.g. `https://console.neon.tech/app/projects/<project-id>` |

That personal-bot URL must **not** be the ticketing Supabase link and must **not** be `upbdubfwtuawdugqhszy`.

## Create Neon (about 2 minutes)

1. Sign up / log in: https://console.neon.tech  
2. **Create project** → name `princess-palace-personal-bot`  
3. Copy:
   - **Connection string** (URI) → local `.env` as `DATABASE_URL=...`
   - **Project page URL** from the browser → this is what you paste on the LMS as the personal-bot database link  
4. In Neon **SQL Editor**, paste and run the full contents of `db/schema.sql`  
5. Locally: `node db/check.js` (uses `DATABASE_URL` from `.env`; never commit `.env`)

## Why this is OK for the resubmit

- Graders blocked you for **one shared Supabase URL on two apps**, not for “must be Supabase forever.”  
- Ticketing stays on its own Supabase project.  
- Princess Palace gets a **second, real hosted Postgres** with its own dashboard link.

If the form UI literally only accepts `supabase.com/dashboard/...`, leave a one-line note in your Google Doc: *“Personal bot on Neon free Postgres because Supabase free project quota was exhausted; schema is `db/schema.sql`.”* and still paste the Neon console URL in the form field.
