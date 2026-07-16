/**
 * Optional AI polish — API key is used ONLY on the server.
 * Supports OpenAI-compatible chat completions (OpenAI, Groq, etc.).
 */

async function polishWrapup(notesText, draftWrapup, apiKey) {
  if (!apiKey) return null;

  const baseUrl = (process.env.API_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    ""
  );
  const model = process.env.API_MODEL || "gpt-4o-mini";

  const system = [
    "You are Kitili's personal Daily Wrap-Up bot.",
    "Tone: direct, practical, East Africa timezone (EAT).",
    "Rewrite the draft wrap-up so it is clear and actionable.",
    "Keep the exact markdown sections: ## Done, ## Doing, ## Next.",
    "Max 5 bullets per section. No fluff.",
  ].join(" ");

  const user = [
    "Original notes:",
    notesText,
    "",
    "Draft wrap-up:",
    draftWrapup,
    "",
    "Return only the final markdown wrap-up.",
  ].join("\n");

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`AI request failed (${res.status})`);
    err.status = res.status;
    err.detail = body.slice(0, 300);
    throw err;
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  return text || null;
}

module.exports = { polishWrapup };
