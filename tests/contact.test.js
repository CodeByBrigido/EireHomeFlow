import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { contactBody, contactUrl, sendOutcome } from "../docs/js/lib/contact.js";
import { LIMITS, TOPICS } from "../supabase/functions/contact/index.js";

const fromRoot = (path) => new URL("../" + path, import.meta.url);

test("the form posts to the contact Edge Function of the Supabase project", () => {
  assert.equal(contactUrl("https://abc.supabase.co"), "https://abc.supabase.co/functions/v1/contact");
  assert.equal(contactUrl("https://abc.supabase.co/"), "https://abc.supabase.co/functions/v1/contact");
  assert.equal(contactUrl(""), "", "no Supabase project, nowhere to send");
});

test("the form sends its fields trimmed, the bot trap and the page's language", () => {
  const body = contactBody({ name: " Ana Silva ", email: " ana@example.com ", topic: "idea", message: " Hello \n", website: "" }, "pt");
  assert.deepEqual(body, { name: "Ana Silva", email: "ana@example.com", topic: "idea", message: "Hello", website: "", locale: "pt" });
});

test("the function's answer becomes sent, tooMany or failed", () => {
  assert.equal(sendOutcome(200), "sent");
  assert.equal(sendOutcome(429), "tooMany");
  for (const status of [400, 403, 404, 500, 502]) assert.equal(sendOutcome(status), "failed");
});

test("the page and the function agree on the topics and the limits", () => {
  const html = readFileSync(fromRoot("docs/contact.html"), "utf8");
  const options = [...html.matchAll(/<option value="(\w+)"/g)].map((m) => m[1]);
  assert.deepEqual(options, Object.keys(TOPICS));
  const english = JSON.parse(readFileSync(fromRoot("docs/locales/en/contact.json"), "utf8"));
  assert.deepEqual(english.topics, TOPICS, "the email shows the same English topic the reader chose");
  assert.match(html, new RegExp(`name="name"[^>]*maxlength="${LIMITS.name}"`));
  assert.match(html, new RegExp(`name="message"[^>]*maxlength="${LIMITS.message}"`));
  assert.match(html, /<input type="text" name="website" tabindex="-1" autocomplete="off">/);
});
