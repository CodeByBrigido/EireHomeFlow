import { test } from "node:test";
import assert from "node:assert/strict";
import { esc, euro, formatDate, formatMoney, formatNumber, formatPercent, num } from "../docs/js/lib/format.js";

// Intl puts no-break spaces in some languages' numbers; compare with plain spaces.
const plain = (text) => text.replace(/[\u00a0\u202f]/g, " ");

test("num reads form values and treats junk as 0", () => {
  assert.equal(num("45000"), 45000);
  assert.equal(num(""), 0);
  assert.equal(num("abc"), 0);
});

test("euro rounds to whole euros with Irish grouping", () => {
  assert.equal(euro(209851.4), "€209,851");
  assert.equal(euro(0), "€0");
  assert.equal(euro(-0.4), "€0");
});

test("formatMoney writes euros the way each language does", () => {
  assert.equal(formatMoney(209851.4, "en-IE"), "€209,851");
  assert.equal(plain(formatMoney(209851, "de-DE")), "209.851 €");
  assert.equal(plain(formatMoney(209851, "fr-FR")), "209 851 €");
  assert.equal(plain(formatMoney(209851, "pt-BR")), "€ 209.851");
  assert.equal(plain(formatMoney(209851, "ro-RO")), "209.851 €");
  assert.equal(plain(formatMoney(209851, "lt-LT")), "209 851 €");
  assert.equal(plain(formatMoney(209851, "pl-PL")), "209 851 €");
  // Polish groups only from five digits; Lithuanian groups four as well.
  assert.equal(plain(formatMoney(1613, "pl-PL")), "1613 €");
  assert.equal(plain(formatMoney(1613, "lt-LT")), "1 613 €");
});

test("formatNumber and formatPercent use the language's decimal mark", () => {
  assert.equal(formatNumber(3.5, "en-IE"), "3.5");
  assert.equal(formatNumber(3.5, "de-DE"), "3,5");
  assert.equal(formatPercent(0.039, "en-IE", 2), "3.90%");
  assert.equal(plain(formatPercent(0.039, "fr-FR", 2)), "3,90 %");
  assert.equal(formatPercent(0.4, "it-IT"), "40%");
  assert.equal(formatPercent(0.1, "pl-PL"), "10%");
  assert.equal(plain(formatPercent(0.1, "ro-RO")), "10 %");
});

test("formatDate writes a long date in the language", () => {
  assert.equal(formatDate("2026-09-28T12:00:00Z", "en-IE"), "28 September 2026");
  assert.equal(formatDate("2026-09-28T12:00:00Z", "pt-BR"), "28 de setembro de 2026");
  assert.equal(formatDate("2026-09-28T12:00:00Z", "lt-LT"), "2026 m. rugsėjo 28 d.");
});

test("esc escapes the characters that matter in innerHTML", () => {
  assert.equal(esc('<a href="x">&</a>'), "&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
});
