/**
 * Princess Palace helpers — affirmations, stickers, mood, intentions, morning board.
 */

const AFFIRMATIONS = [
  "You are the softest kind of strong — pink heart, yellow courage.",
  "Princess energy unlocked: today you finish what matters.",
  "Your notes are a fairy tale you get to rewrite every evening.",
  "Little steps still count as royal progress.",
  "You deserve glitter AND good systems.",
  "Done is prettier than perfect.",
  "Your pony brain can hold big dreams and tiny tasks.",
  "East Africa sun, princess pace — you are right on time.",
  "Even queens save drafts. Keep going, Kitili.",
  "Sparkle points are earned by showing up, not by fretting.",
];

const STICKERS = [
  { id: "pony", emoji: "🦄", name: "Pony Sparkle", need: 1 },
  { id: "crown", emoji: "👑", name: "Tiny Crown", need: 2 },
  { id: "doll", emoji: "🎀", name: "Doll Bow", need: 3 },
  { id: "wand", emoji: "🪄", name: "Star Wand", need: 5 },
  { id: "castle", emoji: "🏰", name: "Palace Gate", need: 8 },
  { id: "carriage", emoji: "🎠", name: "Carousel Ride", need: 12 },
  { id: "tiara", emoji: "💎", name: "Diamond Tiara", need: 18 },
  { id: "fairy", emoji: "🧚", name: "Fairy Friend", need: 25 },
];

const MOODS = [
  { id: "sunny", label: "Sunny princess", emoji: "☀️", color: "#ffe66d" },
  { id: "sparkly", label: "Sparkly", emoji: "✨", color: "#ff9ecf" },
  { id: "cozy", label: "Cozy doll", emoji: "🧸", color: "#ffc2d4" },
  { id: "brave", label: "Brave pony", emoji: "🦄", color: "#ffb4e0" },
  { id: "tired", label: "Soft tired", emoji: "🌙", color: "#e8d5ff" },
  { id: "proud", label: "Proud queen", emoji: "👑", color: "#ffd166" },
];

const DEFAULT_HABITS = [
  { id: "water", label: "Drink water", emoji: "💧" },
  { id: "move", label: "Move body", emoji: "🩰" },
  { id: "focus", label: "Deep focus block", emoji: "🎯" },
  { id: "notes", label: "Capture notes", emoji: "📝" },
  { id: "kind", label: "One kind thing", emoji: "💗" },
];

function todayEAT(date = new Date()) {
  return date.toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
}

function pickAffirmation(seed) {
  const n = typeof seed === "number" ? seed : Date.now();
  return AFFIRMATIONS[Math.abs(n) % AFFIRMATIONS.length];
}

