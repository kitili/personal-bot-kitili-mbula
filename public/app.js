const STORAGE = {
  draft: "kitili-palace-draft",
  sparkles: "kitili-palace-sparkles",
  history: "kitili-palace-history",
  moods: "kitili-palace-moods",
  boards: "kitili-palace-boards",
  habits: "kitili-palace-habits",
  inbox: "kitili-palace-inbox",
  timerSessions: "kitili-palace-timer-sessions",
  wrapMood: "kitili-palace-wrap-mood",
  sealed: "kitili-palace-sealed",
};

const SAMPLE = `## Done
- Sealed morning board
- Built Princess Palace home

## Doing
- Focus sprint on LMS write-up
- Silverleaf QA

## Next
- Submit reflection
- Redeploy Netlify`;

const $ = (id) => document.getElementById(id);

const loginView = $("login-view");
const botView = $("bot-view");
const loginForm = $("login-form");
const loginError = $("login-error");

let palace = { moods: [], stickers: [], habits: [], affirmation: "", today: "" };
let selectedBoardMood = "sparkly";
let selectedWrapMood = localStorage.getItem(STORAGE.wrapMood) || "sparkly";
let boardTodos = emptyTodos();
let timer = { seconds: 25 * 60, running: false, mode: "focus", handle: null };
let gotoBuffer = "";
let deferredInstall = null;

function emptyTodos() {
  return Array.from({ length: 5 }, () => ({ text: "", done: false }));
}

