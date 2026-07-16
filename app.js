require("dotenv").config();

const path = require("path");
const express = require("express");
const cookieSession = require("cookie-session");
const { runWrapup } = require("./lib/wrapup");
const { polishWrapup } = require("./lib/ai");

const APP_USERNAME = process.env.APP_USERNAME || "";
const APP_PASSWORD = process.env.APP_PASSWORD || "";
const API_KEY = process.env.API_KEY || "";
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-only-change-me";

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
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

function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ error: "Login required" });
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(API_KEY),
    authConfigured: Boolean(APP_USERNAME && APP_PASSWORD),
  });
});

app.get("/api/me", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({ authenticated: true, user: req.session.user });
});

app.post("/api/login", (req, res) => {
  const username = String(req.body?.username || "");
  const password = String(req.body?.password || "");

  if (!APP_USERNAME || !APP_PASSWORD) {
    return res.status(503).json({
      error: "Auth is not configured. Set APP_USERNAME and APP_PASSWORD on the host.",
    });
  }

  if (username === APP_USERNAME && password === APP_PASSWORD) {
    req.session.user = username;
    return res.json({ ok: true, user: username });
  }

  return res.status(401).json({ error: "Invalid username or password" });
});

app.post("/api/logout", (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

app.post("/api/run", requireAuth, async (req, res) => {
  const input = String(req.body?.input || "").trim();
  if (!input) {
    return res.status(400).json({ error: "Please enter notes or a prompt." });
  }

  try {
    const draft = runWrapup(input, { trigger: "web" });
    let output = draft;
    let mode = "local-wrapup";

    if (API_KEY) {
      try {
        const polished = await polishWrapup(input, draft, API_KEY);
        if (polished) {
          output = polished;
          mode = "ai-polished";
        }
      } catch (aiErr) {
        mode = "local-wrapup-ai-failed";
        console.error("AI polish failed:", aiErr.message, aiErr.detail || "");
      }
    }

    res.json({ ok: true, output, mode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Bot failed to run. Check server logs." });
  }
});

// Local / Render: serve static UI from the same process
if (!process.env.NETLIFY) {
  app.use(express.static(path.join(__dirname, "public")));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

module.exports = app;
