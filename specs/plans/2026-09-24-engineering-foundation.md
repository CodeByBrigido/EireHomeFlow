# Engineering Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give ÉireHome Flow professional engineering foundations (ES modules, focused files, automated tests, linting, version tooling and CI) without changing anything a visitor sees or does.

**Architecture:** The 540-line classic script `docs/js/app.js` is split into ES modules in two layers. `docs/js/lib/` holds pure logic (no DOM, no storage) that Node can test. `docs/js/core/` holds the browser parts (DOM, storage, Supabase). Each page loads exactly one module, `docs/js/pages/<page>.js`, which imports what it needs and calls `startPage({ init, render, actions })`. There is still no build step: browsers load the modules directly from GitHub Pages.

**Tech Stack:** HTML, CSS, JavaScript ES modules (browser), Node.js 20+ for tooling only (`node:test`, ESLint 9), GitHub Actions, GitHub Pages, Supabase (unchanged).

---

## Deviations from the plan (recorded after execution)

- The dev server returns 400 on malformed URLs and explains a busy port.
- The version check also reads single-quoted attributes and fails when no `?v=` is found at all.
- `safeNext` has regression tests for the known attack shapes.
- `startPage` throws if it is called twice.
- The header comment in `core/account.js` was corrected.
- CI runs on Node 22 (Node 20 reached end of life in April 2026), with `permissions: contents: read` and a concurrency group.
- `engines` is `">=20.1"`, because `readdirSync` with `recursive` needs Node 20.1.
- Docs tidy: a Windows PowerShell tip, a caveat about Python's MIME types, and how to bump twice on the same day.
- The paths in `SETUP-CONTAS.md` and in the Backend Schema were corrected.
- `tests/pages-link.test.js` was added: each page module is imported in its own Node process to prove every import links.
- `?v=` was bumped to `20260925`, because the JavaScript behind the old number changed.

---

## Ground rules for whoever executes this

- **This is a pure restructure.** No visible text, layout, maths or behaviour changes. If you spot a bug, write it down under "Follow-ups" at the end of this file; don't fix it here.
- **Work on a branch:** `engineering-foundation`, created from an up-to-date `main`. Commit after each task. **Do not push or open the Pull Request until the user says so.** Merging to `main` deploys the live site.
- **Line numbers** like "app.js lines 27-29" refer to commit `8312ef6`. See the original with:
  ```bash
  git show 8312ef6:docs/js/app.js
  ```
- **The `?v=` rule:** every local script/stylesheet URL and every relative `import` carries `?v=YYYYMMDD`. New imports in this plan are written with `?v=20260924` (the current number). Task 6 runs `npm run bump`, which moves everything to one new number at once.
- **Docs first:** Task 8 updates `specs/02-TRD.md`, `README.md`, `CLAUDE.md` and `specs/06-Implementation-Plan.md`, as the project rules require. They go in the same Pull Request.
- `CLAUDE.md` is currently untracked. It is committed in Task 8.

## File structure (end state)

```
EireHomeFlow/
├── docs/                          # the site (GitHub Pages), same pages as today
│   ├── *.html                     # each loads ONE module: js/pages/<page>.js
│   └── js/
│       ├── config.js              # ES module: SUPABASE_URL, SUPABASE_ANON_KEY
│       ├── lib/                   # pure logic, tested in Node
│       │   ├── format.js          # num, euro, esc
│       │   ├── calculator.js      # rules, calc(), verdictKind(), RANGES
│       │   ├── progress.js        # progress(steps, done), XP_PER_STEP
│       │   ├── validation.js      # password/email/name rules, safeNext()
│       │   └── people.js          # userName, firstName, initials
│       ├── core/                  # browser parts shared by every page
│       │   ├── app.js             # startPage(): lifecycle, clicks, account events
│       │   ├── dom.js             # PAGE, bind()
│       │   ├── state.js           # state, setState, onStateChange, loadSaved
│       │   ├── steps.js           # loadSteps, steps, PHASES, links, phase cards
│       │   ├── sync.js            # setDone, syncOnSignIn (cloud progress)
│       │   ├── account.js         # Account (Supabase)
│       │   ├── header.js          # renderHeader, renderGate, setMenu
│       │   ├── notices.js         # toasts and flash notices
│       │   └── forms.js           # form checks and live feedback
│       └── pages/                 # one module per page (+ new guide.js)
├── tests/                         # node --test
│   ├── calculator.test.js
│   ├── format.test.js
│   ├── progress.test.js
│   ├── validation.test.js
│   └── versions.test.js
├── tools/
│   ├── serve.js                   # npm start (no Python needed)
│   ├── versions.js                # shared helpers for ?v=
│   ├── check-versions.js          # npm run check:versions
│   └── bump-version.js            # npm run bump
├── .github/workflows/checks.yml   # lint + tests + versions on every PR
├── package.json · package-lock.json · eslint.config.js · .editorconfig
```

Removed at the end: `docs/js/app.js` and `docs/js/account.js` (their code now lives in `lib/` and `core/`).

---

### Task 0: Branch

- [ ] **Step 1: Update main and branch**

```bash
git switch main
git pull
git switch -c engineering-foundation
```

Expected: `Switched to a new branch 'engineering-foundation'`.

---

### Task 1: Tooling base (package.json, editor settings, a Node server)

**Files:**
- Create: `package.json`
- Create: `.editorconfig`
- Create: `tools/serve.js`
- Modify: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "eirehome-flow",
  "private": true,
  "type": "module",
  "description": "ÉireHome Flow: a guide for first-time home buyers in Ireland.",
  "engines": { "node": ">=20" },
  "scripts": {
    "start": "node tools/serve.js",
    "test": "node --test",
    "lint": "eslint .",
    "check:versions": "node tools/check-versions.js",
    "bump": "node tools/bump-version.js",
    "check": "npm run lint && npm test && npm run check:versions"
  }
}
```

`"type": "module"` makes Node treat `.js` files as ES modules. Browsers ignore this file, and GitHub Pages only serves `docs/`.

- [ ] **Step 2: Create `.editorconfig`** (the code already uses 2 spaces and LF, see `.gitattributes`)

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 3: Add to `.gitignore`**, after the `.idea/` line:

```
.vs/
node_modules/
```

`.vs/` is created by Visual Studio when it opens the folder.

- [ ] **Step 4: Create `tools/serve.js`**

```js
// Local web server for the site in docs/: npm start, then open http://localhost:8000/.
// The site needs http (partials and steps are fetched), and ES modules need the
// text/javascript type, which some Python installs on Windows get wrong.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

const ROOT = resolve("docs");
const PORT = Number(process.env.PORT) || 8000;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  let file = normalize(join(ROOT, path));
  if (file !== ROOT && !file.startsWith(ROOT + sep)) {
    res.writeHead(403).end();
    return;
  }
  if (path.endsWith("/")) file = join(file, "index.html");
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found: " + path);
  }
}).listen(PORT, () => console.log(`ÉireHome Flow on http://localhost:${PORT}/`));
```

- [ ] **Step 5: Run it and check the site loads**

Run: `npm start`
Expected: `ÉireHome Flow on http://localhost:8000/`. Open it in a browser: the Home page shows its header, footer and phase cards, and the console has no errors. Stop it with Ctrl+C.

- [ ] **Step 6: Run the (empty) test command**

Run: `npm test`
Expected: exits 0 with `# tests 0`.

- [ ] **Step 7: Commit**

```bash
git add package.json .editorconfig .gitignore tools/serve.js
git commit -m "Add package.json, editor settings and a Node server for local work"
```

---

### Task 2: Version tooling for `?v=` (check + bump)

**Files:**
- Create: `tools/versions.js`
- Create: `tools/check-versions.js`
- Create: `tools/bump-version.js`
- Test: `tests/versions.test.js`

- [ ] **Step 1: Write the failing test** in `tests/versions.test.js`

```js
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

test("bumpText replaces every number with one version", () => {
  assert.equal(bumpText("a?v=20260924 b?v=20260925", "20261001"), "a?v=20261001 b?v=20261001");
});

test("today is an eight-digit date", () => {
  assert.match(today(), /^\d{8}$/);
});
```

- [ ] **Step 2: Run the test to make sure it fails**

Run: `npm test`
Expected: FAIL with `Cannot find module` for `tools/versions.js`.

- [ ] **Step 3: Write `tools/versions.js`**

```js
// Helpers for the ?v= numbers that make browsers fetch new CSS and JS after a change
// (GitHub Pages caches files for 10 minutes). See specs/02-TRD.md, section 10.
import { readdirSync } from "node:fs";
import { join } from "node:path";

const VERSION = /\?v=(\d{8})/g;

// Every HTML page and script of the site: the files that carry ?v= numbers.
export function siteFiles(root = "docs") {
  return readdirSync(root, { recursive: true })
    .map((name) => join(root, name))
    .filter((path) => /\.(html|js)$/.test(path));
}

export const findVersions = (text) => [...text.matchAll(VERSION)].map((m) => m[1]);

// Local scripts and stylesheets loaded without ?v=. They could come from an older cache,
// and a module imported with and without ?v= runs twice, with two separate states.
export function unversionedRefs(text) {
  const refs = [];
  for (const m of text.matchAll(/(?:\bfrom|\bimport)\s*\(?\s*["'](\.{1,2}\/[^"'?]+)["']/g)) refs.push(m[1]);
  for (const m of text.matchAll(/\b(?:src|href)="((?:js|css)\/[^"?]+\.(?:js|css))"/g)) refs.push(m[1]);
  return refs;
}

export const bumpText = (text, version) => text.replace(VERSION, "?v=" + version);

export const today = () => new Date().toISOString().slice(0, 10).replaceAll("-", "");
```