function cleanTodo(text) {
  return String(text || "")
    .replace(/^[-*•\d.)\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBoard(input = {}) {
  const want = String(input.want || "").trim().slice(0, 500);
  const how = String(input.how || "").trim().slice(0, 500);
  const mood = MOODS.some((m) => m.id === input.mood) ? input.mood : "sparkly";
  const rawTodos = Array.isArray(input.todos) ? input.todos : [];
  const todos = [];
  for (let i = 0; i < 5; i++) {
    const item = rawTodos[i] || {};
    todos.push({
      text: cleanTodo(item.text || "").slice(0, 140),
      done: Boolean(item.done),
    });
  }
  return { want, how, mood, todos, date: input.date || todayEAT() };
}

function boardProgress(board) {
  const filled = board.todos.filter((t) => t.text).length;
  const done = board.todos.filter((t) => t.text && t.done).length;
  return { filled, done, total: 5, pct: filled ? Math.round((done / filled) * 100) : 0 };
}

function formatMorningBoard(raw) {
  const board = normalizeBoard(raw);
  const mood = MOODS.find((m) => m.id === board.mood);
  const progress = boardProgress(board);
  const todoLines = board.todos.map((t, i) => {
    const mark = t.done ? "x" : " ";
    const text = t.text || "(empty slot)";
    return `- [${mark}] ${i + 1}. ${text}`;
  });

  return {
    board,
    progress,
    markdown: [
      `# Morning Board — ${board.date}`,
      "",
      `**Mood:** ${mood ? `${mood.emoji} ${mood.label}` : "✨ Sparkly"}`,
      "",
      "## What I want today",
      `- ${board.want || "(not set yet)"}`,
      "",
      "## How I'm doing",
      `- ${board.how || "(not set yet)"}`,
      "",
      `## Five to-dos (${progress.done}/${progress.filled || 5})`,
      ...todoLines,
      "",
      "## Princess reminder",
      `- ${pickAffirmation(Number(String(board.date).replace(/-/g, "")) || Date.now())}`,
      "",
      "---",
      "*Morning board sealed*",
    ].join("\n"),
  };
}

function formatIntention(text, moodId) {
  const mood = MOODS.find((m) => m.id === moodId);
  const date = todayEAT();
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 5)
    .map((l) => `- ${l.replace(/^[-*•]\s+/, "")}`);

  return [
    `# Morning Intention — ${date}`,
    "",
    `**Mood:** ${mood ? `${mood.emoji} ${mood.label}` : "✨ Sparkly"}`,
    "",
    "## Today I intend",
    ...(lines.length ? lines : ["- Show up soft and focused"]),
    "",
    "## Princess reminder",
    `- ${pickAffirmation(Number(date.replace(/-/g, "")) || Date.now())}`,
    "",
    "---",
    "*Sealed with a tiny crown*",
  ].join("\n");
}

function formatWeeklyReview({ boards = [], history = [], habits = {} } = {}) {
  const date = todayEAT();
  const completedTodos = boards.reduce(
    (n, b) => n + (b.todos || []).filter((t) => t.text && t.done).length,
    0
  );
  const plannedTodos = boards.reduce(
    (n, b) => n + (b.todos || []).filter((t) => t.text).length,
    0
  );
  const wrapups = history.filter((h) => h.kind === "wrapup").length;
  const intentions = history.filter((h) => h.kind === "intention" || h.kind === "board").length;
  const habitDays = Object.keys(habits).length;

  return [
    `# Weekly Sparkle Review — week of ${date}`,
    "",
    "## Wins",
    `- Morning boards logged: ${boards.length}`,
    `- To-dos completed: ${completedTodos}/${plannedTodos || 0}`,
    `- Wrap-ups saved: ${wrapups}`,
    `- Intentions / boards sealed: ${intentions}`,
    `- Habit check-in days: ${habitDays}`,
    "",
    "## Keep",
    "- Protect one deep-focus block",
    "- Keep the 5-todo cap (no more, no less when possible)",
    "",
    "## Improve",
    "- Carry unfinished todos instead of rewriting from scratch",
    "- Seal the morning board before opening Slack/email",
    "",
    "---",
    "*Generated by Princess Palace*",
  ].join("\n");
}

function unlockedStickers(sparklePoints) {
  return STICKERS.filter((s) => sparklePoints >= s.need).map((s) => s.id);
}

function nextSticker(sparklePoints) {
  return STICKERS.find((s) => sparklePoints < s.need) || null;
}

function computeStats(payload = {}) {
  const sparkles = Math.max(0, Number(payload.sparkles) || 0);
  const boards = payload.boards || {};
  const moods = payload.moods || {};
  const history = payload.history || [];
  const habits = payload.habits || {};
  const today = todayEAT();
  const todayBoard = boards[today] ? normalizeBoard(boards[today]) : null;
  const progress = todayBoard
    ? boardProgress(todayBoard)
    : { filled: 0, done: 0, total: 5, pct: 0 };

  return {
    today,
    sparkles,
    unlocked: unlockedStickers(sparkles),
    next: nextSticker(sparkles),
    moodDays: Object.keys(moods).length,
    historyCount: history.length,
    habitDays: Object.keys(habits).length,
    todayBoard: todayBoard
      ? {
          want: todayBoard.want,
          mood: todayBoard.mood,
          progress,
        }
      : null,
  };
}

module.exports = {
  AFFIRMATIONS,
  STICKERS,
  MOODS,
  DEFAULT_HABITS,
  todayEAT,
  pickAffirmation,
  formatIntention,
  formatMorningBoard,
  formatWeeklyReview,
  normalizeBoard,
  boardProgress,
  unlockedStickers,
  nextSticker,
  computeStats,
};
