// File: api.js
// All of the network code lives here, every screen calls these functions instead of using fetch itself

import { demoBankAccounts, assistantQuestions, assistantFallback } from "./data/sampleData";

// where the backend is running, localhost only works on a simulator on the same computer
export const API_URL = "http://localhost:8000";

// DEMO_MODE = true  -> log in, create account and bank linking all succeed without the backend running,
//                      so the app can be clicked through on its own
// DEMO_MODE = false -> the functions below really call the backend at API_URL
export const DEMO_MODE = true;

// the assistant has its own switch, since it already has a working end point on the backend
// ASSISTANT_DEMO_MODE = true  -> canned answers to the suggested questions, no backend needed
// ASSISTANT_DEMO_MODE = false -> questions go to the backend, which asks the AI (needs GEMINI_API_KEY in .env)
export const ASSISTANT_DEMO_MODE = false;

// small pause used in demo mode so the loading spinners still show up
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// shared helper for every call
// sends the request, and if the backend answers with an error it throws the "detail" message so the screen can show it
async function request(path, options, fallbackMessage) {
  let response;
  try {
    response = await fetch(API_URL + path, options);
  } catch (error) {
    // fetch itself failed, the backend is probably not running
    throw new Error("Could not reach the server. Is the backend running?");
  }

  // the body should be json, but do not crash if it is not
  let data = {};
  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    // fastapi puts the reason in "detail", only use it when it is plain text
    // a 404 means the backend does not have this end point yet, its detail is just "Not Found" so the fallback reads better
    if (response.status !== 404 && data && typeof data.detail === "string") {
      throw new Error(data.detail);
    }
    throw new Error(fallbackMessage);
  }
  return data;
}

// shortcut for a POST with a json body
function post(path, body, fallbackMessage) {
  return request(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    },
    fallbackMessage
  );
}

// POST /login -> { token }, or 401 with { detail }
export async function login(email, password) {
  if (DEMO_MODE) {
    await wait(600);
    return { token: "demo-token" };
  }
  return post("/login", { email, password }, "Could not sign in.");
}

// POST /create-account -> { user_id }, or 409 with { detail } when the username or email is taken
export async function createAccount(username, email, password) {
  if (DEMO_MODE) {
    await wait(600);
    return { user_id: 1 };
  }
  return post("/create-account", { username, email, password }, "Could not create the account.");
}

// links a plaid sandbox account and gives back the access token
//  create link token -> gets a public token
//  exchange token -> swaps that for a real access token we can use
export async function linkBankAccount() {
  if (DEMO_MODE) {
    await wait(600);
    return "demo-access-token";
  }
  const linkData = await post("/create-link-token", {}, "Could not create a link token.");
  const exchangeData = await post(
    "/exchange-token",
    { public_token: linkData.public_token },
    "Could not exchange the token."
  );
  return exchangeData.access_token;
}

// POST /assistant -> { reply }, or an error with { detail } (no key yet, free limit used up...)
// messages is the chat so far, like [{ role: "user", text: "..." }, { role: "assistant", text: "..." }]
// summary is the month's totals from utils/summary.js
export async function askAssistant(messages, summary) {
  if (ASSISTANT_DEMO_MODE) {
    await wait(500);
    const question = messages[messages.length - 1].text;
    const match = assistantQuestions.find((item) => item.question === question);
    return match ? match.answer : assistantFallback;
  }
  const data = await post("/assistant", { messages, summary }, "The assistant could not answer right now.");
  return data.reply;
}

// GET /balances -> { accounts: [{ name, type, available, current }] }, this hands back just the accounts list
export async function getBalances(accessToken) {
  if (DEMO_MODE) {
    await wait(300);
    return demoBankAccounts;
  }
  const data = await request(
    "/balances?access_token=" + encodeURIComponent(accessToken),
    { method: "GET" },
    "Balances could not be loaded."
  );
  return data.accounts || [];
}