- [ ] **Step 4: Run the tests to make sure they pass**

Run: `npm test`
Expected: PASS, `# pass 6`.

- [ ] **Step 5: Write `tools/check-versions.js`**

```js
// Fails when the site's ?v= numbers differ, or when a local script or stylesheet has none.
// Run with: npm run check:versions
import { readFileSync } from "node:fs";
import { findVersions, siteFiles, unversionedRefs } from "./versions.js";

const versions = new Map();
const problems = [];
for (const file of siteFiles()) {
  const text = readFileSync(file, "utf8");
  for (const v of findVersions(text)) versions.set(v, (versions.get(v) || new Set()).add(file));
  for (const ref of unversionedRefs(text)) problems.push(`${file}: "${ref}" has no ?v= number`);
}
if (versions.size > 1) {
  const list = [...versions].map(([v, files]) => `${v} (${files.size} files)`).join(", ");
  problems.push(`The site uses more than one ?v= number: ${list}. Run npm run bump.`);
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`All files use ?v=${[...versions.keys()][0]}.`);
```

- [ ] **Step 6: Write `tools/bump-version.js`**

```js
// Sets every ?v= number in docs/ to one new version. Run after changing any CSS or JS:
//   npm run bump              (today's date)
//   npm run bump -- 20261001  (a given date)
import { readFileSync, writeFileSync } from "node:fs";
import { bumpText, findVersions, siteFiles, today } from "./versions.js";

const version = process.argv[2] || today();
if (!/^\d{8}$/.test(version)) {
  console.error("The version must be a date like 20261001.");
  process.exit(1);
}
let changed = 0;
for (const file of siteFiles()) {
  const text = readFileSync(file, "utf8");
  if (!findVersions(text).length) continue;
  const next = bumpText(text, version);
  if (next !== text) {
    writeFileSync(file, next);
    changed += 1;
  }
}
console.log(`?v=${version} in ${changed} files.`);
```

- [ ] **Step 7: Check the current site passes**

Run: `npm run check:versions`
Expected: `All files use ?v=20260924.` If it lists a file, that file really is missing its `?v=`. Add `?v=20260924` to it and run again.

- [ ] **Step 8: Commit**

```bash
git add tools/versions.js tools/check-versions.js tools/bump-version.js tests/versions.test.js
git commit -m "Add npm run bump and npm run check:versions for the ?v= numbers"
```

---

### Task 3: Pure calculator module with the TRD reference tests

The calculator maths moves out of `app.js` into `docs/js/lib/calculator.js`. Until Task 6 the site still runs the old copy in `app.js`, so the duplication is temporary. These tests pin today's behaviour: every expected value comes from `specs/02-TRD.md` section 12.1 and was checked against the current code on 24/09/2026.

**Files:**
- Create: `docs/js/lib/format.js`
- Create: `docs/js/lib/calculator.js`
- Test: `tests/format.test.js`, `tests/calculator.test.js`

- [ ] **Step 1: Write the failing tests**

`tests/format.test.js`:

```js
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
```

`tests/calculator.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { calc, stampDuty, VAT, verdictKind } from "../docs/js/lib/calculator.js";

// The calculator's example figures (specs/02-TRD.md, section 12.1).
const BASE = {
  ftb: true, joint: false, newBuild: false, apartment: false,
  salary: "45000", salary2: "38000", savings: "35000", gift: "0", htb: "0",
  price: "380000", rate: "3.9", term: "30",
};
const run = (patch = {}) => calc({ ...BASE, ...patch });
// The page shows whole euros, so reference values are compared after rounding.
const whole = (c, keys) => Object.fromEntries(keys.map((k) => [k, Math.round(c[k])]));

test("default figures", () => {
  const c = run();
  assert.deepEqual(whole(c, ["maxPrice", "maxLoan", "cashNeeded", "loanNeeded", "monthly"]),
    { maxPrice: 209851, maxLoan: 180000, cashNeeded: 44850, loanNeeded: 342000, monthly: 1613 });
  assert.equal(verdictKind(c), "outOfReach");
});

test("family gift of 60,000 raises the maximum price", () => {
  assert.equal(Math.round(run({ gift: "60000" }).maxPrice), 269257);
});

test("price 200,000 is within limits, using all savings", () => {
  const c = run({ price: "200000" });
  assert.equal(Math.round(c.maxPrice), 209851);
  assert.equal(Math.round(c.loanNeeded), 170050);
  assert.ok(c.extraSavings > 0);
  assert.equal(verdictKind(c), "within");
});

test("savings 60,000 at 300,000: the mortgage is over the limit", () => {
  const c = run({ savings: "60000", price: "300000" });
  assert.equal(Math.round(c.maxPrice), 234604);
  assert.equal(Math.round(c.loanNeeded), 246050);
  assert.equal(verdictKind(c), "loanOver");
});

test("salary 120,000 with savings 20,000 at 300,000: short in cash", () => {
  const c = run({ salary: "120000", savings: "20000", price: "300000" });
  assert.equal(Math.round(c.maxPrice), 154091);
  assert.equal(Math.round(c.gap), 16050);
  assert.equal(verdictKind(c), "cashShort");
});

test("moving home uses 3.5x and still a 10% deposit", () => {
  const c = run({ ftb: false });
  assert.equal(c.multiple, 3.5);
  assert.equal(Math.round(c.maxPrice), 187574);
  assert.equal(Math.round(c.deposit), 38000);
  assert.equal(verdictKind(c), "outOfReach");
});

test("new house: stamp duty on the price without 13.5% VAT", () => {
  const c = run({ newBuild: true });
  assert.deepEqual(whole(c, ["maxPrice", "stamp", "cashNeeded"]), { maxPrice: 210099, stamp: 3348, cashNeeded: 44398 });
});

test("new apartment: stamp duty on the price without 9% VAT", () => {
  const c = run({ newBuild: true, apartment: true });
  assert.deepEqual(whole(c, ["maxPrice", "stamp"]), { maxPrice: 210023, stamp: 3486 });
});

test("new house with Help to Buy: counted in the maximum, not at 380,000", () => {
  const c = run({ newBuild: true, htb: "30000" });
  assert.deepEqual(whole(c, ["maxPrice", "htbStop", "funds", "loanNeeded"]),
    { maxPrice: 233217, htbStop: 257143, funds: 35000, loanNeeded: 342000 });
  assert.equal(c.htb, 0);
});

test("Help to Buy with savings 100,000: above the stop, income is the limit", () => {
  const c = run({ newBuild: true, htb: "30000", savings: "100000" });
  assert.equal(Math.round(c.maxPrice), 274531);
  assert.equal(verdictKind(c), "loanOver");
});

test("Help to Buy on a joint application", () => {
  const c = run({ newBuild: true, htb: "30000", joint: true });
  assert.deepEqual(whole(c, ["maxPrice", "maxLoan", "htb", "loanNeeded", "monthly"]),
    { maxPrice: 390509, maxLoan: 332000, htb: 30000, loanNeeded: 321398, monthly: 1516 });
  assert.equal(verdictKind(c), "within");
});

test("stuck at the Help to Buy price cap", () => {
  const c = run({ newBuild: true, htb: "30000", joint: true, salary: "60000", salary2: "60000", savings: "45000" });
  assert.equal(Math.round(c.maxPrice), 500000);
  assert.equal(Math.round(c.savingsPastHtb), 12455);
  assert.equal(verdictKind(c), "within");
});

test("price 1,200,000 uses the 1% and 2% bands", () => {
  const c = run({ price: "1200000" });
  assert.equal(Math.round(c.stamp), 14000);
  assert.equal(verdictKind(c), "outOfReach");
});

test("Revenue's own example: new home at 400,000", () => {
  assert.equal(stampDuty(400000, VAT.house).toFixed(2), "3524.23");
  assert.equal(stampDuty(400000, VAT.apartment).toFixed(2), "3669.72");
});
```

- [ ] **Step 2: Run the tests to make sure they fail**

Run: `npm test`
Expected: FAIL with `Cannot find module` for `docs/js/lib/format.js` and `docs/js/lib/calculator.js`.

- [ ] **Step 3: Write `docs/js/lib/format.js`** (from app.js lines 27-29)

```js
// Small helpers for numbers and text. Pure: no DOM, so Node tests can use them.

export const num = (v) => Number(v) || 0;
export const euro = (n) => "€" + Math.round(n).toLocaleString("en-IE");
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
```

- [ ] **Step 4: Write `docs/js/lib/calculator.js`** (app.js lines 21-22 and 172-252, plus the new `verdictKind`)

