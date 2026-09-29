import { test } from "node:test";
import assert from "node:assert/strict";
import { CONTACT_EMAIL, mailtoLink } from "../docs/js/lib/contact.js";

test("the contact form writes an email to us with the topic, the message and who wrote it", () => {
  const link = mailtoLink({ topic: "My account", name: " Ana Silva ", email: "ana@example.com", message: "Hello & thanks?\nLine two" });
  assert.ok(link.startsWith(`mailto:${CONTACT_EMAIL}?subject=`));
  const params = new URLSearchParams(link.slice(link.indexOf("?") + 1));
  assert.equal(params.get("subject"), "ÉireHome Flow: My account");
  assert.equal(params.get("body"), "Hello & thanks?\nLine two\r\n\r\nAna Silva\r\nana@example.com");
  assert.ok(!link.includes(" "), "no raw spaces in the link");
});