function todayEAT() {
  return (
    palace.today ||
    new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" })
  );
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getSparkles() {
  return Math.max(0, Number(localStorage.getItem(STORAGE.sparkles) || 0));
}

function setSparkles(n) {
  localStorage.setItem(STORAGE.sparkles, String(Math.max(0, n)));
  $("sparkle-count").textContent = String(getSparkles());
}

function getHistory() {
  return loadJSON(STORAGE.history, []);
}

function saveHistory(entries) {
  saveJSON(STORAGE.history, entries.slice(0, 60));
}

function pushHistory(entry) {
  const list = getHistory();
  list.unshift({ id: Date.now(), date: todayEAT(), ...entry });
  saveHistory(list);
  renderHistory();
}

function getBoards() {
  return loadJSON(STORAGE.boards, {});
}

function getTodayBoard() {
  return getBoards()[todayEAT()] || null;
}

function saveTodayBoard(board) {
  const all = getBoards();
  all[todayEAT()] = { ...board, date: todayEAT(), updatedAt: new Date().toISOString() };
  saveJSON(STORAGE.boards, all);
}

function getMoodsLog() {
  return loadJSON(STORAGE.moods, {});
}

function setMoodForToday(moodId) {
  const log = getMoodsLog();
  log[todayEAT()] = moodId;
  saveJSON(STORAGE.moods, log);
  renderMoodGarden();
  updateMissionBar();
}

function getHabitsLog() {
  return loadJSON(STORAGE.habits, {});
}

function getTodayHabits() {
  return getHabitsLog()[todayEAT()] || {};
}

function setTodayHabit(id, on) {
  const all = getHabitsLog();
  const day = { ...(all[todayEAT()] || {}) };
  day[id] = on;
  all[todayEAT()] = day;
  saveJSON(STORAGE.habits, all);
  renderHabits();
}

function getInbox() {
  return loadJSON(STORAGE.inbox, []);
}

function saveInbox(items) {
  saveJSON(STORAGE.inbox, items.slice(0, 30));
}

function getTimerSessions() {
  const map = loadJSON(STORAGE.timerSessions, {});
  return Number(map[todayEAT()] || 0);
}

function bumpTimerSession() {
  const map = loadJSON(STORAGE.timerSessions, {});
  map[todayEAT()] = Number(map[todayEAT()] || 0) + 1;
  saveJSON(STORAGE.timerSessions, map);
  $("timer-sessions").textContent = String(getTimerSessions());
  addSparkles(1);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

function celebrate() {
  const root = $("confetti");
  root.innerHTML = "";
  const colors = ["#ff4f9a", "#ffd54a", "#ff8ec4", "#fff3b0", "#ff6fae", "#f5b700"];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDuration = `${1.3 + Math.random() * 1.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.2}s`;
    root.appendChild(piece);
  }
  setTimeout(() => {
    root.innerHTML = "";
  }, 2800);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function showLogin() {
  loginView.classList.remove("hidden");
  botView.classList.add("hidden");
}

function showBot() {
  loginView.classList.add("hidden");
  botView.classList.remove("hidden");
  $("today-label").textContent = todayEAT();
  $("sparkle-count").textContent = String(getSparkles());
  const saved = localStorage.getItem(STORAGE.draft);
  if (saved && !$("input").value.trim()) $("input").value = saved;
  switchTab("home");
}

function currentBoardPayload() {
  return {
    date: todayEAT(),
    want: $("board-want").value.trim(),
    how: $("board-how").value.trim(),
    mood: selectedBoardMood,
    todos: boardTodos.map((t) => ({ text: t.text.trim(), done: Boolean(t.done) })),
  };
}

function persistBoardDraft() {
  saveTodayBoard(currentBoardPayload());
  updateMissionBar();
  updateTodoCount();
}

function renderTodoRows() {
  const root = $("board-todos");
  root.innerHTML = "";
  boardTodos.forEach((todo, idx) => {
    const row = document.createElement("div");
    row.className = `todo-row${todo.done ? " done" : ""}`;
    row.innerHTML = `
      <input type="checkbox" aria-label="Done ${idx + 1}" ${todo.done ? "checked" : ""} />
      <input type="text" maxlength="140" placeholder="To-do ${idx + 1}" value="${escapeHtml(todo.text)}" />
    `;
    const [check, text] = row.querySelectorAll("input");
    check.addEventListener("change", () => {
      boardTodos[idx].done = check.checked;
      row.classList.toggle("done", check.checked);
      persistBoardDraft();
      if (check.checked && boardTodos[idx].text) addSparkles(0.5);
    });
    text.addEventListener("input", () => {
      boardTodos[idx].text = text.value;
      persistBoardDraft();
    });
    root.appendChild(row);
  });
  updateTodoCount();
}

function updateTodoCount() {
  const filled = boardTodos.filter((t) => t.text.trim()).length;
  const done = boardTodos.filter((t) => t.text.trim() && t.done).length;
  $("board-todo-count").textContent = `${filled}/5 filled · ${done} done`;
}

function updateMissionBar() {
  const filled = boardTodos.filter((t) => t.text.trim()).length;
  const done = boardTodos.filter((t) => t.text.trim() && t.done).length;
  $("mission-todos").textContent = `${done}/${filled || 5}`;
  const sealed = loadJSON(STORAGE.sealed, {})[todayEAT()];
  $("mission-board").textContent = sealed ? "Sealed ✓" : filled || $("board-want").value.trim() ? "Draft" : "Not sealed";
  $("mission-timer").textContent = formatTime(timer.seconds);
  $("mission-streak").textContent = String(moodStreak(getMoodsLog()));
  const pct = filled ? Math.round((done / Math.max(filled, 1)) * 100) : 0;
  $("mission-fill").style.width = `${pct}%`;
}

function renderMoodChips(container, selected, onSelect) {
  if (!container) return;
  container.innerHTML = "";
  for (const mood of palace.moods) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `mood-chip${selected === mood.id ? " selected" : ""}`;
    btn.style.setProperty("--chip", mood.color);
    btn.textContent = `${mood.emoji} ${mood.label}`;
    btn.addEventListener("click", () => onSelect(mood.id));
    container.appendChild(btn);
  }
}

function renderBoardMoods() {
  renderMoodChips($("board-moods"), selectedBoardMood, (id) => {
    selectedBoardMood = id;
    setMoodForToday(id);
    persistBoardDraft();
    renderBoardMoods();
  });
}

function renderWrapMoods() {
  renderMoodChips($("wrapup-moods"), selectedWrapMood, (id) => {
    selectedWrapMood = id;
    localStorage.setItem(STORAGE.wrapMood, id);
    setMoodForToday(id);
    renderWrapMoods();
  });
}

function moodStreak(log) {
  let streak = 0;
  const d = new Date(`${todayEAT()}T12:00:00`);
  for (;;) {
    const key = d.toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
    if (!log[key]) break;
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function renderMoodGarden() {
  const log = getMoodsLog();
  const todayMood = log[todayEAT()];
  renderMoodChips($("mood-garden"), todayMood, (id) => {
    selectedBoardMood = id;
    setMoodForToday(id);
    persistBoardDraft();
    renderBoardMoods();
    celebrate();
  });
  const mood = palace.moods.find((m) => m.id === todayMood);
  $("mood-today-emoji").textContent = mood ? mood.emoji : "❔";
  $("mood-streak").textContent = String(moodStreak(log));
  $("mood-logged").textContent = String(Object.keys(log).length);
  const timeline = $("mood-timeline");
  const entries = Object.entries(log).sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 10);
  timeline.innerHTML = entries.length
    ? entries
        .map(([date, id]) => {
          const m = palace.moods.find((x) => x.id === id);
          return `<li><span>${date}</span><span>${m ? `${m.emoji} ${m.label}` : id}</span></li>`;
        })
        .join("")
    : '<li class="empty-state" style="display:block">No moods yet</li>';
}

function renderStickers() {
  const points = getSparkles();
  const unlocked = new Set((palace.stickers || []).filter((s) => points >= s.need).map((s) => s.id));
  const next = (palace.stickers || []).find((s) => points < s.need);
  $("sticker-progress").textContent = next
    ? `You have ${points} sparkles. Next: ${next.emoji} ${next.name} at ${next.need}.`
    : `You have ${points} sparkles. Full album unlocked.`;
  $("sticker-grid").innerHTML = (palace.stickers || [])
    .map((s) => {
      const on = unlocked.has(s.id);
      return `<div class="sticker-card ${on ? "unlocked" : "locked"}">
        <span class="sticker-emoji">${s.emoji}</span>
        <div class="sticker-name">${s.name}</div>
        <div class="sticker-need">${on ? "Unlocked!" : `Need ${s.need}`}</div>
      </div>`;
    })
    .join("");
}

function renderHistory(filter = "") {
  const q = filter.trim().toLowerCase();
  const list = getHistory().filter((item) => {
    if (!q) return true;
    return `${item.kind} ${item.date} ${item.output}`.toLowerCase().includes(q);
  });
  if (!list.length) {
    $("history-list").innerHTML =
      '<p class="empty-state">No diary entries yet — seal a morning board 💕</p>';
    return;
  }
  const kindLabel = {
    wrapup: "👑 Wrap-Up",
    intention: "☀️ Intention",
    board: "🏠 Morning Board",
    weekly: "📊 Weekly Review",
  };
  $("history-list").innerHTML = list
    .map(
      (item) => `<article class="history-item">
        <header>
          <span class="kind">${kindLabel[item.kind] || item.kind}</span>
          <span class="muted">${item.date}</span>
        </header>
        <pre>${escapeHtml(item.output || "")}</pre>
      </article>`
    )
    .join("");
}

function renderHabits() {
  const today = getTodayHabits();
  const defs = palace.habits || [];
  $("habits-grid").innerHTML = defs
    .map((h) => {
      const on = Boolean(today[h.id]);
      return `<button type="button" class="habit-card${on ? " on" : ""}" data-habit="${h.id}">
        <span class="habit-emoji">${h.emoji}</span>
        <span>${h.label}</span>
        <span class="muted">${on ? "Done" : "Tap me"}</span>
      </button>`;
    })
    .join("");
  const done = defs.filter((h) => today[h.id]).length;
  $("habits-status").textContent = `${done}/${defs.length} soft habits done today`;
  $("habits-grid").querySelectorAll("[data-habit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.habit;
      const next = !getTodayHabits()[id];
      setTodayHabit(id, next);
      if (next) {
        addSparkles(0.5);
        celebrate();
      }
    });
  });
}

