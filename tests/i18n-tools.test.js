import { test } from "node:test";
import assert from "node:assert/strict";
import {
  flatten, generatedBlock, hardcodedStrings, htmlKeys, htmlProblems, messagesVersion, numbersIn, placeholders,
  pluralNeeds, scriptKeys, stampBoot, stampHtml, tagsOf, untranslatedText, validate,
} from "../tools/i18n.js";

test("flatten lists texts, plural texts and array items with full keys", () => {
  const { entries, arrays } = flatten({ a: { b: "B", n: { one: "{count} day", other: "{count} days" } }, list: ["x", "y"] }, "ns");
  assert.deepEqual([...entries.keys()], ["ns:a.b", "ns:a.n", "ns:list.0", "ns:list.1"]);
  assert.equal(entries.get("ns:a.n").kind, "plural");
  assert.equal(arrays.get("ns:list"), 2);
  assert.equal(flatten({ bad: 3 }, "ns").entries.get("ns:bad").kind, "invalid");
});

test("placeholders and tags are read from a text", () => {
  assert.deepEqual(placeholders("{b} and {a}, then {a}"), ["a", "b"]);
  assert.deepEqual(tagsOf('Read our <a href="terms.html">Terms</a>.'), ['a href="terms.html"', "/a"]);
});

test("numbersIn reads each language's own number format", () => {
  assert.deepEqual(numbersIn("Solicitor: €2,000-3,000, then 13.5%", "en-IE"), [13.5, 2000, 3000]);
  assert.deepEqual(numbersIn("Anwalt: 2.000-3.000 €, dann 13,5 %", "de-DE"), [13.5, 2000, 3000]);
  assert.deepEqual(numbersIn("Avocat : 2 000-3 000 €, puis 13,5 %", "fr-FR"), [13.5, 2000, 3000]);
  assert.deepEqual(numbersIn("Step 1 of 31: {title}", "en-IE"), [1, 31]);
  assert.deepEqual(numbersIn('<a href="journey.html#step-aip-0">link</a>', "en-IE"), []);
});

test("pluralNeeds asks each language for the forms whole numbers use", () => {
  assert.deepEqual(pluralNeeds("en-IE").needed.sort(), ["one", "other"]);
  assert.deepEqual(pluralNeeds("pl-PL").needed.sort(), ["few", "many", "one", "other"]);
});

test("htmlKeys finds text, HTML and attribute keys", () => {
  const html = '<p data-i18n="a:x">X</p><div data-i18n-html="a:y">Y <b>b</b></div><img alt="Z" data-i18n-alt="a:z">';
  assert.deepEqual(htmlKeys(html).map((ref) => [ref.key, ref.kind]), [["a:x", "text"], ["a:y", "html"], ["a:z", "alt"]]);
});

test("stampHtml writes the English into the page and changes nothing the second time", () => {
  const texts = { "a:x": "Fish & chips", "a:y": 'Read <a href="terms.html">this</a>', "a:z": 'A "quoted" alt' };
  const html = '<p data-i18n="a:x">old</p>\n<p data-i18n-html="a:y">old</p>\n<img src="i.png" alt="old" data-i18n-alt="a:z">';
  const once = stampHtml(html, (key) => texts[key]);
  assert.equal(once, '<p data-i18n="a:x">Fish &amp; chips</p>\n<p data-i18n-html="a:y">Read <a href="terms.html">this</a></p>\n<img src="i.png" alt="A &quot;quoted&quot; alt" data-i18n-alt="a:z">');
  assert.equal(stampHtml(once, (key) => texts[key]), once);
  assert.equal(stampHtml(html, () => undefined), html, "unknown keys are left alone");
});

test("htmlProblems reports markup the runtime cannot translate", () => {
  assert.match(htmlProblems('<p data-i18n="a:x">Text <a href="x.html">link</a></p>').join(), /data-i18n-html/);
  assert.match(htmlProblems('<div data-i18n-html="a:x"><span data-i18n="a:y">Y</span></div>').join(), /inside another/);
  assert.match(htmlProblems('<p data-i18n="not a key">X</p>').join(), /not a key/);
  assert.match(htmlProblems('<img src="a.png" data-i18n-alt="a:x">').join(), /needs a alt/);
  assert.deepEqual(htmlProblems('<p data-i18n="a:x">X</p>'), []);
});

