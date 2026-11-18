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

// the token /login hands back, it gets sent with every call after that so the backend knows who is asking
// it only lives in memory for now, so closing the app logs the user out
// (staying logged in comes with fingerprint / face log in, decision 14 in the object model)
let authToken = null;

// how long to wait for the backend before giving up, so a wrong API_URL does not leave a spinner going forever
const TIMEOUT_MS = 15000;

// the assistant gets longer, the backend can wait up to 20 seconds for the AI and then try once more
export const ASSISTANT_TIMEOUT_MS = 50000;

// small pause used in demo mode so the loading spinners still show up
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// shared helper for every call
// sends the request, and if the backend answers with an error it throws the "detail" message so the screen can show it
export async function request(path, options, fallbackMessage, timeoutMs = TIMEOUT_MS) {
  // the controller cancels the request if the timer runs out first
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response;
    try {
      // once logged in, every call carries the token in the Authorization header, the usual "Bearer <token>" form
      const headers = authToken ? { ...options.headers, Authorization: "Bearer " + authToken } : options.headers;
      response = await fetch(API_URL + path, { ...options, headers, signal: controller.signal });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error("The server took too long to answer. Try again in a moment.");
      }
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
    return data || {};
  } finally {
    clearTimeout(timer); // the answer came back (or failed), so the timer is not needed anymore
  }
}

// shortcut for a POST with a json body
function post(path, body, fallbackMessage, timeoutMs) {
  return request(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    },
    fallbackMessage,
    timeoutMs
  );
}

// POST /login -> { token }, or 401 with { detail }
export async function login(email, password) {
  let data;
  if (DEMO_MODE) {
    await wait(600);
    data = { token: "demo-token" };
  } else {
    data = await post("/login", { email, password }, "Could not sign in.");
  }
  if (typeof data.token !== "string" || !data.token) {
    throw new Error("Could not sign in."); // the backend said ok but did not send a token, so nothing after this would work
  }
  authToken = data.token;
  return data;
}

// forgets the token, the settings screen calls this when the user logs out
export function logout() {
  authToken = null;
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
  const data = await post(
    "/assistant",
    { messages, summary },
    "The assistant could not answer right now.",
    ASSISTANT_TIMEOUT_MS
  );
  if (typeof data.reply !== "string" || !data.reply) {
    throw new Error("The assistant could not answer right now.");
  }
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
