import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { NAMESPACES } from "../docs/js/lib/locales.js";
import { generatedBlock, stampBoot } from "../tools/i18n.js";

// js/i18n-boot.js is a classic script for the browser's <head>. Here it runs in a sandbox with
// just enough of a browser: a page element, storage, the browser's languages and a fetch that
// never answers, so each test sees what the runtime decides straight away.
// The runtime gets a fixed language list, so these tests do not change when a language is added
// or finished: here Polish is a draft that only has common.json.
const LOCALES = [
  { code: "en", tag: "en-IE", name: "English", status: "complete" },
  { code: "pt", tag: "pt-BR", name: "Português (Brasil)", status: "complete" },
  { code: "es", tag: "es-ES", name: "Español", status: "complete" },
  { code: "fr", tag: "fr-FR", name: "Français", status: "complete" },
  { code: "de", tag: "de-DE", name: "Deutsch", status: "complete" },
  { code: "it", tag: "it-IT", name: "Italiano", status: "complete" },
  { code: "pl", tag: "pl-PL", name: "Polski", status: "draft" },
];
const FILES = Object.fromEntries(LOCALES.map((locale) => [locale.code, locale.status === "complete" ? NAMESPACES : ["common"]]));
const VERSION = "test-version";
const source = stampBoot(readFileSync(new URL("../docs/js/i18n-boot.js", import.meta.url), "utf8"), generatedBlock(LOCALES, FILES, VERSION));

function storage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => { data.set(key, String(value)); },
    removeItem: (key) => { data.delete(key); },
    key: (i) => [...data.keys()][i] ?? null,
    get length() { return data.size; },
  };
}

