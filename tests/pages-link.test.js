import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readdirSync } from "node:fs";
import { promisify } from "node:util";

// Every page module must link: each named import exists and each path resolves.
// ESLint can't see across files, so a renamed export would otherwise only fail in a browser.
//
// Each page runs in its own Node process: core/app.js refuses a second startPage() call,
// and all pages would share one core/app.js if they were imported into this process.
//
// The modules read a few browser globals while loading (core/dom.js reads the page name,
// core/app.js reads the address), so the child sets minimal stand-ins first.
// readyState "loading" makes startPage wait for DOMContentLoaded, which never fires here,
// so no page's init() runs: only the linking is tested.
const run = promisify(execFile);
const pagesDir = new URL("../docs/js/pages/", import.meta.url);

const STUBS = `
const noop = () => {};
globalThis.document = {
  readyState: "loading",
  body: { dataset: { page: "test" } },
  addEventListener: noop,
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
};
globalThis.location = { search: "", hash: "", pathname: "/", href: "http://localhost/" };
globalThis.history = { replaceState: noop };
globalThis.window = globalThis;
`;

for (const file of readdirSync(pagesDir).filter((name) => name.endsWith(".js"))) {
  test(`pages/${file} links and starts`, async () => {
    const url = new URL(file, pagesDir).href;
    const script = `${STUBS}\nawait import(${JSON.stringify(url)});\n`;
    try {
      await run(process.execPath, ["--input-type=module", "-e", script], { timeout: 10000 });
    } catch (err) {
      assert.fail(`pages/${file} did not load:\n${err.stderr || err.message}`);
    }
  });
}