```js
// Calculator rules and maths, shared by the calculator, the journey and the dashboard.
// Pure: no DOM and no storage, so tests/calculator.test.js runs it in Node.
// The source of every rule is listed in specs/02-TRD.md, section 6.
import { num } from "./format.js?v=20260924";

// The calculator's sliders: lowest, highest and default value.
export const RANGES = { rate: [1, 8, 3.9], term: [5, 35, 30] };

export const DEPOSIT_RATE = 0.1; // Central Bank minimum for first-time and subsequent buyers since 2023
export const FEES = { solicitor: 2500, survey: 400, valuation: 150 };
export const FEES_TOTAL = FEES.solicitor + FEES.survey + FEES.valuation;
// VAT included in the price of a new home: 13.5% on houses, and 9% on apartments sold
// from 8 October 2025 to 31 December 2030.
export const VAT = { house: 0.135, apartment: 0.09 };
export const HTB = { max: 30000, share: 0.1, priceCap: 500000, minLoanShare: 0.7 };

export const homeVat = (s) => (!s.newBuild ? 0 : s.apartment ? VAT.apartment : VAT.house);

// Residential stamp duty since 2 October 2024: 1% up to €1m, 2% from €1m to €1.5m, 6% above.
// On a new home it is charged on the price without VAT.
export const stampBase = (price, vat) => price / (1 + (vat || 0));
export function stampDuty(price, vat) {
  const base = stampBase(price, vat);
  return Math.min(base, 1e6) * 0.01 + Math.max(0, Math.min(base, 1.5e6) - 1e6) * 0.02 + Math.max(0, base - 1.5e6) * 0.06;
}
export const stampBands = (base) => (base <= 1e6 ? "1%" : base <= 1.5e6 ? "1% and 2% bands" : "1%, 2% and 6% bands");

// Help to Buy: first-time buyers of a new home up to €500,000, with a mortgage of at least
// 70% of the price. So it also stops where 70% of the price is more than the person can borrow.
// The refund is the lowest of €30,000, 10% of the price and the amount typed in (the income
// tax and DIRT paid in the last four years).
export const htbCap = (price) => Math.min(HTB.max, price * HTB.share);
export const htbLimit = (maxLoan) => Math.min(HTB.priceCap, maxLoan / HTB.minLoanShare);
export const htbFor = (s, price, maxLoan) =>
  (s.ftb && s.newBuild && price <= htbLimit(maxLoan) ? Math.min(num(s.htb), htbCap(price)) : 0);

// Highest price (within 50 cent) for which ok(price) holds. Each check gets harder as the
// price rises, except where Help to Buy stops (split), so the prices above it are searched alone.
export function highestPrice(ok, split) {
  const search = (lo, hi) => {
    if (ok(hi)) return hi;
    while (hi - lo > 0.5) {
      const mid = (lo + hi) / 2;
      if (ok(mid)) lo = mid; else hi = mid;
    }
    return lo;
  };
  const upTo = ok(0) ? search(0, split) : 0;
  const above = ok(split + 1) ? search(split + 1, 1e8) : 0;
  return Math.max(upTo, above);
}

export function calc(s) {
  const income = num(s.salary) + (s.joint ? num(s.salary2) : 0);
  const multiple = s.ftb ? 4 : 3.5;
  const maxLoan = income * multiple;
  const vat = homeVat(s);
  const own = num(s.savings) + num(s.gift);
  const htbStop = htbLimit(maxLoan);
  const fundsAt = (p) => own + htbFor(s, p, maxLoan);
  const costsAt = (p) => stampDuty(p, vat) + FEES_TOTAL;
  // Cash must cover the 10% deposit and the costs; savings above that go into the purchase,
  // so the loan is the price plus costs minus all the funds.
  const fundsOk = (p) => fundsAt(p) >= p * DEPOSIT_RATE + costsAt(p);
  const fundsLimitedPrice = highestPrice(fundsOk, htbStop);
  const loanLimitedPrice = highestPrice((p) => p + costsAt(p) - fundsAt(p) <= maxLoan, htbStop);
  const maxPrice = Math.min(fundsLimitedPrice, loanLimitedPrice);
  // Savings needed to go just past the point where Help to Buy stops, without it.
  const pastHtb = htbStop + 1;
  const savingsPastHtb = pastHtb * DEPOSIT_RATE + costsAt(pastHtb) - own;

  const price = num(s.price);
  const htb = htbFor(s, price, maxLoan);
  const funds = own + htb;
  const deposit = price * DEPOSIT_RATE;
  const stamp = stampDuty(price, vat);
  const costs = stamp + FEES_TOTAL;
  const cashNeeded = deposit + costs;
  const extraSavings = Math.max(0, funds - cashNeeded);
  const loanNeeded = Math.max(0, price - deposit - extraSavings);
  const r = num(s.rate) / 100 / 12;
  const n = num(s.term) * 12;
  const monthly = r > 0 && n > 0 ? (loanNeeded * r) / (1 - Math.pow(1 + r, -n)) : loanNeeded / (n || 1);
  return { multiple, depositRate: DEPOSIT_RATE, maxLoan, price, own, htb, htbCap: htbCap(price), htbStop, savingsPastHtb, funds,
    loanLimitedPrice, fundsLimitedPrice, maxPrice, vat, stampBase: stampBase(price, vat), deposit, stamp, costs, ...FEES,
    cashNeeded, extraSavings, loanNeeded, loanShare: price ? loanNeeded / price : 0, monthly, gap: cashNeeded - funds, loanOver: loanNeeded - maxLoan };
}

// What blocks the purchase at the target price: "within" (nothing), "cashShort",
// "loanOver", or "outOfReach" (both). The calculator page turns it into the verdict card.
export function verdictKind(c) {
  const cashShort = c.gap > 0;
  const loanOver = c.loanOver > 0;
  return cashShort && loanOver ? "outOfReach" : cashShort ? "cashShort" : loanOver ? "loanOver" : "within";
}
```

Note: `calc(s = state)` becomes `calc(s)`. The module has no state; callers pass `state` explicitly (Task 6).

- [ ] **Step 5: Run the tests to make sure they pass**

Run: `npm test`
Expected: PASS, `# pass 23` (6 versions + 3 format + 14 calculator).

- [ ] **Step 6: Prove the tests can catch a wrong rule**

Temporarily change `DEPOSIT_RATE = 0.1` to `0.2` in `docs/js/lib/calculator.js`, then run `npm test`.
Expected: FAIL in several calculator tests (this was audit finding C1). Change it back to `0.1` and run `npm test` again: PASS.

- [ ] **Step 7: Commit**

```bash
git add docs/js/lib/format.js docs/js/lib/calculator.js tests/format.test.js tests/calculator.test.js
git commit -m "Move the calculator maths into a pure module, tested against the TRD reference values"
```

---

### Task 4: Pure validation, people and progress modules

**Files:**
- Create: `docs/js/lib/validation.js`, `docs/js/lib/people.js`, `docs/js/lib/progress.js`
- Test: `tests/validation.test.js`, `tests/progress.test.js`

- [ ] **Step 1: Write the failing tests**

`tests/validation.test.js`:

```js
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
```

`tests/progress.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { progress } from "../docs/js/lib/progress.js";

// Two phases: a blocking step, an optional one, then blocking steps.
const STEPS = [
  { id: "a-0", blocking: true },
  { id: "a-1", blocking: false },
  { id: "a-2", blocking: true },
  { id: "b-0", blocking: true },
];

test("nothing done: only the first step can be completed", () => {
  assert.deepEqual(progress(STEPS, {}), { unlocked: 0, doneCount: 0, pct: 0 });
});

test("optional steps never block the ones after them", () => {
  assert.deepEqual(progress(STEPS, { "a-0": true }), { unlocked: 2, doneCount: 1, pct: 25 });
});

test("false means not done", () => {
  assert.deepEqual(progress(STEPS, { "a-0": false }), { unlocked: 0, doneCount: 0, pct: 0 });
});

test("everything done", () => {
  const all = { "a-0": true, "a-1": true, "a-2": true, "b-0": true };
  assert.deepEqual(progress(STEPS, all), { unlocked: 4, doneCount: 4, pct: 100 });
});

test("no steps loaded yet", () => {
  assert.deepEqual(progress([], {}), { unlocked: 0, doneCount: 0, pct: 0 });
});
```

- [ ] **Step 2: Run the tests to make sure they fail**

Run: `npm test`
Expected: FAIL with `Cannot find module` for the three new files.

- [ ] **Step 3: Write `docs/js/lib/validation.js`** (app.js lines 53-54 and 363-371)

