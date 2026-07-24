require("dotenv").config();

const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cookieSession = require("cookie-session");
const { runWrapup } = require("./lib/wrapup");
const { polishWrapup } = require("./lib/ai");
const {
  MOODS,
  STICKERS,
  DEFAULT_HABITS,
  pickAffirmation,
  formatIntention,
  formatMorningBoard,
  formatWeeklyReview,
  unlockedStickers,
  nextSticker,
  todayEAT,
  computeStats,
} = require("./lib/palace");

const APP_USERNAME = process.env.APP_USERNAME || "";
const APP_PASSWORD = process.env.APP_PASSWORD || "";
const API_KEY = process.env.API_KEY || "";
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-only-change-me";

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "2mb" }));
app.use(
  cookieSession({
    name: "pb_session",
    keys: [SESSION_SECRET],
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  })
);

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ error: "Login required" });
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(API_KEY),
    authConfigured: Boolean(APP_USERNAME && APP_PASSWORD),
    palace: true,
    version: "2.0.0",
  });
});

app.get("/api/me", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({
    authenticated: true,
    user: req.session.user,
    today: todayEAT(),
  });
});

app.post("/api/login", (req, res) => {
  const username = String(req.body?.username || "");
  const password = String(req.body?.password || "");

  if (!APP_USERNAME || !APP_PASSWORD) {
    return res.status(503).json({
      error: "Auth is not configured. Set APP_USERNAME and APP_PASSWORD on the host.",
    });
  }

  if (safeEqual(username, APP_USERNAME) && safeEqual(password, APP_PASSWORD)) {
    req.session.user = username;
    return res.json({ ok: true, user: username, today: todayEAT() });
  }

  return res.status(401).json({ error: "Invalid username or password" });
});

app.post("/api/logout", (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

app.get("/api/palace", requireAuth, (_req, res) => {
  res.json({
    ok: true,
    moods: MOODS,
    stickers: STICKERS,
    habits: DEFAULT_HABITS,
    affirmation: pickAffirmation(Number(todayEAT().replace(/-/g, ""))),
    today: todayEAT(),
    shortcuts: [
      { keys: "g h", action: "Go Home / Morning Board" },
      { keys: "g w", action: "Go Wrap-Up" },
      { keys: "Ctrl/⌘ + Enter", action: "Save board or run wrap-up" },
      { keys: "?", action: "Toggle shortcuts help" },
      { keys: "t", action: "Start / pause focus timer" },
    ],
  });
});

app.get("/api/affirmation", requireAuth, (req, res) => {
  const refresh = String(req.query.refresh || "") === "1";
  const seed = refresh ? Date.now() : Number(todayEAT().replace(/-/g, ""));
  res.json({ ok: true, affirmation: pickAffirmation(seed), today: todayEAT() });
});

app.post("/api/board", requireAuth, (req, res) => {
  const result = formatMorningBoard(req.body || {});
  const filled = result.board.todos.filter((t) => t.text).length;
  if (!result.board.want && !result.board.how && filled === 0) {
    return res.status(400).json({
      error: "Tell me what you want, how you're doing, or at least one to-do.",
    });
  }
  res.json({
    ok: true,
    ...result,
    sparkleGain: filled >= 5 && result.board.want ? 3 : 2,
    stickerHint:
      filled >= 5
        ? "Full 5-todo board sealed — bonus sparkles"
        : "Morning board sealed",
  });
});

app.post("/api/intention", requireAuth, (req, res) => {
  const text = String(req.body?.text || "").trim();
  const mood = String(req.body?.mood || "sparkly");
  if (!text) {
    return res.status(400).json({ error: "Write a morning intention first, princess." });
  }
  const output = formatIntention(text, mood);
  res.json({
    ok: true,
    output,
    mood,
    sparkleGain: 1,
    stickerHint: "Morning intentions earn +1 sparkle",
  });
});

app.post("/api/weekly-review", requireAuth, (req, res) => {
  const output = formatWeeklyReview(req.body || {});
  res.json({ ok: true, output, sparkleGain: 1 });
});

app.post("/api/stats", requireAuth, (req, res) => {
  res.json({ ok: true, stats: computeStats(req.body || {}) });
});

app.post("/api/run", requireAuth, async (req, res) => {
  const input = String(req.body?.input || "").trim();
  const mood = String(req.body?.mood || "");
  const board = req.body?.board || null;
  if (!input) {
    return res.status(400).json({ error: "Please enter notes or a prompt." });
  }

  try {
    let notes = input;
    if (board && Array.isArray(board.todos)) {
      const open = board.todos
        .filter((t) => t.text && !t.done)
        .map((t) => `- ${t.text}`);
      const doneTodos = board.todos
        .filter((t) => t.text && t.done)
        .map((t) => `- ${t.text}`);
      if (doneTodos.length || open.length) {
        notes = [
          input,
          "",
          "## From Morning Board",
          ...(doneTodos.length ? ["### Board done", ...doneTodos] : []),
          ...(open.length ? ["### Board still open", ...open] : []),
        ].join("\n");
      }
    }

    const draft = runWrapup(notes, { trigger: "web" });
    let output = draft;
    let mode = "local-wrapup";

    if (mood) {
      const moodMeta = MOODS.find((m) => m.id === mood);
      if (moodMeta) {
        output = `${output}\n\n**Evening mood:** ${moodMeta.emoji} ${moodMeta.label}`;
      }
    }

    if (API_KEY) {
      try {
        const polished = await polishWrapup(notes, draft, API_KEY);
        if (polished) {
          output = polished;
          if (mood) {
            const moodMeta = MOODS.find((m) => m.id === mood);
            if (moodMeta) {
              output = `${output}\n\n**Evening mood:** ${moodMeta.emoji} ${moodMeta.label}`;
            }
          }
          mode = "ai-polished";
        }
      } catch (aiErr) {
        mode = "local-wrapup-ai-failed";
        console.error("AI polish failed:", aiErr.message, aiErr.detail || "");
      }
    }

    res.json({
      ok: true,
      output,
      mode,
      sparkleGain: 2,
      stickerHint: "Wrap-ups earn +2 sparkles",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Bot failed to run. Check server logs." });
  }
});

app.post("/api/sparkles", requireAuth, (req, res) => {
  const points = Math.max(0, Number(req.body?.points) || 0);
  res.json({
    ok: true,
    points,
    unlocked: unlockedStickers(points),
    next: nextSticker(points),
    stickers: STICKERS,
  });
});

// Local / Render: serve static UI from the same process
if (!process.env.NETLIFY) {
  app.use(express.static(path.join(__dirname, "public")));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

module.exports = app;
