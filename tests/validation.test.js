import { test } from "node:test";
import assert from "node:assert/strict";
import { EMAIL_PATTERN, isFullName, safeNext, strongPassword } from "../docs/js/lib/validation.js";
import { firstName, initials, userName } from "../docs/js/lib/people.js";

test("safeNext only follows this site's page links", () => {
  assert.equal(safeNext("journey.html#step-aip-0", "dashboard.html"), "journey.html#step-aip-0");
  assert.equal(safeNext("https://evil.example", "dashboard.html"), "dashboard.html");
  assert.equal(safeNext("//evil.example", "dashboard.html"), "dashboard.html");
  assert.equal(safeNext("journey.html?x=1", "dashboard.html"), "dashboard.html");
  assert.equal(safeNext(null, "dashboard.html"), "dashboard.html");
  assert.equal(safeNext("javascript:alert(1)", "dashboard.html"), "dashboard.html");
  assert.equal(safeNext("../../evil.html", "dashboard.html"), "dashboard.html");
  assert.equal(safeNext("Dashboard.html", "dashboard.html"), "dashboard.html");
  assert.equal(safeNext("journey.html#step-aip-0\nevil", "dashboard.html"), "dashboard.html");
});

test("names need two words of two or more letters", () => {
  assert.equal(isFullName("Rodrigo"), false);
  assert.equal(isFullName("Rodrigo Brigido"), true);
  assert.equal(isFullName("  Seán   Ó Briain "), true);
  assert.equal(isFullName("A B"), false);
});

test("emails need an @ and a dot after it", () => {
  assert.equal(EMAIL_PATTERN.test("rodrigo@gmail"), false);
  assert.equal(EMAIL_PATTERN.test("rodrigo@gmail.com"), true);
});

test("new passwords need 8 characters, a capital and a symbol", () => {
  assert.equal(strongPassword("abcdefgh"), false);
  assert.equal(strongPassword("Abcdefgh"), false);
  assert.equal(strongPassword("Abcdefg!"), true);
  assert.equal(strongPassword("Abc!"), false);
});

test("initials use the first and last names, or the email", () => {
  const user = { email: "rb@example.com", user_metadata: { full_name: "Rodrigo Andrade Brigido" } };
  assert.equal(initials(user), "RB");
  assert.equal(firstName(user), "Rodrigo");
  assert.equal(userName(user), "Rodrigo Andrade Brigido");
  assert.equal(initials({ email: "x@example.com", user_metadata: {} }), "X");
});