```js
// Rules for account forms and the ?next= address. Pure, so Node tests can use them.

// Only relative page links are followed after signing in, e.g. "journey.html#step-aip-0".
export const safeNext = (value, fallback) => (/^[a-z-]+\.html(#[a-z0-9-]+)?$/.test(value || "") ? value : fallback);

// New passwords need 8+ characters, a capital letter and a symbol from the set Supabase Auth accepts.
export const PASSWORD_RULES = {
  length: (pw) => pw.length >= 8,
  upper: (pw) => /\p{Lu}/u.test(pw),
  special: (pw) => /[!@#$%^&*()_+\-=[\]{};'\\:"|<>?,./`~]/.test(pw),
};
export const strongPassword = (pw) => Object.values(PASSWORD_RULES).every((rule) => rule(pw));
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isFullName = (name) => name.trim().split(/\s+/).filter((word) => (word.match(/\p{L}/gu) || []).length >= 2).length >= 2;
```

- [ ] **Step 4: Write `docs/js/lib/people.js`** (app.js lines 43-51)

```js
// Names shown for the signed-in person. Pure, so Node tests can use them.

export const userName = (user) => ((user && user.user_metadata && user.user_metadata.full_name) || "").trim();
export const firstName = (user) => userName(user).split(/\s+/)[0] || "";

// First letter of the first and last names: "Rodrigo Andrade Brigido" gives "RB".
export function initials(user) {
  const words = userName(user).split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] || user.email || "?")[0];
  return letters.toUpperCase();
}
```

- [ ] **Step 5: Write `docs/js/lib/progress.js`** (app.js lines 6 and 144-152, now taking `steps` and `done` as arguments)

```js
// Journey progress. Pure: the caller passes the steps and the done map.

export const XP_PER_STEP = 25;

// unlocked: index of the first blocking step not done yet. Steps up to it can be completed;
// optional steps never block the ones after them.
export function progress(steps, done) {
  let unlocked = 0;
  for (const s of steps) {
    if (s.blocking && !done[s.id]) break;
    unlocked += 1;
  }
  const doneCount = steps.filter((s) => done[s.id]).length;
  return { unlocked, doneCount, pct: steps.length ? Math.round((doneCount / steps.length) * 100) : 0 };
}
```

- [ ] **Step 6: Run the tests to make sure they pass**

Run: `npm test`
Expected: PASS, `# pass 33`.

- [ ] **Step 7: Commit**

```bash
git add docs/js/lib/validation.js docs/js/lib/people.js docs/js/lib/progress.js tests/validation.test.js tests/progress.test.js
git commit -m "Move form rules, names and progress into pure, tested modules"
```

---

### Task 5: ESLint

**Files:**
- Create: `eslint.config.js`
- Modify: `package.json` (devDependencies, written by npm)
- Create: `package-lock.json` (written by npm)

- [ ] **Step 1: Install ESLint**

```bash
npm install --save-dev eslint@9 @eslint/js@9 globals
```

Expected: `package.json` gains `devDependencies`, and `package-lock.json` and `node_modules/` appear (`node_modules/` is ignored by git).

- [ ] **Step 2: Create `eslint.config.js`**

```js
// ESLint: catches undeclared names (a forgotten import), unused code and common mistakes.
// Run with: npm run lint
import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**",
      "_original-Backup/**",
      // Classic scripts, replaced by ES modules in the next task. Delete these lines then.
      "docs/js/app.js",
      "docs/js/account.js",
      "docs/js/config.js",
      "docs/js/pages/**",
    ],
  },
  js.configs.recommended,
  {
    rules: {
      // `catch (err) { /* nothing to do */ }` is a deliberate pattern in this code base.
      "no-unused-vars": ["error", { caughtErrors: "none" }],
    },
  },
  {
    files: ["docs/**/*.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: globals.browser },
  },
  {
    files: ["tests/**/*.js", "tools/**/*.js", "eslint.config.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: globals.node },
  },
];
```

- [ ] **Step 3: Run it**

Run: `npm run lint`
Expected: no output, exit code 0. If it reports something in `lib/`, `tests/` or `tools/`, fix the code (don't loosen the rule), then run it again.

- [ ] **Step 4: Commit**

```bash
git add eslint.config.js package.json package-lock.json
git commit -m "Add ESLint"
```

---

### Task 6: Switch the site to ES modules

This is the one big step. The site doesn't work partway through (a page can't mix the old global scripts with the new modules), so do all the steps, verify, and make **one** commit at the end.

**Files:**
- Modify: `docs/js/config.js`
- Create: `docs/js/core/dom.js`, `state.js`, `steps.js`, `account.js`, `sync.js`, `header.js`, `notices.js`, `forms.js`, `app.js`
- Create: `docs/js/pages/guide.js`
- Modify: all 8 files in `docs/js/pages/`
- Modify: all 12 pages `docs/*.html` (the `<script>` lines only)
- Modify: `eslint.config.js` (remove the legacy ignores)
- Delete: `docs/js/app.js`, `docs/js/account.js`

- [ ] **Step 1: Make `docs/js/config.js` a module**

Replace the two `const` lines with `export const` and update the comment. The file becomes:

```js
// Supabase project settings (Project Settings > API in the Supabase dashboard).
// Leave them empty and accounts stay switched off. Setup steps: specs/SETUP-CONTAS.md.
// The anon key is meant to be public: row level security decides what each user can read.
export const SUPABASE_URL = "https://dyfxstpbzmihtmccaezs.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_HbDz9CG6HEbLZasYPRyTXg_yuT7Lv0d";
```

- [ ] **Step 2: Create `docs/js/core/dom.js`** (app.js lines 10 and 31-33)

```js
// The current page and the data-bind helper used by every page.

// <body data-page="..."> names the page: home, guide, journey, calculator, dashboard, ...
export const PAGE = document.body.dataset.page;

export function bind(name, value) {
  document.querySelectorAll('[data-bind="' + name + '"]').forEach((el) => { el.textContent = value; });
}
```

- [ ] **Step 3: Create `docs/js/core/state.js`** (app.js lines 7, 9, 12-19, 58-90; `setState` now notifies subscribers instead of calling `render()` directly)

```js
// The journey and calculator state, saved in this browser. Pages change it with setState();
// core/app.js subscribes with onStateChange() to re-render after every change.
import { RANGES } from "../lib/calculator.js?v=20260924";
import { num } from "../lib/format.js?v=20260924";

const STORAGE_KEY = "eirehome-flow";
const SAVED_FIELDS = ["ftb", "joint", "newBuild", "apartment", "salary", "salary2", "savings", "gift", "htb", "price", "rate", "term", "calcSaved"];

// calcSaved: true once the person has saved the calculator to their journey.
// Until then, the figures are the examples below, not theirs.
export const state = {
  done: {}, open: null,
  ftb: true, joint: false, newBuild: false, apartment: false,
  salary: "45000", salary2: "38000", savings: "35000", gift: "0", htb: "0", price: "380000",
  rate: "3.9", term: "30", calcSaved: "",
};

const listeners = [];
export const onStateChange = (fn) => { listeners.push(fn); };

export function setState(patch) {
  Object.assign(state, patch);
  save();
  listeners.forEach((fn) => fn());
}

// Progress and calculator figures are kept in this browser. Signed-in users also get a cloud copy.
export function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return;
    if (saved.done) state.done = saved.done;
    for (const key of SAVED_FIELDS) if (key in saved) state[key] = saved[key];
  } catch (err) {
    // Storage blocked or unreadable: start fresh.
  }
  // Figures saved before the sliders existed can be outside their range.
  for (const key in RANGES) {
    const [min, max, fallback] = RANGES[key];
    const value = num(state[key]);
    if (value < min || value > max) state[key] = String(value ? Math.min(max, Math.max(min, value)) : fallback);
  }
}

function save() {
  try {
    const out = { done: state.done };
    for (const key of SAVED_FIELDS) out[key] = state[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
  } catch (err) {
    // Storage blocked (private mode): progress lasts for this visit only.
  }
}
```

- [ ] **Step 4: Create `docs/js/core/steps.js`** (app.js lines 24-25, 99-142, 154-170, 254-256, plus `currentProgress`)

