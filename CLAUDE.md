# CLAUDE.md: ÉireHome Flow

> Context for AI-assisted development. Read it at the start of every session.
> This project is standalone. Rules, stack or memory from other projects on this machine do not apply here.

---

## Project Overview

**ÉireHome Flow** is a guide for first-time home buyers in Ireland: 6 phases, 31 steps
(from saving the deposit to moving in), an affordability calculator, and progress saved to an account.

- **Live site:** https://codebybrigido.github.io/EireHomeFlow/
- **Repo:** `CodeByBrigido/EireHomeFlow`, default branch `main`
- **Project docs** (`specs/`, `README.md`) are written in **Portuguese**.
- **Site copy** is in **British/Irish English**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Plain HTML, CSS and JavaScript: no framework, no build, no minification |
| Scripts | ES modules (`<script type="module">`), one entry per page: `js/pages/<page>.js` imports from `js/core/` and `js/lib/` and calls `startPage({ init, render, actions })` once |
| Tooling | Node.js 20.1+ locally (CI uses 22): `npm start`, `npm test` (node:test), `npm run lint` (ESLint 9), `npm run check`; GitHub Actions runs lint, tests and the version check on every PR |
| Auth + data | Supabase (project `dyfxstpbzmihtmccaezs`, eu-west-1), `@supabase/supabase-js@2` from jsDelivr |
| Hosting | GitHub Pages, serving `docs/` from `main` |

---

## Project Structure

```
EireHomeFlow/
├── docs/                     # THE SITE (published by GitHub Pages)
│   ├── *.html                # 12 pages, one per place; <body data-page="...">
│   ├── guide.html            # SINGLE SOURCE of the 31 steps' content (other pages fetch + parse it)
│   ├── partials/             # header.html, footer.html: the SOURCE; npm run partials stamps them into every page
│   ├── css/styles.css
│   ├── js/config.js          # SUPABASE_URL + publishable anon key (the only key allowed in the repo)
│   ├── js/lib/               # PURE logic (no DOM): calculator, progress, validation, people, format. Tested in Node
│   ├── js/core/              # browser parts: app (startPage), state, steps, sync, account, header, notices, forms, dom
│   ├── js/pages/*.js         # one ES module per page; calls startPage()
│   └── img/, fonts/
├── specs/                    # source of truth (see table below)
├── tests/                    # npm test (node:test); calculator tests hold the TRD 12.1 reference values
├── tools/                    # serve.js, bump-version.js, check-versions.js, versions.js, partials.js, stamp-partials.js
├── .github/workflows/        # CI: lint + tests + version check + header/footer check
├── supabase/email-templates/ # confirmation + reset emails, pasted into the Supabase dashboard
└── _original-Backup/         # original Claude Design bundle: READ ONLY, reference only
```

### Specs: read the relevant one before changing anything

| Doc | Consult before |
|-----|----------------|
| `specs/01-PRD.md` | accepting or rejecting any new idea |
| `specs/02-TRD.md` | touching code (architecture, the `js/core/` and `js/lib/` modules, HTML `data-*` conventions, calculator formulas, manual test script) |
| `specs/03-UI-UX-Design.md` | changing a screen or writing copy (tone of voice) |
| `specs/04-App-Flow.md` | changing navigation, unlock rules or login |
| `specs/05-Backend-Schema.md` | touching the database, auth or the step list |
| `specs/06-Implementation-Plan.md` | start of each session (what's done, what's next) |
| `specs/07-Design-System.md` | creating or changing any visual component |
| `specs/AUDITORIA.md` | open audit items (2026-09-23) |
| `specs/SETUP-CONTAS.md` | Supabase setup steps |

---

## Rules (from the README; non-negotiable)

1. **Docs first, code second.** A behaviour change goes in only if the matching `specs/` doc is updated in the same piece of work.
2. **If code and docs disagree,** the code is what exists and the doc is what was agreed. Decide which is right and fix the other straight away.
3. **Nothing ships without the PRD.** A new idea that isn't in the PRD goes to "Questões em aberto" or "Fora de escopo" first.
4. **Step IDs are permanent.** ID = `<phase slug>-<index in phase, from 0>`, derived from the order in `docs/guide.html`.
   - OK: edit a step's text, checklist, links, tip, time, cost, `data-auto`, `data-numbers`; add a step at the **end** of a phase.
   - NOT OK without an SQL migration of `progress.done`: insert mid-phase, reorder, move between phases, or rename a phase `data-slug`. Doing so silently corrupts users' saved progress.
5. **Copy follows the tone-of-voice guide:** British/Irish English, **no dashes (em/en dashes)**, no clichés.
6. **Every doc has "Última revisão"** at the top. Update the date when you change its content.

---

## Technical Gotchas

- **Must be served over HTTP.** Partials and steps load by `fetch`; `file://` breaks the header, footer and steps.
  ```bash
  npm start
  ```
  Then open http://localhost:8000/. Without Node: `python -m http.server 8000 --directory docs`, but on Windows some Python installs serve `.js` with the wrong type and the modules do not load (nothing works and the steps stay empty), so `npm start` is the recommended way.
- **Cache-busting:** changed any `.css` or `.js`? Run `npm run bump` (`npm run bump -- YYYYMMDD` for a second change on the same day). Every relative `import` must carry the same `?v=` as the pages. A module imported with two different URLs runs twice with separate state. `npm run check:versions` enforces this. GitHub Pages caches for 10 minutes, so without the bump a visitor can get a new page with an old script.
- **Header and footer:** edit `docs/partials/*.html`, never the copy between `<!-- include ... -->` and `<!-- /include -->` in a page, then run `npm run partials`. `npm run check:partials` (in `npm run check` and CI) fails if a page is out of date.
- **Layering:** `js/lib/` must never import from `js/core/` or touch the DOM; that is what keeps it testable in Node. New maths or rules go in `lib/` with a test.
- **One `startPage()` per page:** it throws if called twice. Page-only `data-action` handlers go in the `actions` hook, not on `document`.
- **Backwards-tolerant scripts:** page modules must tolerate missing parts (e.g. `s.howto || []`), and function signatures used across pages must stay compatible.
- **Security:**
  - Run all text going into `innerHTML` through `esc()`; use `textContent` for plain text.
  - `?next=` goes through `safeNext()`.
  - Never put the Supabase `service_role`/secret key in the repo; RLS is what protects the data.
- **Calculator numbers never go to the cloud.** Only `progress.done` (step ID → `true`) syncs. Journey and Dashboard read numbers from `localStorage` (`eirehome-flow`).
- **Calculator changes:** update the reference values in TRD §12.1 and `tests/calculator.test.js` together (e.g. defaults → max price €209,851). Formulas and legal constants (stamp duty, HTB, VAT) are sourced from Revenue/Central Bank; keep the TRD source links in sync.
- **Tests:** `npm test` covers the pure logic in `js/lib/` and the version tools. Anything that needs a browser (pages, accounts, layout) still goes through the manual script in TRD §12. Check there's no horizontal scroll at 320/375/768/1024/1440 px and that everything works by keyboard.
- **Before claiming done:** `npm run check` must pass, plus the relevant browser checks in TRD §12.

---

## Git Workflow

1. `git pull` before starting.
2. One branch per change: `git switch -c <change-name>`.
3. Make the change, check it in the browser, update the affected `specs/`, run `npm run bump` if CSS or JS changed, then `npm run check`.
4. `git push -u origin <change-name>` and open a Pull Request.
5. Someone else reviews; merging to `main` publishes the site within minutes.

**Never commit or push unless the user asks.** Merging to `main` is a production deploy.
