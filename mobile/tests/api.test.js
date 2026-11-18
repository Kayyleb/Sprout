// File: api.test.js
// Tests for the network code in api.js, fetch is swapped for a stand in so nothing really goes over the network
// these check what the screens get back when the backend answers, says no, is not running, or takes too long

import { request, askAssistant, ASSISTANT_TIMEOUT_MS } from "../api";

// makes a pretend response like the one fetch hands back
function reply(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status: status,
    json: async () => {
      if (typeof body === "string") throw new SyntaxError("not json"); // like an html error page
      return body;
    },
  };
}

// a fetch that never answers on its own, it only gives up when the request is cancelled (like a server that hangs)
function hangingFetch(url, options) {
  return new Promise((resolve, reject) => {
    options.signal.addEventListener("abort", () => reject(new Error("Aborted")));
  });
}

beforeEach(() => {
  global.fetch = jest.fn();
});
afterEach(() => {
  jest.useRealTimers();
  delete global.fetch;
});

test("a good answer is handed back as it came", async () => {
  fetch.mockResolvedValue(reply(200, { accounts: [1, 2] }));
  await expect(request("/balances", { method: "GET" }, "Fallback")).resolves.toEqual({ accounts: [1, 2] });
});

test("the backend's reason is shown when it says no", async () => {
  fetch.mockResolvedValue(reply(409, { detail: "That email is already taken." }));
  await expect(request("/create-account", {}, "Fallback")).rejects.toThrow("That email is already taken.");
});

test("the fallback message is used when the reason is not plain text", async () => {
  // a 422 from fastapi has a list in detail, not a sentence
  fetch.mockResolvedValue(reply(422, { detail: [{ msg: "Field required" }] }));
  await expect(request("/login", {}, "Could not sign in.")).rejects.toThrow("Could not sign in.");

  // a 404 means the end point is not built yet, "Not Found" would not mean anything to the user
  fetch.mockResolvedValue(reply(404, { detail: "Not Found" }));
  await expect(request("/login", {}, "Could not sign in.")).rejects.toThrow("Could not sign in.");

  // an html error page instead of json
  fetch.mockResolvedValue(reply(500, "<html>Internal Server Error</html>"));
  await expect(request("/login", {}, "Could not sign in.")).rejects.toThrow("Could not sign in.");
});

test("says the backend is not running when fetch itself fails", async () => {
  fetch.mockRejectedValue(new TypeError("Network request failed"));
  await expect(request("/login", {}, "Fallback")).rejects.toThrow("Could not reach the server. Is the backend running?");
});

test("gives up after 15 seconds instead of spinning forever", async () => {
  jest.useFakeTimers();
  fetch.mockImplementation(hangingFetch);

  const result = request("/balances", { method: "GET" }, "Fallback");
  const check = expect(result).rejects.toThrow("The server took too long to answer.");
  jest.advanceTimersByTime(15000);
  await check;
});

test("the timer is stopped once the answer comes back", async () => {
  jest.useFakeTimers();
  fetch.mockResolvedValue(reply(200, {}));

  await request("/", { method: "GET" }, "Fallback");
  expect(jest.getTimerCount()).toBe(0); // nothing left running in the background
});

test("the assistant sends the chat and the totals and hands back the reply", async () => {
  fetch.mockResolvedValue(reply(200, { reply: "You can afford them." }));
  const chat = [{ role: "user", text: "Can I afford my bills?" }];

  await expect(askAssistant(chat, { month: "November 2026" })).resolves.toBe("You can afford them.");

  const [url, options] = fetch.mock.calls[0];
  expect(url).toMatch(/\/assistant$/);
  expect(options.method).toBe("POST");
  expect(JSON.parse(options.body)).toEqual({ messages: chat, summary: { month: "November 2026" } });
});

test("the assistant gets longer to answer than other calls", async () => {
  jest.useFakeTimers();
  fetch.mockImplementation(hangingFetch);

  let finished = false;
  const result = askAssistant([{ role: "user", text: "hi" }], null).catch((error) => {
    finished = true;
    return error;
  });

  jest.advanceTimersByTime(15000);
  await Promise.resolve();
  expect(finished).toBe(false); // still waiting after the normal 15 seconds

  jest.advanceTimersByTime(ASSISTANT_TIMEOUT_MS - 15000);
  const error = await result;
  expect(error.message).toMatch("took too long");
});

test("an empty answer from the assistant counts as a failure, not a blank bubble", async () => {
  fetch.mockResolvedValue(reply(200, {}));
  await expect(askAssistant([{ role: "user", text: "hi" }], null)).rejects.toThrow("The assistant could not answer right now.");
});