function renderInbox() {
  const items = getInbox();
  $("inbox-list").innerHTML = items.length
    ? items
        .map(
          (item, idx) => `<li>
            <span>${escapeHtml(item.text)}</span>
            <button type="button" class="ghost tiny" data-inbox-del="${idx}">✕</button>
          </li>`
        )
        .join("")
    : '<li class="empty-state" style="display:block;border:none">Inbox is clear</li>';
  $("inbox-list").querySelectorAll("[data-inbox-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemsNow = getInbox();
      itemsNow.splice(Number(btn.dataset.inboxDel), 1);
      saveInbox(itemsNow);
      renderInbox();
    });
  });
}

function addSparkles(gain) {
  const before = getSparkles();
  const after = Math.round((before + Number(gain || 0)) * 10) / 10;
  setSparkles(after);
  renderStickers();
}

function formatTime(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function paintTimer() {
  const label = formatTime(timer.seconds);
  $("timer-display").textContent = label;
  $("mission-timer").textContent = label;
  $("timer-mode").textContent = timer.mode === "focus" ? "Focus sprint" : "Glitter break";
}

function stopTimer() {
  if (timer.handle) clearInterval(timer.handle);
  timer.handle = null;
  timer.running = false;
}

function startTimer() {
  if (timer.running) return;
  timer.running = true;
  timer.handle = setInterval(() => {
    timer.seconds -= 1;
    if (timer.seconds <= 0) {
      stopTimer();
      timer.seconds = 0;
      paintTimer();
      if (timer.mode === "focus") {
        bumpTimerSession();
        celebrate();
        if (Notification.permission === "granted") {
          new Notification("Focus sprint done", { body: "Glitter break time ✨" });
        }
      }
      return;
    }
    paintTimer();
  }, 1000);
}

function loadBoardIntoForm() {
  const saved = getTodayBoard();
  if (!saved) {
    boardTodos = emptyTodos();
    $("board-want").value = "";
    $("board-how").value = "";
    selectedBoardMood = "sparkly";
  } else {
    $("board-want").value = saved.want || "";
    $("board-how").value = saved.how || "";
    selectedBoardMood = saved.mood || "sparkly";
    boardTodos = emptyTodos().map((slot, i) => ({
      text: saved.todos?.[i]?.text || "",
      done: Boolean(saved.todos?.[i]?.done),
    }));
  }
  renderTodoRows();
  renderBoardMoods();
  updateMissionBar();
  const sealedOut = loadJSON(STORAGE.sealed, {})[todayEAT()];
  if (sealedOut) $("board-output").textContent = sealedOut;
}

function switchTab(name) {
  document.querySelectorAll(".tab").forEach((tab) => {
    const on = tab.dataset.tab === name;
    tab.classList.toggle("active", on);
    tab.setAttribute("aria-selected", on ? "true" : "false");
    tab.setAttribute("tabindex", on ? "0" : "-1");
  });
  document.querySelectorAll(".room").forEach((panel) => {
    const match = panel.id === `panel-${name}`;
    panel.hidden = !match;
    panel.classList.toggle("active", match);
    panel.setAttribute("aria-hidden", match ? "false" : "true");
  });
  if (name === "stickers") renderStickers();
  if (name === "history") renderHistory($("history-search").value);
  if (name === "mood") renderMoodGarden();
  if (name === "habits") renderHabits();
  if (name === "focus") {
    $("timer-sessions").textContent = String(getTimerSessions());
    paintTimer();
  }
  if (name === "tools") renderTools();
}

function renderTools() {
  $("shortcuts-list").innerHTML = (palace.shortcuts || [])
    .map((s) => `<li><span>${escapeHtml(s.keys)}</span><span>${escapeHtml(s.action)}</span></li>`)
    .join("");
}

function collectBackup() {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    sparkles: getSparkles(),
    boards: getBoards(),
    moods: getMoodsLog(),
    habits: getHabitsLog(),
    history: getHistory(),
    inbox: getInbox(),
    timerSessions: loadJSON(STORAGE.timerSessions, {}),
    sealed: loadJSON(STORAGE.sealed, {}),
    draft: localStorage.getItem(STORAGE.draft) || "",
  };
}