test("untranslatedText finds visible words without a key", () => {
  const html = [
    "<!DOCTYPE html><html><head><title data-i18n=\"a:t\">T</title></head><body>",
    '<p>Hello there</p>',
    '<p data-i18n="a:x">Covered</p>',
    '<span translate="no">ÉireHome Flow</span>',
    '<div data-i18n-source-only><p>Legal text</p></div>',
    '<button aria-label="Close menu">×</button>',
    '<button aria-label="Close" data-i18n-aria-label="a:c">×</button>',
    '<script>const x = "Not text";</script>',
    "</body></html>",
  ].join("\n");
  assert.deepEqual(untranslatedText(html).map((found) => found.text), ["Hello there", 'aria-label="Close menu"']);
});

test("scriptKeys reads keys, and templates as patterns; comments are ignored", () => {
  const js = [
    '// t("calculator:only.in.a.comment")',
    'bind("x", t("common:nav.home"));',
    "const title = t(`calculator:verdict.${kind}.title`);",
  ].join("\n");
  const { keys, patterns } = scriptKeys(js, ["common", "calculator"]);
  assert.deepEqual(keys.map((ref) => ref.key), ["common:nav.home"]);
  assert.equal(patterns.length, 1);
  assert.ok(patterns[0].regex.test("calculator:verdict.within.title"));
  assert.ok(!patterns[0].regex.test("calculator:verdict.within.body"));
});

test("hardcodedStrings spots sentences written into scripts", () => {
  const js = 'showToast("You have signed out now.");\nconsole.error("Could not load the list here.");\nthrow new Error("Only for developers here"); // i18n-ignore\nbind("x", t("common:a"));';
  assert.deepEqual(hardcodedStrings(js).map((found) => found.line), [1]);
});

test("the runtime's generated block is rewritten between its markers", () => {
  const boot = "(function () {\n  // i18n:generated by npm run i18n\n  var LOCALES = [];\n  var MESSAGES_VERSION = \"\";\n  // /i18n:generated\n})();\n";
  const block = generatedBlock([{ code: "en", tag: "en-IE", name: "English", status: "complete" }], { en: ["common"] }, "abc");
  const out = stampBoot(boot, block);
  assert.match(out, /"namespaces":\["common"\]/);
  assert.match(out, /MESSAGES_VERSION = "abc"/);
  assert.equal(stampBoot(out, block), out);
  assert.throws(() => stampBoot("no markers", block), /i18n:generated/);
});

test("messagesVersion changes when any text changes", () => {
  const a = messagesVersion([{ path: "locales/en/common.json", text: "{}" }]);
  assert.equal(a, messagesVersion([{ path: "locales/en/common.json", text: "{}" }]));
  assert.notEqual(a, messagesVersion([{ path: "locales/en/common.json", text: '{"a":"b"}' }]));
});

