import { test } from "node:test";
import assert from "node:assert/strict";
import { esc, euro, num } from "../docs/js/lib/format.js";

test("num reads form values and treats junk as 0", () => {
  assert.equal(num("45000"), 45000);
  assert.equal(num(""), 0);
  assert.equal(num("abc"), 0);
});

test("euro rounds to whole euros with Irish grouping", () => {
  assert.equal(euro(209851.4), "€209,851");
  assert.equal(euro(0), "€0");
});

test("esc escapes the characters that matter in innerHTML", () => {
  assert.equal(esc('<a href="x">&</a>'), "&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
});
