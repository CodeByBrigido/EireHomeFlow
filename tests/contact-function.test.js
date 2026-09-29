// The contact Edge Function, run in Node with stand-ins for Resend and the database.
import { test } from "node:test";
import assert from "node:assert/strict";
import { FROM, PER_HOUR, TO, checkMessage, emailFor, handle, hmac } from "../supabase/functions/contact/index.js";

const SITE = "https://codebybrigido.github.io";
const good = { name: "Ana Silva", email: "ana@example.com", topic: "correction", message: "Step 3 says €3,050.\nIs that right?", locale: "pt", website: "" };

function services({ recent = 0, sendFails = false, saveFails = false } = {}) {
  const calls = { sent: [], saved: [], counted: [] };
  return {
    calls,
    now: () => new Date("2026-09-29T10:00:00Z"),
    hash: async (ip) => "hash-of-" + ip,
    recentFrom: async (ipHash, since) => { calls.counted.push({ ipHash, since }); return recent; },
    send: async (email) => { if (sendFails) throw new Error("Resend is down"); calls.sent.push(email); },
    save: async (row) => { if (saveFails) throw new Error("database is down"); calls.saved.push(row); },
  };
}

// A stand-in for the request: browsers (and some fetch versions) will not let a script set Origin.
const request = (method, origin, body = "") => ({
  method,
  headers: { get: (name) => ({ origin, "x-forwarded-for": "203.0.113.7, 10.0.0.1" })[name.toLowerCase()] ?? null },
  json: async () => JSON.parse(body),
});
const post = (body, origin = SITE) => request("POST", origin, typeof body === "string" ? body : JSON.stringify(body));

// The function logs what went wrong; keep the test output clean.
const quietly = async (run) => {
  const error = console.error;
  console.error = () => {};
  try { return await run(); } finally { console.error = error; }
};

test("a message is checked: name, email, a known topic and a message within the limits", () => {
  assert.deepEqual(checkMessage({ ...good, name: "  Ana Silva " }), { name: "Ana Silva", email: "ana@example.com", topic: "correction", message: good.message, locale: "pt" });
  assert.equal(checkMessage({ ...good, email: "ana@example" }), null);
  assert.equal(checkMessage({ ...good, topic: "sales" }), null);
  assert.equal(checkMessage({ ...good, topic: "toString" }), null, "only the form's own topics");
  assert.equal(checkMessage({ ...good, name: "Ana\nBcc: x@y.z" }), null);
  assert.equal(checkMessage({ ...good, message: "   " }), null);
  assert.equal(checkMessage({ ...good, message: "a".repeat(1501) }), null);
  assert.equal(checkMessage({ ...good, name: 42 }), null);
  assert.equal(checkMessage(null), null);
  assert.equal(checkMessage({ ...good, locale: "<b>" }).locale, "", "an odd language code is dropped");
});

test("the email goes to us, from Resend's address, with Reply-To set to the sender", () => {
  const email = emailFor(checkMessage(good), new Date("2026-09-29T10:00:00Z"));
  assert.equal(email.from, FROM);
  assert.deepEqual(email.to, [TO]);
  assert.equal(email.reply_to, "ana@example.com");
  assert.equal(email.subject, "Contact form: A figure or fact to correct (Ana Silva)");
  assert.match(email.text, /^Step 3 says €3,050\.\nIs that right\?\n/);
  assert.match(email.text, /From: Ana Silva <ana@example\.com>\nTopic: A figure or fact to correct\nSite language: pt\nSent: 2026-09-29T10:00:00\.000Z$/);
});

test("only the site and a local copy of it may call the function", async () => {
  const s = services();
  const preflight = await handle(request("OPTIONS", SITE), s);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), SITE);
  assert.match(preflight.headers.get("access-control-allow-headers"), /apikey/);
  const local = await handle(request("OPTIONS", "http://localhost:8000"), s);
  assert.equal(local.status, 204);
  for (const origin of ["https://evil.example", "https://codebybrigido.github.io.evil.example", null]) {
    assert.equal((await handle(post(good, origin), s)).status, 403, origin || "no origin");
  }
  assert.equal((await handle(request("GET", SITE), s)).status, 405);
  assert.equal(s.calls.sent.length + s.calls.saved.length, 0);
});

test("a good message is emailed and saved, with the IP address only as a hash", async () => {
  const s = services();
  const response = await handle(post(good), s);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(response.headers.get("access-control-allow-origin"), SITE);
  assert.equal(s.calls.sent.length, 1);
  assert.deepEqual(s.calls.saved, [{ ...checkMessage(good), ip_hash: "hash-of-203.0.113.7", emailed: true }]);
  assert.equal(s.calls.counted[0].since.toISOString(), "2026-09-29T09:00:00.000Z", "counts the last hour");
});

test("a bot that fills in the hidden field is thanked and ignored", async () => {
  const s = services();
  const response = await handle(post({ ...good, website: "http://spam.example" }), s);
  assert.equal(response.status, 200);
  assert.equal(s.calls.sent.length + s.calls.saved.length, 0);
});

test("a wrong form or a body that is not JSON gets 400", async () => {
  const s = services();
  assert.equal((await handle(post({ ...good, email: "nope" }), s)).status, 400);
  assert.equal((await handle(post("not json"), s)).status, 400);
  assert.equal(s.calls.sent.length, 0);
});

test("after the hourly limit, the same address gets 429", async () => {
  const s = services({ recent: PER_HOUR });
  const response = await handle(post(good), s);
  assert.equal(response.status, 429);
  assert.deepEqual(await response.json(), { error: "tooMany" });
  assert.equal(s.calls.sent.length, 0);
});

test("the message counts as sent if either the email or the saved copy worked", async () => {
  const noEmail = services({ sendFails: true });
  assert.equal((await quietly(() => handle(post(good), noEmail))).status, 200);
  assert.equal(noEmail.calls.saved[0].emailed, false, "the copy says the email did not go");
  const noCopy = services({ saveFails: true });
  assert.equal((await quietly(() => handle(post(good), noCopy))).status, 200);
  const nothing = services({ sendFails: true, saveFails: true });
  const response = await quietly(() => handle(post(good), nothing));
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: "failed" });
});

test("the IP hash is a keyed SHA-256, the same for the same address", async () => {
  const a = await hmac("secret", "203.0.113.7");
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.equal(await hmac("secret", "203.0.113.7"), a);
  assert.notEqual(await hmac("other", "203.0.113.7"), a);
});