// A small site for validate(): one page, one script, English and one other language.
function site(pt, { ptStatus = "complete", page, script } = {}) {
  const en = { common: { nav: { home: "Home" }, price: "Up to €30,000 or 10%", link: 'Read <a href="terms.html">the terms</a>', count: { one: "{count} step", other: "{count} steps" } } };
  const locales = [
    { code: "en", tag: "en-IE", name: "English", status: "complete" },
    { code: "pt", tag: "pt-BR", name: "Português", status: ptStatus },
  ];
  const files = { en: ["common"], pt: pt ? ["common"] : [] };
  const html = page || '<!DOCTYPE html>\n<html lang="en-IE" data-i18n-ns="common">\n<head>\n<script src="js/i18n-boot.js?v=20260101"></script>\n<link rel="stylesheet" href="css/styles.css?v=20260101">\n<script type="module" src="js/pages/home.js?v=20260101"></script>\n</head>\n<body>\n<a data-i18n="common:nav.home">Home</a>\n<p data-i18n="common:price">Up to €30,000 or 10%</p>\n<p data-i18n-html="common:link">Read <a href="terms.html">the terms</a></p>\n</body>\n</html>\n';
  const bootText = "  // i18n:generated\n  var LOCALES = [];\n  var MESSAGES_VERSION = \"\";\n  // /i18n:generated\n";
  return {
    locales, namespaces: ["common"], source: "en", folders: pt ? ["en", "pt"] : ["en"], files, version: "v1", problems: [],
    messages: { en, pt: pt ? { common: pt } : {} },
    pages: [{ file: "docs/index.html", html }],
    partials: [],
    scripts: [{ file: "docs/js/pages/home.js", dir: "pages", js: script || 'bind("n", t("common:count", { count: 2 }));' }],
    boot: { file: "docs/js/i18n-boot.js", text: stampBoot(bootText, generatedBlock(locales, files, "v1")) },
  };
}
const goodPt = { nav: { home: "Início" }, price: "Até € 30.000 ou 10%", link: 'Leia <a href="terms.html">os termos</a>', count: { one: "{count} etapa", other: "{count} etapas" } };

test("validate passes a complete, consistent site", () => {
  const report = validate(site(goodPt));
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.coverage.map((row) => [row.code, row.translated, row.total]), [["en", 4, 4], ["pt", 4, 4]]);
});

test("validate fails a complete language with a missing text, but not a draft", () => {
  const partial = { ...goodPt, price: undefined };
  delete partial.price;
  assert.match(validate(site(partial)).errors.join("\n"), /pt is marked complete, but 1 texts are not translated: common:price/);
  assert.deepEqual(validate(site(partial, { ptStatus: "draft" })).errors, []);
});

test("validate catches inconsistent translations", () => {
  const errors = (pt) => validate(site({ ...goodPt, ...pt })).errors.join("\n");
  assert.match(errors({ price: "Até € 25.000 ou 10%" }), /numbers \[10, 25000\] but English has \[10, 30000\]/);
  assert.match(errors({ price: "Até 30.000 ou 10%" }), /has 0 "€" but English has 1/);
  assert.match(errors({ link: 'Leia <a href="privacy.html">os termos</a>' }), /tags differ from English/);
  assert.match(errors({ count: { one: "{n} etapa", other: "{n} etapas" } }), /uses \{n\}/);
  assert.match(errors({ count: "etapas" }), /English has a plural text here/);
  assert.match(errors({ nav: { home: "Início", extra: "Mais" } }), /common:nav.extra is not in English/);
  assert.match(errors({ nav: { home: "Início — casa" } }), /em dash/);
  assert.match(errors({ nav: { home: "" } }), /is empty/);
});

test("validate finds missing, unused and misplaced keys, and text without keys", () => {
  const unusedKey = site(goodPt, { script: "bind(\"n\", \"\");" });
  assert.match(validate(unusedKey).errors.join("\n"), /common:count in locales\/en is not used|common:count is not used by any page or script/);
  const missingKey = site(goodPt, { script: 'bind("n", t("common:nope"));' });
  assert.match(validate(missingKey).errors.join("\n"), /common:nope is not in locales\/en\/common.json/);
  const bare = site(goodPt).pages[0].html.replace("</body>", "<p>Plain words</p>\n</body>");
  assert.match(validate(site(goodPt, { page: bare })).errors.join("\n"), /"Plain words" is shown without a translation key/);
  const stale = site(goodPt).pages[0].html.replace(">Home<", ">Start<");
  assert.match(validate(site(goodPt, { page: stale })).errors.join("\n"), /differs from locales\/en\. Run npm run i18n/);
  const noBoot = site(goodPt).pages[0].html.replace('<script src="js/i18n-boot.js?v=20260101"></script>\n', "");
  assert.match(validate(site(goodPt, { page: noBoot })).errors.join("\n"), /must load <script src="js\/i18n-boot\.js/);
});