function restoreBackup(data) {
  if (!data || typeof data !== "object") throw new Error("Invalid backup");
  if (data.sparkles != null) setSparkles(Number(data.sparkles) || 0);
  if (data.boards) saveJSON(STORAGE.boards, data.boards);
  if (data.moods) saveJSON(STORAGE.moods, data.moods);
  if (data.habits) saveJSON(STORAGE.habits, data.habits);
  if (data.history) saveHistory(data.history);
  if (data.inbox) saveInbox(data.inbox);
  if (data.timerSessions) saveJSON(STORAGE.timerSessions, data.timerSessions);
  if (data.sealed) saveJSON(STORAGE.sealed, data.sealed);
  if (data.draft) localStorage.setItem(STORAGE.draft, data.draft);
  loadBoardIntoForm();
  renderHistory();
  renderInbox();
  renderHabits();
  renderStickers();
  renderMoodGarden();
  updateMissionBar();
}

async function loadPalace() {
  const { res, data } = await api("/api/palace");
  if (!res.ok) return;
  palace = data;
  $("today-label").textContent = data.today || todayEAT();
  $("home-affirmation").textContent = data.affirmation || "You are glowing.";
  loadBoardIntoForm();
  renderWrapMoods();
  renderMoodGarden();
  renderStickers();
  renderHistory();
  renderHabits();
  renderInbox();
  renderTools();
  updateMissionBar();
  $("timer-sessions").textContent = String(getTimerSessions());
}