function boot({ languages = ["en-IE"], choice, query = "", preview, cached = {}, raw = {}, ns = "common" } = {}) {
  const local = storage({ ...(choice ? { "eirehome-locale": choice } : {}), ...raw });
  for (const [id, texts] of Object.entries(cached)) local.setItem("eirehome-i18n:" + id, VERSION + "|" + JSON.stringify(texts));
  const session = storage(preview ? { "eirehome-locale-preview": preview } : {});
  const attributes = { "data-i18n-ns": ns };
  const html = {
    lang: "en-IE",
    getAttribute: (name) => attributes[name] ?? null,
    setAttribute: (name, value) => { attributes[name] = value; },
    classList: { add() {}, remove() {} },
    attributes,
  };
  const fetched = [];
  const sandbox = {
    localStorage: local,
    sessionStorage: session,
    navigator: { languages },
    location: { search: query, href: "http://localhost/EireHomeFlow/index.html" + query },
    document: {
      documentElement: html,
      currentScript: { src: "http://localhost/EireHomeFlow/js/i18n-boot.js?v=20260101" },
      head: { appendChild() {} },
      createElement: () => ({}),
      addEventListener() {},
      readyState: "loading",
    },
    addEventListener() {},
    fetch: (url) => { fetched.push(url); return new Promise(() => {}); },
    MutationObserver: class { observe() {} },
    URL, URLSearchParams, console,
    setTimeout: () => 0,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  return { api: sandbox.EireI18n, attributes, html, local, session, fetched };
}

test("the browser's language is used on a first visit, and nothing is saved", () => {
  const { api, html, attributes, local } = boot({ languages: ["pt-BR", "en-GB"] });
  assert.equal(api.locale, "pt");
  assert.equal(html.lang, "pt-BR");
  assert.equal(attributes["data-locale"], "pt");
  assert.equal(local.getItem("eirehome-locale"), null);
});

test("unsupported and draft languages fall through to the next one, then to English", () => {
  assert.equal(boot({ languages: ["ja-JP", "zh"] }).api.locale, "en");
  assert.equal(boot({ languages: ["pl-PL", "de-AT"] }).api.locale, "de");
  assert.equal(boot({ languages: [] }).api.locale, "en");
});

test("a language chosen in the menu wins over the browser's and is never overwritten", () => {
  const { api, local } = boot({ choice: "es", languages: ["pt-BR"] });
  assert.equal(api.locale, "es");
  assert.equal(local.getItem("eirehome-locale"), "es");
  // A choice that is no longer offered (a language turned back into a draft) is not applied, but kept.
  const draft = boot({ choice: "pl", languages: ["it-IT"] });
  assert.equal(draft.api.locale, "it");
  assert.equal(draft.local.getItem("eirehome-locale"), "pl");
});

test("?lang= opens any listed language for this tab without touching the saved choice", () => {
  const { api, session, local } = boot({ query: "?lang=pl", choice: "fr" });
  assert.equal(api.locale, "pl");
  assert.equal(session.getItem("eirehome-locale-preview"), "pl");
  assert.equal(local.getItem("eirehome-locale"), "fr");
  assert.equal(boot({ preview: "de", languages: ["en"] }).api.locale, "de");
  assert.equal(boot({ query: "?lang=xx", languages: ["it"] }).api.locale, "it");
});

test("texts in this browser's copy are used at once; missing ones are fetched under the site folder", () => {
  const { fetched } = boot({ languages: ["pt"], ns: "common home", cached: { "pt:common": { a: "b" } } });
  assert.deepEqual(fetched.sort(), [
    `http://localhost/EireHomeFlow/locales/en/common.json?v=${VERSION}`,
    `http://localhost/EireHomeFlow/locales/en/home.json?v=${VERSION}`,
    `http://localhost/EireHomeFlow/locales/pt/home.json?v=${VERSION}`,
  ]);
  // A copy from another version of the texts is not used.
  const stale = boot({ languages: ["pt"], raw: { "eirehome-i18n:pt:common": "old|{}" } });
  assert.ok(stale.fetched.some((url) => url.includes("/pt/common.json")));
});

test("a draft language only fetches the files it has", () => {
  const { fetched } = boot({ query: "?lang=pl", ns: "common guide" });
  assert.ok(fetched.some((url) => url.includes("/pl/common.json")));
  assert.ok(!fetched.some((url) => url.includes("/pl/guide.json")));
});

const EN = { hello: "Hello, {name}", steps: { one: "{count} step", other: "{count} steps" }, only: "Only in English", big: "{n} people" };
const PT = { hello: "Olá, {name}", steps: { one: "{count} etapa", other: "{count} etapas" }, big: "{n} pessoas" };

test("t() fills in values, picks the plural and falls back to English", () => {
  const { api } = boot({ languages: ["pt"], cached: { "en:common": EN, "pt:common": PT } });
  assert.equal(api.t("common:hello", { name: "Aoife" }), "Olá, Aoife");
  assert.equal(api.t("common:steps", { count: 1 }), "1 etapa");
  assert.equal(api.t("common:steps", { count: 5 }), "5 etapas");
  assert.equal(api.t("common:only"), "Only in English");
  assert.equal(api.t("common:big", { n: 1234567 }), "1.234.567 pessoas");
  assert.equal(api.t("common:hello"), "Olá, {name}");
  assert.equal(api.t("common:missing"), "common:missing");
  assert.equal(api.has("common:only"), true);
  assert.equal(api.has("common:missing"), false);
});

test("English plurals and numbers follow English rules", () => {
  const { api } = boot({ languages: ["en"], cached: { "en:common": EN } });
  assert.equal(api.t("common:steps", { count: 1 }), "1 step");
  assert.equal(api.t("common:steps", { count: 0 }), "0 steps");
  assert.equal(api.t("common:big", { n: 1234567 }), "1,234,567 people");
});

test("links inside translations may only go to the site's pages, email or https", () => {
  const { safeHref } = boot().api._internal;
  for (const ok of ["terms.html", "journey.html#step-aip-0", "signin.html?next=dashboard.html", "https://www.revenue.ie/en/", "mailto:eirehomeflow@gmail.com", "#top"]) {
    assert.equal(safeHref(ok), true, ok);
  }
  for (const bad of ["javascript:alert(1)", "//evil.example", "data:text/html,x", "http://insecure.example", "../secret.html"]) {
    assert.equal(safeHref(bad), false, bad);
  }
});

test("choosing a language saves it, ends the tab's preview and drops other languages' copies", () => {
  const raw = { "eirehome-i18n:fr:common": "x|{}", "eirehome-i18n:es:guide": "x|{}", "eirehome-i18n:en:common": "x|{}", "eirehome-i18n:de:common": "x|{}", "eirehome-flow": "{}" };
  const { api, local, session } = boot({ preview: "fr", raw });
  api.setLocale("de");
  assert.equal(local.getItem("eirehome-locale"), "de");
  assert.equal(session.getItem("eirehome-locale-preview"), null);
  assert.deepEqual([...local.data.keys()].filter((key) => key.startsWith("eirehome-i18n:")).sort(), ["eirehome-i18n:de:common", "eirehome-i18n:en:common"]);
  assert.equal(local.getItem("eirehome-flow"), "{}", "progress and calculator figures are untouched");
});

test("a draft language cannot be chosen from the menu", async () => {
  const { api, local } = boot();
  assert.equal(await api.setLocale("pl"), false);
  assert.equal(await api.setLocale("xx"), false);
  assert.equal(local.getItem("eirehome-locale"), null);
});