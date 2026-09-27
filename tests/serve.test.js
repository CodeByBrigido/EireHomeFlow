import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

// The dev server must let the browser cache like GitHub Pages does, or every click
// re-downloads the font and the text flashes in a fallback font (font-display: swap).
const PORT = 8019;
const BASE = `http://localhost:${PORT}`;
let server;

before(async () => {
  server = spawn(process.execPath, ["tools/serve.js"], { env: { ...process.env, PORT: String(PORT) } });
  await new Promise((resolve, reject) => {
    server.stdout.on("data", (chunk) => { if (String(chunk).includes("http://localhost")) resolve(); });
    server.on("exit", (code) => reject(new Error("serve.js exited with " + code)));
  });
});

after(() => server.kill());

test("fonts and images are kept by the browser, so pages don't flash a fallback font", async () => {
  for (const path of ["/fonts/nunito-latin.woff2", "/img/hero-600.webp"]) {
    const res = await fetch(BASE + path);
    assert.equal(res.status, 200);
    assert.match(res.headers.get("cache-control"), /max-age=[1-9]/, path);
  }
});

test("pages, styles and scripts are checked on every load, so edits show at once", async () => {
  for (const path of ["/index.html", "/css/styles.css", "/js/core/app.js"]) {
    const res = await fetch(BASE + path);
    assert.equal(res.headers.get("cache-control"), "no-cache", path);
    assert.ok(res.headers.get("last-modified"), path + " has no Last-Modified");
  }
});

test("an unchanged file answers 304 instead of sending it again", async () => {
  const first = await fetch(BASE + "/css/styles.css");
  const again = await fetch(BASE + "/css/styles.css", { headers: { "If-Modified-Since": first.headers.get("last-modified") } });
  assert.equal(again.status, 304);
  assert.equal((await again.arrayBuffer()).byteLength, 0);
});