async function checkSession() {
  try {
    const { res, data } = await api("/api/me");
    if (res.ok) {
      palace.today = data.today || palace.today;
      showBot();
      await loadPalace();
      return;
    }
  } catch (_) {}
  showLogin();
}

/* ---------- events ---------- */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";
  const { res, data } = await api("/api/login", {
    method: "POST",
    body: JSON.stringify({
      username: $("username").value,
      password: $("password").value,
    }),
  });
  if (!res.ok) {
    loginError.textContent = data.error || "Login failed";
    return;
  }
  palace.today = data.today || palace.today;
  showBot();
  await loadPalace();
  celebrate();
  if (Notification.permission === "default") Notification.requestPermission().catch(() => {});
});

$("logout-btn").addEventListener("click", async () => {
  stopTimer();
  await api("/api/logout", { method: "POST", body: "{}" });
  showLogin();
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

["board-want", "board-how"].forEach((id) => {
  $(id).addEventListener("input", persistBoardDraft);
});

$("seal-board-btn").addEventListener("click", async () => {
  const payload = currentBoardPayload();
  $("seal-board-btn").disabled = true;
  $("board-status").textContent = "Sealing…";
  try {
    const { res, data } = await api("/api/board", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.status === 401) {
      showLogin();
      return;
    }
    if (!res.ok) {
      $("board-status").textContent = data.error || "Could not seal";
      return;
    }
    saveTodayBoard(data.board);
    const sealed = loadJSON(STORAGE.sealed, {});
    sealed[todayEAT()] = data.markdown;
    saveJSON(STORAGE.sealed, sealed);
    $("board-output").textContent = data.markdown;
    $("board-status").textContent = data.stickerHint || "Sealed";
    setMoodForToday(data.board.mood);
    addSparkles(data.sparkleGain || 2);
    pushHistory({ kind: "board", output: data.markdown, mood: data.board.mood });
    updateMissionBar();
    celebrate();
  } catch (_) {
    $("board-status").textContent = "Network error";
  } finally {
    $("seal-board-btn").disabled = false;
  }
});

$("carry-todos-btn").addEventListener("click", () => {
  const open = boardTodos.filter((t) => t.text.trim() && !t.done);
  const fresh = emptyTodos();
  open.slice(0, 5).forEach((t, i) => {
    fresh[i] = { text: t.text, done: false };
  });
  boardTodos = fresh;
  renderTodoRows();
  persistBoardDraft();
  $("board-status").textContent = `Carried ${open.length} open to-do(s)`;
});

$("send-wrapup-btn").addEventListener("click", () => {
  const board = currentBoardPayload();
  const lines = [
    `## Want`,
    `- ${board.want || "(not set)"}`,
    "",
    `## How I'm doing`,
    `- ${board.how || "(not set)"}`,
    "",
    "## Board done",
    ...board.todos.filter((t) => t.text && t.done).map((t) => `- ${t.text}`),
    "",
    "## Board still open",
    ...board.todos.filter((t) => t.text && !t.done).map((t) => `- ${t.text}`),
  ];
  $("input").value = lines.join("\n");
  localStorage.setItem(STORAGE.draft, $("input").value);
  switchTab("wrapup");
});

$("inbox-add-btn").addEventListener("click", () => {
  const text = $("inbox-input").value.trim();
  if (!text) return;
  const items = getInbox();
  items.unshift({ text, at: new Date().toISOString() });
  saveInbox(items);
  $("inbox-input").value = "";
  renderInbox();
});

$("home-affirm-btn").addEventListener("click", async () => {
  const { res, data } = await api("/api/affirmation?refresh=1");
  if (res.ok) {
    $("home-affirmation").textContent = data.affirmation;
    celebrate();
  }
});

$("sample-btn").addEventListener("click", () => {
  $("input").value = SAMPLE;
  localStorage.setItem(STORAGE.draft, SAMPLE);
  $("status").textContent = "Sample loaded";
});

$("clear-btn").addEventListener("click", () => {
  $("input").value = "";
  $("output").textContent = "Waiting for your notes, princess…";
  $("status").textContent = "";
  localStorage.removeItem(STORAGE.draft);
});

function copyTextFallback(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.top = "-9999px";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (_) {
    ok = false;
  }
  ta.remove();
  return ok;
}

function selectOutputForManualCopy() {
  const output = $("output");
  const range = document.createRange();
  range.selectNodeContents(output);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

$("copy-btn").addEventListener("click", async () => {
  const text = $("output").textContent || "";
  if (!text.trim() || text.startsWith("Waiting")) {
    $("status").textContent = "Nothing to copy yet";
    return;
  }
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      $("status").textContent = "Copied";
      return;
    }
  } catch (_) {
    /* fall through to legacy copy */
  }
  if (copyTextFallback(text)) {
    $("status").textContent = "Copied";
    return;
  }
  // Last resort: highlight fairy output so the user can Ctrl/⌘+C
  selectOutputForManualCopy();
  $("status").textContent = "Selected — press Ctrl/⌘+C";
});

$("input").addEventListener("input", () => {
  const value = $("input").value;
  if (value.trim()) localStorage.setItem(STORAGE.draft, value);
  else localStorage.removeItem(STORAGE.draft);
});

$("run-btn").addEventListener("click", async () => {
  const input = $("input").value.trim();
  if (!input) {
    $("output").textContent = "Paste a few notes first.";
    return;
  }
  $("run-btn").disabled = true;
  $("status").textContent = "Sparkling…";
  try {
    const body = {
      input,
      mood: selectedWrapMood,
      board: $("merge-board-check").checked ? currentBoardPayload() : null,
    };
    const { res, data } = await api("/api/run", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      showLogin();
      return;
    }
    if (!res.ok) {
      $("output").textContent = data.error || "Something went wrong.";
      $("status").textContent = "";
      return;
    }
    $("output").textContent = data.output || "";
    $("status").textContent =
      data.mode === "ai-polished" ? "AI polish on" : "Local wrap-up";
    addSparkles(data.sparkleGain || 2);
    setMoodForToday(selectedWrapMood);
    pushHistory({ kind: "wrapup", output: data.output, mood: selectedWrapMood });
    celebrate();
  } catch (_) {
    $("output").textContent = "Network error — is the server running?";
    $("status").textContent = "";
  } finally {
    $("run-btn").disabled = false;
  }
});

$("timer-start-btn").addEventListener("click", startTimer);
$("timer-pause-btn").addEventListener("click", stopTimer);
$("timer-reset-btn").addEventListener("click", () => {
  stopTimer();
  timer.mode = "focus";
  timer.seconds = 25 * 60;
  paintTimer();
});
$("timer-break-btn").addEventListener("click", () => {
  stopTimer();
  timer.mode = "break";
  timer.seconds = 5 * 60;
  paintTimer();
  startTimer();
});

$("history-search").addEventListener("input", (e) => renderHistory(e.target.value));

$("weekly-btn").addEventListener("click", async () => {
  const boards = Object.values(getBoards()).slice(-7);
  const { res, data } = await api("/api/weekly-review", {
    method: "POST",
    body: JSON.stringify({
      boards,
      history: getHistory().slice(0, 30),
      habits: getHabitsLog(),
    }),
  });
  if (!res.ok) return;
  pushHistory({ kind: "weekly", output: data.output });
  addSparkles(data.sparkleGain || 1);
  $("history-search").value = "";
  renderHistory();
  celebrate();
});

$("export-btn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(getHistory(), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kitili-diary-${todayEAT()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

$("wipe-history-btn").addEventListener("click", () => {
  if (!confirm("Clear diary entries on this device?")) return;
  saveHistory([]);
  renderHistory();
});

$("backup-btn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(collectBackup(), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kitili-palace-backup-${todayEAT()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

$("restore-input").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    restoreBackup(JSON.parse(text));
    celebrate();
    alert("Backup restored on this device.");
  } catch (_) {
    alert("Could not restore that file.");
  }
  e.target.value = "";
});

