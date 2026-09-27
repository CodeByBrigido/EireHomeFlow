import { test } from "node:test";
import assert from "node:assert/strict";
import { bumpText, findVersions, today, unversionedRefs } from "../tools/versions.js";

test("findVersions lists every ?v= number", () => {
  const html = '<link href="css/styles.css?v=20260924"><script src="js/pages/home.js?v=20260925"></script>';
  assert.deepEqual(findVersions(html), ["20260924", "20260925"]);
});

test("unversionedRefs finds relative imports without ?v=", () => {
  const js = 'import { a } from "./a.js?v=20260924";\nimport { b } from "../lib/b.js";\nimport("./c.js");';
  assert.deepEqual(unversionedRefs(js), ["../lib/b.js", "./c.js"]);
});

test("unversionedRefs finds local scripts and stylesheets without ?v= in HTML", () => {
  const html = '<script type="module" src="js/pages/home.js"></script><link rel="stylesheet" href="css/styles.css">';
  assert.deepEqual(unversionedRefs(html), ["js/pages/home.js", "css/styles.css"]);
});

test("unversionedRefs ignores external links, partials and versioned files", () => {
  const html = '<a href="https://example.com/a.js">x</a><div data-include="partials/header.html"></div><script src="js/app.js?v=20260924"></script>';
  assert.deepEqual(unversionedRefs(html), []);
});

test("unversionedRefs also reads single-quoted attributes", () => {
  assert.deepEqual(unversionedRefs("<script src='js/app.js'></script><link href='css/a.css?v=20260924'>"), ["js/app.js"]);
});

test("bumpText replaces every number with one version", () => {
  assert.equal(bumpText("a?v=20260924 b?v=20260925", "20261001"), "a?v=20261001 b?v=20261001");
});

test("today is an eight-digit date", () => {
  assert.match(today(), /^\d{8}$/);
});
