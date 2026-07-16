const loginView = document.getElementById("login-view");
const botView = document.getElementById("bot-view");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");
const runBtn = document.getElementById("run-btn");
const inputEl = document.getElementById("input");
const outputEl = document.getElementById("output");
const statusEl = document.getElementById("status");

function showLogin() {
  loginView.classList.remove("hidden");
  botView.classList.add("hidden");
}

function showBot() {
  loginView.classList.add("hidden");
  botView.classList.remove("hidden");
}

async function checkSession() {
  try {
    const res = await fetch("/api/me", { credentials: "same-origin" });
    if (res.ok) {
      showBot();
      return;
    }
  } catch (_) {
    /* offline / first load */
  }
  showLogin();
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    loginError.textContent = data.error || "Login failed";
    return;
  }
  showBot();
});

logoutBtn.addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
  showLogin();
});

runBtn.addEventListener("click", async () => {
  const input = inputEl.value.trim();
  if (!input) {
    outputEl.textContent = "Please paste some notes first.";
    return;
  }

  runBtn.disabled = true;
  statusEl.textContent = "Running…";
  outputEl.textContent = "Working…";

  try {
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ input }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      showLogin();
      loginError.textContent = "Session expired — please log in again.";
      return;
    }
    if (!res.ok) {
      outputEl.textContent = data.error || "Something went wrong.";
      statusEl.textContent = "";
      return;
    }
    outputEl.textContent = data.output || "(empty response)";
    statusEl.textContent = data.mode === "ai-polished" ? "AI polish on" : "Local wrap-up";
  } catch (err) {
    outputEl.textContent = "Network error — is the server running?";
    statusEl.textContent = "";
  } finally {
    runBtn.disabled = false;
  }
});

checkSession();