$("stats-btn").addEventListener("click", async () => {
  const { res, data } = await api("/api/stats", {
    method: "POST",
    body: JSON.stringify({
      sparkles: getSparkles(),
      boards: getBoards(),
      moods: getMoodsLog(),
      history: getHistory(),
      habits: getHabitsLog(),
    }),
  });
  if (res.ok) $("stats-output").textContent = JSON.stringify(data.stats, null, 2);
});

$("help-btn").addEventListener("click", () => $("help-modal").classList.toggle("hidden"));
$("help-close").addEventListener("click", () => $("help-modal").classList.add("hidden"));
$("help-modal").addEventListener("click", (e) => {
  if (e.target === $("help-modal")) $("help-modal").classList.add("hidden");
});

window.addEventListener("keydown", (e) => {
  const tag = (e.target && e.target.tagName) || "";
  const typing = tag === "INPUT" || tag === "TEXTAREA";

  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    const homeOpen = !$("panel-home").hidden;
    if (homeOpen) $("seal-board-btn").click();
    else $("run-btn").click();
    return;
  }

  if (e.key === "?" && !typing) {
    e.preventDefault();
    $("help-modal").classList.toggle("hidden");
    return;
  }

  if (typing) return;

  if (e.key === "t") {
    if (timer.running) stopTimer();
    else startTimer();
    return;
  }

  if (e.key === "g") {
    gotoBuffer = "g";
    return;
  }
  if (gotoBuffer === "g") {
    gotoBuffer = "";
    if (e.key === "h") switchTab("home");
    if (e.key === "w") switchTab("wrapup");
    if (e.key === "f") switchTab("focus");
    if (e.key === "d") switchTab("history");
    if (e.key === "t") switchTab("tools");
  }
});

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstall = e;
  $("install-btn").hidden = false;
});

$("install-btn").addEventListener("click", async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  $("install-btn").hidden = true;
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(() => {
      $("sw-status").textContent = "Service worker: ready (offline shell cached)";
    })
    .catch(() => {
      $("sw-status").textContent = "Service worker: unavailable";
    });
} else {
  $("sw-status").textContent = "Service worker: not supported";
}

paintTimer();
checkSession();
