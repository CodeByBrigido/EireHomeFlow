import { test } from "node:test";
import assert from "node:assert/strict";
import { firstName, initials, isNewAccount, userName } from "../docs/js/lib/people.js";

const person = (meta, extra = {}) => ({ email: "aoife@example.ie", user_metadata: meta, ...extra });

test("userName prefers the name set in My profile over the one Google sends", () => {
  assert.equal(userName(person({ full_name: "Aoife Byrne" })), "Aoife Byrne");
  assert.equal(userName(person({ display_name: "Aoife B", full_name: "Aoife Byrne" })), "Aoife B");
  assert.equal(userName(person({ name: "Aoife Google" })), "Aoife Google");
  assert.equal(userName(person({})), "");
  assert.equal(userName(null), "");
  assert.equal(firstName(person({ full_name: "  Aoife   Byrne " })), "Aoife");
  assert.equal(initials(person({ name: "Aoife Mary Byrne" })), "AB");
  assert.equal(initials(person({})), "A");
});

test("isNewAccount is true only on the sign-in that created the account", () => {
  assert.equal(isNewAccount(person({}, { created_at: "2026-09-28T10:00:00Z", last_sign_in_at: "2026-09-28T10:00:02Z" })), true);
  assert.equal(isNewAccount(person({}, { created_at: "2026-09-01T10:00:00Z", last_sign_in_at: "2026-09-28T10:00:00Z" })), false);
  assert.equal(isNewAccount(person({})), false);
});