```js
// The step list, read from guide.html (the single source of the steps' content).
// PHASES and steps are live exports: they fill in once loadSteps() has run.
import { esc } from "../lib/format.js?v=20260924";
import { progress } from "../lib/progress.js?v=20260924";
import { state } from "./state.js?v=20260924";

export let PHASES = [];
export let steps = [];

export async function loadSteps() {
  let doc = document;
  try {
    if (!document.querySelector(".guide-phase")) {
      // "no-cache" asks the server whether the guide changed, so the steps never come
      // from an older copy than the scripts reading them.
      const res = await fetch("guide.html", { cache: "no-cache" });
      doc = new DOMParser().parseFromString(await res.text(), "text/html");
    }
  } catch (err) {
    console.error("Could not load the step list from guide.html.", err);
    return;
  }
  const textOf = (el, selector) => el.querySelector(selector).textContent.trim();
  PHASES = [...doc.querySelectorAll(".guide-phase")].map((el) => ({
    n: textOf(el, ".guide-phase__badge"),
    slug: el.dataset.slug,
    title: textOf(el, ".guide-phase__title"),
    subtitle: textOf(el, ".guide-phase__subtitle"),
    text: textOf(el, ".guide-phase__text"),
    // data-auto: the site ticks the step itself ("calculator": saved from the calculator,
    // "account": signed in). data-numbers: which calculator figures the journey shows on it.
    tasks: [...el.querySelectorAll(".guide-step")].map((s) => ({
      title: textOf(s, ".guide-step__title"),
      body: textOf(s, ".guide-step__body"),
      blocking: s.dataset.blocking === "true",
      auto: s.dataset.auto || (s.dataset.account === "true" ? "account" : ""),
      account: s.dataset.auto === "account" || s.dataset.account === "true",
      numbers: s.dataset.numbers || "",
      time: textOf(s, ".guide-step__time"),
      cost: textOf(s, ".guide-step__cost"),
      checklist: [...s.querySelectorAll(".guide-step__checklist li")].map((li) => li.textContent.trim()),
      howtoLabel: s.querySelector(".guide-step__howto-label") ? textOf(s, ".guide-step__howto-label") : "",
      howto: [...s.querySelectorAll(".guide-step__howto li")].map((li) => li.textContent.trim()),
      links: [...s.querySelectorAll(".guide-step__links a")].map((a) => ({ href: a.getAttribute("href"), text: a.textContent.trim() })),
      tip: textOf(s, ".guide-step__tip-text"),
      image: s.querySelector(".guide-step__image") ? s.querySelector(".guide-step__image").getAttribute("src") : "",
      imageAlt: s.querySelector(".guide-step__image") ? s.querySelector(".guide-step__image").alt : "",
    })),
  }));
  steps = PHASES.flatMap((phase) => phase.tasks.map((task, i) => ({ ...task, id: phase.slug + "-" + i, phase })));
}

export const currentProgress = () => progress(steps, state.done);

export const stepLink = (s) => "journey.html#step-" + s.id;

// The calculator step: the site ticks it when the person saves their figures there.
// Step IDs never change, so the ID is a fallback if the guide came without data-auto.
export const calculatorStep = () => steps.find((s) => s.auto === "calculator") || steps.find((s) => s.id === "preparation-0");

export function phaseCardsHtml() {
  return PHASES.map((phase) => {
    const dn = phase.tasks.filter((t, i) => state.done[phase.slug + "-" + i]).length;
    const pc = Math.round((dn / phase.tasks.length) * 100);
    return `<a class="phase-card" href="journey.html#phase-${phase.slug}">
        <span class="phase-card__head">
          <span class="phase-card__badge${dn ? " is-active" : ""}">${phase.n}</span>
          <span class="phase-card__title">${esc(phase.title)}</span>
        </span>
        <span class="phase-card__text">${esc(phase.text)}</span>
        <span class="bar"><span class="bar__fill${pc === 100 ? " is-full" : ""}" style="width:${pc}%"></span></span>
        <span class="phase-card__progress">${dn} of ${phase.tasks.length} steps done</span>
      </a>`;
  }).join("");
}
```

- [ ] **Step 5: Create `docs/js/core/account.js`** from `git show 8312ef6:docs/js/account.js`, with exactly these changes:
  1. Add at the top, after the comment block:
     ```js
     import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config.js?v=20260924";
     ```
  2. `const Account = {` becomes `export const Account = {`.
  3. `this.client = supabase.createClient(` becomes `this.client = window.supabase.createClient(`. The Supabase library is a classic script that sets `window.supabase`.

  Everything else (including `loadScript`) stays exactly as it is.

- [ ] **Step 6: Create `docs/js/core/sync.js`** (app.js lines 92-97 and 481-493)

```js
// The cloud copy of journey progress, for signed-in people.
import { Account } from "./account.js?v=20260924";
import { setState, state } from "./state.js?v=20260924";
import { steps } from "./steps.js?v=20260924";

// Returns the cloud save, so a page can wait for it before moving on.
export function setDone(done) {
  setState({ done });
  if (!Account.user) return Promise.resolve();
  return Account.saveProgress(done).catch((err) => console.error("Could not save progress to the account.", err));
}

// On sign-in, progress from this browser and from the account are merged (a step
// done in either place stays done) and saved back. Being signed in is what the
// account step asks for, so it is ticked here.
export async function syncOnSignIn() {
  const accountStep = steps.find((s) => s.account);
  const signedIn = accountStep ? { [accountStep.id]: true } : {};
  try {
    const merged = { ...(await Account.loadProgress()), ...signedIn };
    for (const id in state.done) if (state.done[id]) merged[id] = true;
    setDone(merged);
  } catch (err) {
    // Tick it in this browser only: writing to the account after a failed read would
    // replace the progress saved there.
    console.error("Could not load progress from the account.", err);
    setState({ done: { ...state.done, ...signedIn } });
  }
}
```

- [ ] **Step 7: Create `docs/js/core/header.js`**

Header of the file:

```js
// The shared header (active link, XP, sign-in link or account circle), the gate on
// signed-in pages, and the account menu.
import { XP_PER_STEP } from "../lib/progress.js?v=20260924";
import { initials, userName } from "../lib/people.js?v=20260924";
import { Account } from "./account.js?v=20260924";
import { bind, PAGE } from "./dom.js?v=20260924";
```

Body: app.js lines 266-310 unchanged, except add `export ` before `function renderHeader`, `function renderGate` and `function setMenu`.

- [ ] **Step 8: Create `docs/js/core/notices.js`**

Header of the file:

```js
// Toast notices, and "flash" notices carried to the next page in sessionStorage.

const FLASH_KEY = "eirehome-flash";
```

Body: app.js lines 314-359 unchanged, except add `export ` before `function showToast`, `function hideToast`, `function flash` and `function showFlash`.

- [ ] **Step 9: Create `docs/js/core/forms.js`**

Header of the file:

```js
// Form checks for sign-up, sign-in, passwords and the profile: red fields, messages,
// the live password rules and the status line under each form.
import { EMAIL_PATTERN, isFullName, PASSWORD_RULES, strongPassword } from "../lib/validation.js?v=20260924";
```

Body: app.js lines 373-433 unchanged, except add `export ` before `function formValues`, `function checkForm`, `function renderPasswordRules`, `function watchForm` and `const sayInForm`.

- [ ] **Step 10: Create `docs/js/core/app.js`** (app.js lines 35-41, 260-264, 437-536, reorganised around `startPage`)

```js
// Start-up and what every page shares: partials, rendering, clicks and account events.
// Each page module calls startPage({ init, render, actions }) once:
//   init()     runs once, after the partials and the step list have loaded;
//   render(p)  runs after every state change, with p = currentProgress();
//   actions    handlers for data-action="<name>" on that page.
import { firstName } from "../lib/people.js?v=20260924";
import { Account } from "./account.js?v=20260924";
import { PAGE } from "./dom.js?v=20260924";
import { renderHeader, setMenu } from "./header.js?v=20260924";
import { flash, hideToast, showFlash, showToast } from "./notices.js?v=20260924";
import { loadSaved, onStateChange, setState } from "./state.js?v=20260924";
import { currentProgress, loadSteps, stepLink, steps } from "./steps.js?v=20260924";
import { syncOnSignIn } from "./sync.js?v=20260924";

// Links in the confirmation and password emails bring people back with details after
// "#" (e.g. type=signup, or error_code=otp_expired). Read them before Supabase clears them.
const AUTH_RETURN = (() => {
  const params = new URLSearchParams(location.search.slice(1) + "&" + location.hash.slice(1));
  return { type: params.get("type"), error: params.get("error_code") || params.get("error"), welcomed: false };
})();
const cleanAuthUrl = () => history.replaceState(null, "", location.pathname);

let page = {};

const actions = {
  menu: () => setMenu(document.getElementById("account-menu").hidden),
  closeToast: hideToast,
  signOut: async () => {
    setMenu(false);
    if (Account.enabled) await Account.signOut();
    setState({ done: {}, open: null });
    const message = "You have signed out. Your progress is saved in your account.";
    if (["dashboard", "profile", "new-password"].includes(PAGE)) {
      flash(message);
      location.href = "index.html";
    } else {
      showToast(message);
    }
  },
};

function render() {
  const p = currentProgress();
  renderHeader(p);
  if (page.render) page.render(p);
}

function listen() {
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#avatar")) setMenu(false);
    const el = e.target.closest("[data-action]");
    if (el && actions[el.dataset.action]) actions[el.dataset.action](el, e);
  });

  document.addEventListener("input", (e) => {
    const key = e.target.dataset.field;
    if (key) setState({ [key]: e.target.value });
  });

  document.addEventListener("keydown", (e) => {
    const menu = document.getElementById("account-menu");
    if (e.key === "Escape" && menu && !menu.hidden) {
      setMenu(false);
      document.getElementById("avatar").focus();
    }
  });
}

async function onAccountChange(user, event) {
  if (event === "PASSWORD_RECOVERY" && PAGE !== "new-password") {
    location.replace("new-password.html");
    return;
  }
  if (user && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "PASSWORD_RECOVERY")) await syncOnSignIn();
  if (event === "SIGNED_OUT") setState({ done: {}, open: null });
  // Back from the confirmation email: welcome the new account holder.
  if (user && ["signup", "email", "invite"].includes(AUTH_RETURN.type) && !AUTH_RETURN.welcomed) {
    AUTH_RETURN.welcomed = true;
    cleanAuthUrl();
    const accountStep = steps.find((s) => s.account);
    showToast("Your email is confirmed. Welcome to ÉireHome Flow" + (firstName(user) ? ", " + firstName(user) : "") + "!", {
      sticky: true,
      action: accountStep ? { label: "Go to my journey", href: stepLink(accountStep) } : null,
    });
  }
  render();
}

// Header, footer and notices live in partials/ and are fetched at load. fetch() needs the site
// to be served over http(s): GitHub Pages, or `npm start` locally.
async function loadPartials() {
  await Promise.all([...document.querySelectorAll("[data-include]")].map(async (slot) => {
    try {
      const res = await fetch(slot.dataset.include, { cache: "no-cache" });
      if (!res.ok) throw new Error(res.status + " " + res.statusText);
      slot.outerHTML = await res.text();
    } catch (err) {
      console.error("Could not load " + slot.dataset.include + ". Serve the site over http(s), not file://.", err);
    }
  }));
}

async function init() {
  loadSaved();
  await Promise.all([loadPartials(), loadSteps()]);
  if (page.init) page.init();
  render();
  showFlash();
  if (AUTH_RETURN.error) {
    showToast("This link has expired or has already been used. Sign in, or ask for a new link.", { error: true, sticky: true });
    cleanAuthUrl();
  }
  Account.init(onAccountChange);
}

export function startPage(hooks = {}) {
  page = hooks;
  Object.assign(actions, hooks.actions);
  onStateChange(render);
  listen();
  // Modules run after the HTML is parsed, so this is normally "interactive" already.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}
```

