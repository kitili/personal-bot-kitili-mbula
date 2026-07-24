# Hackathon E2E Report — Chrome MCP & Browser Testing

**Project:** Kitili's Princess Palace Bot (`personal-bot-kitili-mbula`)  
**Date:** 2026-07-24  
**Tester:** Cursor agent (Chrome DevTools MCP installed for Claude Code; E2E driven via Cursor browser + CDP)

---

## 1. Live URL + demo credentials

| | |
|--|--|
| **Live URL** | https://personal-bot-kitili-mbula.netlify.app |
| **Local URL tested** | http://localhost:3000 |
| **Demo username** | `princess` |
| **Demo password** | `palace-demo` |

> Local server was started with these demo credentials for the E2E run (`APP_USERNAME=princess APP_PASSWORD=palace-demo npm start`).  
> Live Netlify health check: `{"ok":true,"authConfigured":true}` (homepage 200). Use your Netlify env credentials for the live site.

---

## 2. Chrome DevTools MCP setup

```bash
claude mcp add --transport stdio chrome-devtools -- npx -y chrome-devtools-mcp@latest
claude mcp list
# → chrome-devtools: npx -y chrome-devtools-mcp@latest - ✓ Connected
```

Prerequisites verified: Node.js v20.20.0, Google Chrome 150.0.7871.128.

---

## 3. Flows tested

| # | Flow | Result |
|---|------|--------|
| 1 | Login — wrong password | ✅ Shows `Invalid username or password` |
| 2 | Login — correct credentials | ✅ Enters Command Center |
| 3 | Seal Morning Board — empty | ✅ 400 + friendly status message |
| 4 | Seal Morning Board — full (want/mood/5 todos) | ✅ Sealed ✓, +sparkles, diary entry |
| 5 | Wrap-Up — empty notes | ✅ `Paste a few notes first.` |
| 6 | Wrap-Up — sample + merge board | ✅ Local wrap-up with Done/Doing/Next |
| 7 | Focus timer start/pause | ✅ Counts down (25:00 → 24:xx), pause works |
| 8 | Habits check-off | ✅ `1/5 soft habits done today` |
| 9 | Mood garden | ✅ Mood logged / streak updates |
| 10 | Stickers / sparkles | ✅ Progress text updates |
| 11 | Diary | ✅ Morning Board + Wrap-Up entries |
| 12 | Tools → Refresh stats | ✅ JSON stats rendered |
| 13 | Copy wrap-up output | ❌ then ✅ after fix (see §4) |
| 14 | Log out | ✅ Returns to login; `/api/me` → 401 |

### Console / network

- Unhappy login: `/api/login` → **401** (expected)
- Empty board: `/api/board` → **400** (expected)
- Happy paths: `/api/login`, `/api/palace`, `/api/board`, `/api/run`, `/api/stats` → **200**
- No unexpected 5xx observed during the run

---

## 4. Bugs found (by severity)

### ❌ High — Copy button dead-ends when Clipboard API is blocked
- **Step:** Wrap-Up → Run wrap-up → **Copy ✨**
- **Before:** Status showed `Copy failed` with no recovery path
- **Cause:** Only `navigator.clipboard.writeText`; fails in embedded / restricted browsers

### ❌ Medium — Service worker cache-first served stale `app.js`
- **Step:** Deploy / edit frontend, reload once
- **Before:** Old JS kept winning (`return cached \|\| fetched`)
- **Impact:** Fixes and UI changes could take an extra reload (or never show during testing)

### ⚠️ Low — Room tabs missing `aria-selected`
- Tabs toggled `.active` class only; screen readers got no selected state

### ⚠️ Sketchy / polish
- Empty inbox pin silently no-ops (no feedback)
- Placeholder typo: “A honest” → fixed to “An honest”
- Fractional sparkles (`5.5`, `11.5`) look a bit odd in the meter

---

## 5. The one bug fixed (before / after)

### Copy ✨ recovery path

**Before:** Clipboard failure → status `Copy failed` → user stuck.  
**After:**
1. Try Clipboard API  
2. Fall back to `document.execCommand('copy')`  
3. If both fail → **select fairy output** and show `Selected — press Ctrl/⌘+C`

Also fixed as part of hardening:
- Service worker → **network-first** (offline fallback to cache), cache bump `palace-shell-v5`
- Tabs set `aria-selected` / `tabindex`
- Placeholder grammar fix

### Re-test evidence
- Status after Copy: **`Selected — press Ctrl/⌘+C`**
- Selection length: **379** characters of wrap-up output
- Screenshot: [`03-copy-retest-after-fix.png`](./03-copy-retest-after-fix.png)
- Login screenshot: [`01-login-after-logout.png`](./01-login-after-logout.png)

---

## 6. Moves 1–3 prompts (what we typed)

### Move 1 — Install browser tool + map flows
> Set up the Chrome DevTools MCP, then run a full end-to-end test of my project in a real browser. Install with `claude mcp add --transport stdio chrome-devtools -- npx -y chrome-devtools-mcp@latest`, confirm connected, start the app, and list the main user journeys before testing.

### Move 2 — Fix what broke
> The Copy button fails with “Copy failed” when the Clipboard API is blocked. Add a fallback (execCommand + select output for Ctrl/⌘+C), fix the service worker so deploys aren’t stuck on stale JS, and set aria-selected on room tabs.

### Move 3 — Re-test
> Use the browser to open Wrap-Up again, run wrap-up, click Copy ✨, take a screenshot, and confirm the status is no longer a dead-end.

---

## 7. Reflection

Browser E2E caught something code review would miss: **Copy looked fine in source, but failed in a real restricted browser** with a dead-end message. The service worker made that worse by caching old `app.js`, so the first fix attempt didn’t load until we busted the cache — which itself became a product fix (network-first + versioned assets).

Unhappy paths (wrong login, empty board, empty wrap-up) were already handled well. The highest-value find was UX resilience under clipboard / PWA constraints, not a broken login or wrap-up pipeline. I’d keep a short “Copy + tab switch + seal board” smoke run in the browser before every deploy.
