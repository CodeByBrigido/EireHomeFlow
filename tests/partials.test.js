import { test } from "node:test";
import assert from "node:assert/strict";
import { stampPartials } from "../tools/partials.js";

const HEADER = '<header class="site-header">\n  <nav>\n    <a class="nav__link" href="index.html" data-page="home">Home</a>\n    <a class="nav__link" href="guide.html" data-page="guide">Guide</a>\n  </nav>\n</header>\n';
const FOOTER = '<footer>Footer</footer>\n\n<div id="toast"></div>\n';
const read = (path) => ({ "partials/header.html": HEADER, "partials/footer.html": FOOTER })[path];
const page = (inner) => `<body data-page="guide">\n<div class="page">\n${inner}\n</div>\n</body>\n`;

test("an empty slot becomes the partial, indented, between markers", () => {
  const out = stampPartials(page('  <div data-include="partials/footer.html"></div>'), read);
  assert.equal(out, page([
    "  <!-- include partials/footer.html: edit that file, then run npm run partials -->",
    "  <footer>Footer</footer>",
    "",
    '  <div id="toast"></div>',
    "  <!-- /include -->",
  ].join("\n")));
});

test("the page's own nav link is marked active, the others are not", () => {
  const out = stampPartials(page('  <div data-include="partials/header.html"></div>'), read);
  assert.match(out, /<a class="nav__link is-active" aria-current="page" href="guide.html" data-page="guide">Guide<\/a>/);
  assert.match(out, /<a class="nav__link" href="index.html" data-page="home">Home<\/a>/);
});

test("stamping again changes nothing", () => {
  const once = stampPartials(page('  <div data-include="partials/header.html"></div>'), read);
  assert.equal(stampPartials(once, read), once);
});

test("a changed partial replaces the old copy", () => {
  const once = stampPartials(page('  <div data-include="partials/footer.html"></div>'), read);
  const twice = stampPartials(once, (path) => read(path).replace("Footer", "New footer"));
  assert.match(twice, /<footer>New footer<\/footer>/);
  assert.doesNotMatch(twice, /<footer>Footer<\/footer>/);
});

test("pages saved with Windows line endings are still recognised and come out as LF", () => {
  const once = stampPartials(page('  <div data-include="partials/footer.html"></div>'), read);
  const crlf = once.replace(/\n/g, "\r\n");
  const twice = stampPartials(crlf, (path) => read(path).replace("Footer", "New footer"));
  assert.match(twice, /<footer>New footer<\/footer>/);
  assert.doesNotMatch(twice, /\r/);
});

test("a slot the stamper can't read is an error, not a page without a header", () => {
  assert.throws(() => stampPartials(page('  <div data-include="partials/header.html" class="x"></div>'), read), /data-include/);
  assert.throws(() => stampPartials(page("  <!-- include partials/footer.html: edit that file, then run npm run partials -->\n  <footer>"), read), /include/);
});

test("the page name is matched literally", () => {
  const out = stampPartials(page('  <div data-include="partials/header.html"></div>').replace('data-page="guide"', 'data-page="g.ide"'), read);
  assert.doesNotMatch(out, /is-active/);
});

test("a missing partial is an error, not an empty header", () => {
  assert.throws(() => stampPartials(page('  <div data-include="partials/nope.html"></div>'), () => undefined), /partials\/nope\.html/);
});