One deliberate difference from the original: the merge used to run inline inside `onAccountChange`, and now it is `await syncOnSignIn()`. The outcome is the same (`setDone` inside it already re-renders); the final `render()` simply runs after the merge instead of racing it.

- [ ] **Step 11: Convert the page modules**

In every page file, add the import block shown below at the top (after the file's comment). Where noted, replace `function initPage` / `function renderPage` and `Object.assign(actions, { ... })` / `actions.x = ...` with the `startPage(...)` call at the end. Function bodies stay as they are unless a change is listed.

`docs/js/pages/home.js`:

```js
import { startPage } from "../core/app.js?v=20260924";
import { bind } from "../core/dom.js?v=20260924";
import { phaseCardsHtml } from "../core/steps.js?v=20260924";
```

Replace lines 18-22 (`actions.ticker = () => { ... };`) with:

```js
function toggleTicker() {
  const ticker = document.getElementById("ticker");
  const paused = ticker.classList.toggle("is-paused");
  ticker.querySelector(".ticker__toggle").textContent = paused ? "Play" : "Pause";
}

startPage({ init: initPage, render: renderPage, actions: { ticker: toggleTicker } });
```

`docs/js/pages/calculator.js`:

```js
import { calc, HTB, RANGES, stampBands, verdictKind } from "../lib/calculator.js?v=20260924";
import { esc, euro, num } from "../lib/format.js?v=20260924";
import { startPage } from "../core/app.js?v=20260924";
import { bind } from "../core/dom.js?v=20260924";
import { flash } from "../core/notices.js?v=20260924";
import { setState, state } from "../core/state.js?v=20260924";
import { calculatorStep, stepLink } from "../core/steps.js?v=20260924";
import { setDone } from "../core/sync.js?v=20260924";
```

Changes:
- Line 1 comment: `The maths is calc() in app.js` becomes `The maths is calc() in lib/calculator.js`.
- Line 73: `const c = calc();` becomes `const c = calc(s);`.
- Lines 120-137 (from `// Two separate limits` to `bind("verdictBody", verdict[1]);`) become:

```js
  // Two separate limits: cash for the deposit and costs, and the loan against the income multiple.
  const kind = verdictKind(c);
  const limit = "your " + c.multiple + "× limit of " + euro(c.maxLoan);
  const verdicts = {
    within: ["This price is within your limits",
      "You have " + euro(c.funds) + " against " + euro(c.cashNeeded) + " needed in cash, and the mortgage of " + euro(c.loanNeeded) + " sits inside " + limit + ". Next step: gather the AIP paperwork."],
    outOfReach: ["This price is out of reach for now",
      "You are " + euro(c.gap) + " short in cash, and the mortgage you would need (" + euro(c.loanNeeded) + ") is " + euro(c.loanOver) + " above " + limit + ". Aim at or below " + euro(c.maxPrice) + "."],
    cashShort: ["You are " + euro(c.gap) + " short in cash",
      "You have " + euro(c.funds) + " available and need " + euro(c.cashNeeded) + " in cash at this price. Save the difference or aim closer to " + euro(c.maxPrice) + "."],
    loanOver: ["The mortgage is over your limit",
      "You would need to borrow " + euro(c.loanNeeded) + ", which is " + euro(c.loanOver) + " above " + limit + ". Aim at or below " + euro(c.maxPrice) + "."],
  };
  const verdict = verdicts[kind];
  document.getElementById("verdict").classList.toggle("is-short", kind !== "within");
  bind("verdictTitle", verdict[0]);
  bind("verdictBody", verdict[1]);
```

- Lines 144-168: `Object.assign(actions, {` becomes `startPage({ init: initPage, render: renderPage, actions: {`, and the closing `});` becomes `} });`.

`docs/js/pages/journey.js`:

```js
import { calc, HTB } from "../lib/calculator.js?v=20260924";
import { esc, euro } from "../lib/format.js?v=20260924";
import { Account } from "../core/account.js?v=20260924";
import { startPage } from "../core/app.js?v=20260924";
import { bind } from "../core/dom.js?v=20260924";
import { setState, state } from "../core/state.js?v=20260924";
import { currentProgress, PHASES, stepLink, steps } from "../core/steps.js?v=20260924";
import { setDone } from "../core/sync.js?v=20260924";
```

Changes:
- Line 148: `mineFor(s.numbers, calc())` becomes `mineFor(s.numbers, calc(state))`.
- Line 255: `progress().unlocked` becomes `currentProgress().unlocked`.
- Line 267: `steps[progress().unlocked]` becomes `steps[currentProgress().unlocked]`.
- Line 240: `Object.assign(actions, {` becomes `startPage({ init: initPage, render: renderPage, actions: {`, and line 277 `});` becomes `} });`.

`docs/js/pages/dashboard.js`:

```js
import { calc } from "../lib/calculator.js?v=20260924";
import { euro } from "../lib/format.js?v=20260924";
import { firstName } from "../lib/people.js?v=20260924";
import { startPage } from "../core/app.js?v=20260924";
import { bind } from "../core/dom.js?v=20260924";
import { renderGate } from "../core/header.js?v=20260924";
import { state } from "../core/state.js?v=20260924";
import { phaseCardsHtml, stepLink, steps } from "../core/steps.js?v=20260924";
```

Changes: line 7 `const c = calc();` becomes `const c = calc(state);`. Add at the end:

```js
startPage({ render: renderPage });
```

`docs/js/pages/profile.js`:

```js
import { userName } from "../lib/people.js?v=20260924";
import { Account } from "../core/account.js?v=20260924";
import { startPage } from "../core/app.js?v=20260924";
import { bind } from "../core/dom.js?v=20260924";
import { checkForm, sayInForm, watchForm } from "../core/forms.js?v=20260924";
import { renderGate } from "../core/header.js?v=20260924";
import { showToast } from "../core/notices.js?v=20260924";
```

Add at the end:

```js
startPage({ init: initPage, render: renderPage });
```

`docs/js/pages/auth.js`:

```js
import { firstName } from "../lib/people.js?v=20260924";
import { safeNext } from "../lib/validation.js?v=20260924";
import { Account } from "../core/account.js?v=20260924";
import { startPage } from "../core/app.js?v=20260924";
import { bind, PAGE } from "../core/dom.js?v=20260924";
import { checkForm, formValues, renderPasswordRules, sayInForm, watchForm } from "../core/forms.js?v=20260924";
import { flash } from "../core/notices.js?v=20260924";
```

Add at the end:

```js
startPage({ init: initPage, render: renderPage });
```

`docs/js/pages/legal.js`:

```js
import { esc } from "../lib/format.js?v=20260924";
import { startPage } from "../core/app.js?v=20260924";
```

Add at the end:

```js
startPage({ init: initPage });
```

Create `docs/js/pages/guide.js`:

```js
// The full guide: static content, so the page only needs the shared header, footer and account.
import { startPage } from "../core/app.js?v=20260924";

startPage();
```

- [ ] **Step 12: Point every page at its one module**

In each HTML file, replace the `<script ... defer></script>` lines in `<head>` (3 lines in `guide.html`, 4 lines elsewhere) with the single line from this table:

| Page | New line |
|---|---|
| `index.html` | `<script type="module" src="js/pages/home.js?v=20260924"></script>` |
| `guide.html` | `<script type="module" src="js/pages/guide.js?v=20260924"></script>` |
| `journey.html` | `<script type="module" src="js/pages/journey.js?v=20260924"></script>` |
| `calculator.html` | `<script type="module" src="js/pages/calculator.js?v=20260924"></script>` |
| `dashboard.html` | `<script type="module" src="js/pages/dashboard.js?v=20260924"></script>` |
| `profile.html` | `<script type="module" src="js/pages/profile.js?v=20260924"></script>` |
| `signin.html`, `signup.html`, `forgot-password.html`, `new-password.html` | `<script type="module" src="js/pages/auth.js?v=20260924"></script>` |
| `privacy.html`, `terms.html` | `<script type="module" src="js/pages/legal.js?v=20260924"></script>` |

Keep the `<link rel="stylesheet" ...>` line as it is.

- [ ] **Step 13: Delete the old classic scripts**

```bash
git rm docs/js/app.js docs/js/account.js
```

- [ ] **Step 14: Lint everything**

In `eslint.config.js`, delete the four legacy lines (and their comment) from `ignores`, leaving:

```js
    ignores: ["node_modules/**", "_original-Backup/**"],
```

Run: `npm run lint`
Expected: no output. Every `'x' is not defined` error is a missing import. Add it to that file's import block (the module that exports it is in the File structure section) and run again until it's clean.

- [ ] **Step 15: One version for everything, then run all checks**

```bash
npm run bump
npm run check
```

Expected: `?v=<today> in N files.`, then lint clean, all tests passing, and `All files use ?v=<today>.`

- [ ] **Step 16: Verify in the browser**

Run `npm start` and open http://localhost:8000/ with DevTools open (Console and Network tabs). Everything must behave exactly as before:

1. All 12 pages open with no console errors. Each shows its header and footer with the right nav link marked. In Network, every `.js` is `200` with type `javascript` and a `?v=` number.
2. Calculator with the example figures: "€209,851" and "This price is out of reach for now". Price `200000`: "This price is within your limits". "New house" / "New apartment" pills switch the stamp duty label. "Joint application" enables the second salary.
3. "Save to my journey" lands on `journey.html#step-preparation-0` with "Your numbers are saved and step 1 is done."
4. Journey: open a step, reload, and it stays open. Complete an unlocked step: XP in the header goes up by 25. Previous/Next work. Esc and Close put focus back on the node.
5. Home: ticker Pause/Play works. Phase cards open `journey.html#phase-<slug>`. The button says "Resume my journey" once a step is done.
6. Guide: all 6 phases and 31 steps are visible.
7. Privacy and Terms: the "On this page" list is filled and highlights while scrolling.
8. Sign-up page: submit empty, and 4 fields turn red with focus on "Full name". Type `abcdefgh` as the password: "One capital letter" and "One special character" stay red.
9. If you have a test account: sign in, check the initials circle and menu, Dashboard and Profile, then Sign out.
10. At 375px width, no horizontal scroll on Home, Journey and Calculator.

If anything differs from the live site (https://codebybrigido.github.io/EireHomeFlow/), fix it before committing.

- [ ] **Step 17: Commit**

```bash
git add -A docs eslint.config.js
git commit -m "Split app.js into ES modules: lib/ for pure logic, core/ for the browser, one module per page"
```

---

### Task 7: GitHub Actions

**Files:**
- Create: `.github/workflows/checks.yml`

- [ ] **Step 1: Create the workflow**

```yaml
# Runs lint, tests and the ?v= check on every Pull Request and on main.
name: Checks

on:
  pull_request:
  push:
    branches: [main]

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run check:versions
```

- [ ] **Step 2: Check it locally the way CI will**

Run: `npm ci`, then `npm run check`.
Expected: all green, the same as Task 6 Step 15.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/checks.yml
git commit -m "Run lint, tests and the version check on every Pull Request"
```

The workflow first runs when the branch is pushed (Task 9). To make it **required**, the repo owner turns on "Require status checks to pass" for `main` and picks **Checks** (GitHub > Settings > Branches). That belongs with Marco 5's "proteger a main".

---

### Task 8: Documentation (same Pull Request, as the project rules require)

**Files:**
- Modify: `specs/02-TRD.md`
- Modify: `README.md`
- Modify: `specs/06-Implementation-Plan.md`
- Add: `CLAUDE.md` (currently untracked)

The specs are written in Portuguese, so the text below is in Portuguese. `CLAUDE.md` stays in English.

- [ ] **Step 1: `specs/02-TRD.md`**

1. Line 3: change the version to `1.4` and "Última revisão" to today's date (DD/MM/AAAA).
2. Section 1, diagram line 14: replace `js/config.js → js/account.js → js/app.js → js/pages/<pg>.js` with `js/pages/<pg>.js (módulo ES) → js/core/*.js → js/lib/*.js`, keeping the box borders aligned.
3. Section 1, line 29 becomes:
   `- **Sem build, sem framework.** HTML, CSS e JavaScript puros, em módulos ES (`<script type="module">`), carregados direto pelo navegador.`
4. Section 2: replace the lines for `js/config.js` through `js/pages/legal.js` (lines 47-56) with:
   ```
   │   ├── js/config.js               ← SUPABASE_URL e SUPABASE_ANON_KEY (chave publicável)
   │   ├── js/lib/                    ← lógica pura, sem DOM, testada no Node (tests/)
   │   │   ├── calculator.js          ← regras e fórmulas, calc(), verdictKind(), RANGES
   │   │   ├── progress.js            ← progress(steps, done), XP_PER_STEP
   │   │   ├── validation.js          ← senha, e-mail, nome, safeNext()
   │   │   ├── people.js              ← userName, firstName, initials
   │   │   └── format.js              ← num, euro, esc
   │   ├── js/core/                   ← partes do navegador compartilhadas (ver seção 4)
   │   │   ├── app.js                 ← startPage(): carregamento, cliques, eventos da conta
   │   │   ├── state.js · steps.js · sync.js · account.js
   │   │   └── header.js · notices.js · forms.js · dom.js
   │   ├── js/pages/<página>.js       ← um módulo por página (home, guide, journey, calculator,
   │   │                                 dashboard, profile, auth, legal)
   ```
   and add before the `README.md` line:
   ```
   ├── tests/                         ← testes automáticos (npm test)
   ├── tools/                         ← serve.js (npm start), bump-version.js, check-versions.js
   ├── .github/workflows/checks.yml   ← lint, testes e versões em cada Pull Request
   ├── package.json · eslint.config.js · .editorconfig
   ```
5. Line 67 becomes:
   `Cada página carrega um único script: `<script type="module" src="js/pages/<página>.js?v=...">`. Ele importa o que usa de `js/core/` e `js/lib/` e chama `startPage({ init, render, actions })`. O `guide.html` usa `js/pages/guide.js`, que só chama `startPage()`.`
6. Section 3, item 2 becomes:
   `2. Os módulos rodam depois que o HTML é lido (módulos ES são adiados por padrão). O módulo da página chama `startPage()` de `core/app.js`.`
   Item 3's intro becomes `` `init()` em `core/app.js`: ``. Its sub-item 3 becomes `` `init` da página, se existir; `` and sub-item 4 becomes `` `render()` (cabeçalho e `render(p)` da página); ``.
7. Section 4: the title becomes `## 4. Núcleo compartilhado (`js/core/` e `js/lib/`)`. Replace the table with:

   | Parte | Módulo | O que faz |
   |---|---|---|
   | Estado | `core/state.js` | `state` (mesmos campos de antes), `setState` (grava no `localStorage` e avisa quem se inscreveu com `onStateChange`), `loadSaved` (também traz taxa e prazo para dentro de `RANGES`) |
   | Etapas | `core/steps.js` | `loadSteps`, `PHASES` e `steps` (preenchidos depois do carregamento), `currentProgress()`, `stepLink`, `calculatorStep`, `phaseCardsHtml` |
   | Progresso | `lib/progress.js` | `progress(steps, done)` e `XP_PER_STEP` |
   | Nuvem | `core/sync.js` | `setDone` (também grava na conta e devolve a promessa), `syncOnSignIn` (soma o progresso local com o da conta) |
   | Cálculo | `lib/calculator.js` | `calc(s)`, `verdictKind(c)` (`"within"`, `"cashShort"`, `"loanOver"`, `"outOfReach"`), `homeVat`, `stampBase`, `stampDuty`, `stampBands`, `htbCap`, `htbLimit`, `htbFor`, `highestPrice`, as constantes da seção 6 e `RANGES` |
   | Conta | `core/account.js` | objeto `Account` (Supabase) |
   | Cabeçalho e área logada | `core/header.js` | `renderHeader` (link ativo, XP, "Sign in" ou círculo), `renderGate`, `setMenu` |
   | Avisos | `core/notices.js` | `showToast(msg, { error, action, sticky })`, `hideToast`, `flash`, `showFlash` |
   | Formulários | `core/forms.js` + `lib/validation.js` | `formValues`, `checkForm`, `watchForm`, `renderPasswordRules`, `sayInForm`; regras `PASSWORD_RULES`, `EMAIL_PATTERN`, `isFullName` |
   | Início e eventos | `core/app.js` | `startPage`, `AUTH_RETURN`, `cleanAuthUrl`, ações comuns (`menu`, `closeToast`, `signOut`), um `click`, um `input` e um `keydown` no `document`, `onAccountChange`, `loadPartials` |
   | Nomes | `lib/people.js` | `userName`, `firstName`, `initials` ("Rodrigo Andrade Brigido" vira "RB") |
   | Utilitários | `lib/format.js` + `core/dom.js` | `num`, `euro`, `esc`; `PAGE`, `bind` |
   | Segurança | `lib/format.js`, `lib/validation.js` | `esc()` em todo texto que vai para `innerHTML`; `safeNext()` aceita só `nome-de-pagina.html` com `#ancora` opcional |

   Line 101 becomes:
   `Cada módulo de página passa a `startPage` os seus ganchos: `init()`, `render(p)` e `actions` (as ações de `data-action` só daquela página). `lib/` nunca importa de `core/`: por isso roda no Node.`
8. Section 6, line 131: `Constantes (no topo da seção de cálculo em `app.js`):` becomes `Constantes (em `docs/js/lib/calculator.js`):`.
9. Section 10, item 1 becomes:
   `1. **Versão nos endereços:** as páginas carregam `css/styles.css?v=AAAAMMDD` e `js/pages/<página>.js?v=AAAAMMDD`, e todo `import` entre módulos também leva `?v=AAAAMMDD`. **Ao mudar qualquer CSS ou JS, rode `npm run bump`**, que troca o número em todos os arquivos de `docs/`. O `npm run check:versions` (também no GitHub Actions) falha se sobrar um número diferente ou um arquivo sem versão: um `import` sem `?v=` criaria uma segunda cópia do módulo, com estado separado.`
10. Section 11, "Local" row, "Como rodar" becomes: `` `npm start` (Node 20+), ou `python -m http.server 8000 --directory docs` ``.
11. Section 12, line 243 becomes:
    `Testes automáticos: `npm test` roda `tests/*.test.js` no Node, sem navegador: calculadora (os valores da seção 12.1), progresso, validação, formatação e as ferramentas de versão. `npm run check` roda lint, testes e versões, igual ao GitHub Actions. O roteiro manual abaixo continua valendo para o que depende do navegador.`
12. After the 12.1 table (after line 265) add:
    `Estes valores estão em `tests/calculator.test.js`. Ao mudar uma regra, atualize a tabela e o teste no mesmo trabalho.`

- [ ] **Step 2: `README.md`**

1. Line 7: "Última revisão" becomes today's date.
2. Replace the "## Rodar no computador" section (lines 18-26) with:

   ````markdown
   ## Rodar no computador

   Precisa do [Node.js](https://nodejs.org/) 20 ou mais novo. Na pasta do repositório, na primeira vez:

   ```bash
   npm install
   ```

   Depois, para abrir o site:

   ```bash
   npm start
   ```

   e abra `http://localhost:8000/`. Quem tem Python também pode usar `python -m http.server 8000 --directory docs`. O site precisa de um servidor porque cabeçalho, rodapé e etapas são carregados por `fetch`: abrir o `index.html` com duplo clique não funciona.

   ## Conferências automáticas

   | Comando | O que faz |
   |---|---|
   | `npm test` | Testes da calculadora (valores de referência do TRD), do progresso, da validação e das ferramentas |
   | `npm run lint` | ESLint: `import` esquecido, variável não declarada, erros comuns |
   | `npm run check:versions` | Confere se todo CSS e JS usa o mesmo `?v=` |
   | `npm run bump` | Troca o `?v=` em todos os arquivos. Use depois de mudar CSS ou JS |
   | `npm run check` | Lint, testes e versões juntos, igual ao GitHub Actions em cada Pull Request |
   ````
3. In "Trabalhar em equipe", step 3's second line ("Mudou algum arquivo `.css` ou `.js`? Troque o número...") becomes:
   `Mudou algum arquivo `.css` ou `.js`? Rode `npm run bump`. Antes de enviar, rode `npm run check`: é o mesmo que o GitHub vai conferir no Pull Request.`

- [ ] **Step 3: `specs/06-Implementation-Plan.md`**

1. Line 3: "Última revisão" becomes today's date and the version `1.4`.
2. After the "Marco 3.3" block (after line 77), add:

   ```markdown
   ### Marco 3.4: Base de engenharia (DD/MM/AAAA) ✅
   - [x] Módulos ES: `js/lib/` (lógica pura, testada no Node) e `js/core/` (navegador); um módulo por página com `startPage()`
   - [x] `app.js` de 540 linhas dividido em módulos com uma responsabilidade cada
   - [x] Testes automáticos (`npm test`) com os valores de referência do TRD 12.1
   - [x] ESLint, `.editorconfig` e `npm start` (sem precisar de Python)
   - [x] `npm run bump` e `npm run check:versions` para o `?v=`
   - [x] GitHub Actions: lint, testes e versões em cada Pull Request
   - Plano: `specs/plans/2026-09-24-engineering-foundation.md`
   ```
3. Marco 5: after "Convidar os 4 colaboradores e proteger a `main`", add:
   `- [ ] Na proteção da `main`, exigir o check **Checks** do GitHub Actions`
4. Marco 10: `- [ ] Testes automáticos da calculadora (página `tests.html` ...)` becomes:
   `- [x] Testes automáticos da calculadora (`tests/calculator.test.js`, no Node, em vez de uma página `tests.html`)`
   and `- [ ] M22 constantes regulatórias num único objeto `RULES`` becomes:
   `- [ ] M22 constantes regulatórias num único objeto `RULES` (já estão todas em `lib/calculator.js`; falta agrupar e mostrar a data da última conferência)`

- [ ] **Step 4: `CLAUDE.md`**

1. In "Tech Stack", the "Scripts" row becomes:
   `| Scripts | ES modules (`<script type="module">`), one entry per page: `js/pages/<page>.js` imports from `js/core/` and `js/lib/` and calls `startPage({ init, render, actions })` |`
   Add a row: `| Tooling | Node.js 20+ for `npm start`, `npm test` (node:test), `npm run lint` (ESLint 9); GitHub Actions runs them on every PR |`
2. In "Project Structure", replace the `js/account.js`, `js/app.js` and `js/pages/*.js` lines with:
   ```
   │   ├── js/lib/               # PURE logic (no DOM): calculator, progress, validation, people, format. Tested in Node
   │   ├── js/core/              # browser parts: app (startPage), state, steps, sync, account, header, notices, forms, dom
   │   ├── js/pages/*.js         # one ES module per page; calls startPage()
   ```
   and add under the tree:
   ```
   ├── tests/                    # npm test (node:test); calculator tests hold the TRD 12.1 reference values
   ├── tools/                    # serve.js, bump-version.js, check-versions.js
   ├── .github/workflows/        # CI: lint + tests + version check
   ```
3. In "Technical Gotchas", replace the first bullet's command with `npm start` (and mention Python as the alternative). Replace the cache-busting bullet with:
   `- **Cache-busting:** changed any `.css` or `.js`? Run `npm run bump`. Every relative `import` must carry the same `?v=` as the pages. A module imported with two different URLs runs twice with separate state. `npm run check:versions` enforces this.`
   Add:
   `- **Layering:** `js/lib/` must never import from `js/core/` or touch the DOM; that is what keeps it testable in Node. New maths or rules go in `lib/` with a test.`
   `- **Before claiming done:** `npm run check` must pass, plus the relevant browser checks in TRD §12.`

- [ ] **Step 5: Commit**

```bash
git add specs/02-TRD.md README.md specs/06-Implementation-Plan.md CLAUDE.md
git commit -m "Document the module structure, the npm commands and the new checks"
```

---

### Task 9: Final verification and hand-off

- [ ] **Step 1: Clean install and full check**

```bash
npm ci
npm run check
```

Expected: lint clean, all tests pass, one `?v=` number.

- [ ] **Step 2: Repeat the browser checks from Task 6 Step 16**, including the console on all 12 pages.

- [ ] **Step 3: Review the whole diff**

```bash
git diff main --stat
```

Expected: no changes to `docs/css/`, `docs/img/`, `docs/fonts/`, `docs/partials/` or the visible content of any HTML page, only the `<script>` lines and `?v=` numbers.

- [ ] **Step 4: Stop and ask the user** before pushing. When they approve:

```bash
git push -u origin engineering-foundation
```

Then open a Pull Request to `main` titled "Engineering foundation: ES modules, tests, lint and CI". Its description lists the new npm commands and says the site looks and behaves exactly as before. Another collaborator reviews it before merging. Warn the team that it touches every page's `<head>` and replaces `docs/js/app.js`, so open branches should merge `main` after it lands.

---

## Out of scope (follow-ups, each its own Pull Request)

- **Progress sync bug:** on every page load, `syncOnSignIn` merges this browser's ticks into the account, so an untick or "Reset progress" done in another browser comes back. Merge only on `SIGNED_IN` or keep per-step dates.
- **Supabase library:** pin an exact version and serve it from `docs/js/vendor/` (removes jsDelivr from the Privacy Policy).
- **`loadSteps` robustness:** `textOf` throws when a step has no tip or time element, which empties the journey on every page.
- **Split `styles.css`** (40 KB) by area, and consider renaming `docs/` to `site/` with a GitHub Actions Pages deploy.
- **Prettier:** agree as a team first; it reformats every file and would clash with open branches.
- **M22 `RULES` object** with a "rules last checked" date shown to users.
