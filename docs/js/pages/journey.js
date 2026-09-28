// My journey: the step path, the step panel and the progress sidebar.
// Links can open a step (journey.html#step-aip-0) or jump to a phase (journey.html#phase-aip).
import { calc, HTB } from "../lib/calculator.js?v=20260929";
import { esc } from "../lib/format.js?v=20260929";
import { Account } from "../core/account.js?v=20260929";
import { startPage } from "../core/app.js?v=20260929";
import { bind } from "../core/dom.js?v=20260929";
import { money, number, percent, t } from "../core/i18n.js?v=20260929";
import { setState, state } from "../core/state.js?v=20260929";
import { currentProgress, PHASES, stepLink, steps } from "../core/steps.js?v=20260929";
import { setDone } from "../core/sync.js?v=20260929";

const WAVE = [0, 72, 108, 72, 0, -72, -108, -72];
const RING = 2 * Math.PI * 43;

function initPage() {
  const hash = location.hash.slice(1);
  if (hash.startsWith("step-") && steps.some((s) => s.id === hash.slice(5))) state.open = hash.slice(5);
  if (hash.startsWith("phase-")) {
    requestAnimationFrame(() => {
      const phase = document.getElementById(hash);
      if (phase) phase.scrollIntoView();
    });
  }
}

// The open step is part of the address, so it survives a reload and can be shared.
function openStep(id) {
  setState({ open: id });
  history.replaceState(null, "", id ? "#step-" + id : location.pathname);
  document.getElementById("detail").scrollTop = 0; // a new step starts at the top of the panel
}

const nodeFor = (id) => document.querySelector('[data-action="open"][data-id="' + id + '"]');

function focusDetail() {
  if (state.open) document.getElementById("detail-title").focus();
}

function renderPage(p) {
  const openStepData = steps.find((s) => s.id === state.open);
  const compact = !!openStepData;
  document.getElementById("journey").classList.toggle("is-compact", compact);

  const focused = document.activeElement && document.activeElement.dataset.id;
  let idx = -1;
  document.getElementById("journey-phases").innerHTML = PHASES.map((phase) => {
    let dn = 0;
    const items = phase.tasks.map(() => {
      idx += 1;
      const s = steps[idx];
      const checked = !!state.done[s.id];
      const locked = idx > p.unlocked;
      const current = idx === p.unlocked && !checked;
      if (checked) dn += 1;
      const shift = Math.round(WAVE[idx % WAVE.length] * (compact ? 0.34 : 1));
      const nodeClass = "node" + (checked ? " is-done" : locked ? " is-locked" : "") +
        (current ? " is-current" : "") + (state.open === s.id ? " is-open" : "");
      const status = [
        checked ? t("journey:status.completed") : locked ? t("journey:status.locked") : current ? t("journey:status.current") : "",
        s.blocking ? "" : t("journey:status.optional"),
      ].filter(Boolean).map((word) => ", " + word).join("");
      const label = t("journey:node.label", { n: idx + 1, total: steps.length, title: s.title }) + status;
      const callout = current ? `<span class="callout callout--start" aria-hidden="true">${esc(t("journey:callout.start"))}</span>`
        : !s.blocking && !checked ? `<span class="callout" aria-hidden="true">${esc(t("journey:callout.optional"))}</span>` : "";
      return `<li class="path__step" style="--shift:${shift}px">
          ${callout}
          <button type="button" class="${nodeClass}" data-action="open" data-id="${s.id}"${current ? ' aria-current="step"' : ""}
            aria-label="${esc(label)}">${checked ? "✓" : locked ? "🔒" : s.blocking ? "★" : "◆"}</button>
          <span class="path__label${locked ? " is-locked" : checked ? " is-done" : ""}" aria-hidden="true">${esc(s.title)}</span>
        </li>`;
    }).join("");
    const badge = dn === phase.tasks.length ? " is-done" : dn ? " is-active" : "";
    return `<section class="phase" id="phase-${phase.slug}">
        <div class="phase__head">
          <span class="phase__badge${badge}">${phase.n}</span>
          <span class="phase__name">
            <span class="phase__title">${esc(phase.title)}</span>
            <span class="phase__subtitle">${esc(phase.subtitle)}</span>
          </span>
          <span class="phase__count">${number(dn)} / ${number(phase.tasks.length)}</span>
        </div>
        <ol class="path">${items}</ol>
      </section>`;
  }).join("");
  if (focused) {
    const again = nodeFor(focused);
    if (again) again.focus();
  }

  const complete = p.pct === 100;
  document.getElementById("finish-badge").classList.toggle("is-done", complete);
  bind("finishTitle", complete ? t("journey:finish.doneTitle") : t("journey:finish.title"));
  bind("finishNote", complete ? t("journey:finish.doneNote") : t("journey:finish.note"));

  document.getElementById("detail").hidden = !openStepData;
  if (openStepData) renderDetail(p, openStepData);

  document.getElementById("ring-fill").setAttribute("stroke-dasharray", (RING * p.pct / 100).toFixed(1) + " " + RING.toFixed(1));
  bind("pct", percent(p.pct / 100));
  bind("countLabel", t("common:progress.steps", { done: p.doneCount, count: steps.length }));
  const next = steps[p.unlocked];
  bind("nextTitle", next ? next.title : t("journey:next.none"));
}

// The person's figures for a step (data-numbers in guide.html), worked out by calc().
function mineFor(kind, c) {
  const s = state;
  const approx = (n) => t("common:approx", { amount: money(n) });
  if (kind === "calculator") {
    return { title: t("journey:mine.calculator.title"), rows: [
      [t("journey:mine.calculator.maxPrice"), money(c.maxPrice), true],
      [t("journey:mine.calculator.maxLoan", { multiple: number(c.multiple) + "×" }), money(c.maxLoan)],
      [t("journey:mine.calculator.funds"), money(c.funds)],
      [t("journey:mine.calculator.monthly", { price: money(c.price) }), money(c.monthly)],
    ] };
  }
  if (kind === "deposit") {
    return { title: t("journey:mine.deposit.title"), rows: [
      [t("journey:mine.deposit.tenPercent", { price: money(c.price) }), money(c.deposit), true],
      [t("journey:mine.deposit.own"), money(c.own)],
      ...(c.htb ? [[t("journey:mine.deposit.htb"), money(c.htb)]] : []),
    ], note: c.funds >= c.deposit ? t("journey:mine.deposit.covered") : t("journey:mine.deposit.short", { amount: money(c.deposit - c.funds) }) };
  }
  if (kind === "costs") {
    return { title: t("journey:mine.costs.title", { price: money(c.price) }), rows: [
      [t("journey:mine.costs.stamp"), money(c.stamp)],
      [t("journey:mine.costs.solicitor"), approx(c.solicitor)],
      [t("journey:mine.costs.survey"), approx(c.survey)],
      [t("journey:mine.costs.valuation"), approx(c.valuation)],
      [t("journey:mine.costs.total"), money(c.costs), true],
    ], note: !s.newBuild ? "" : s.apartment ? t("journey:mine.costs.newApartment") : t("journey:mine.costs.newHouse") };
  }
  if (kind === "htb") {
    const title = t("journey:mine.htb.title");
    if (!s.ftb) return { title, note: t("journey:mine.htb.mover") };
    if (!s.newBuild) return { title, note: t("journey:mine.htb.secondHand") };
    if (c.price > HTB.priceCap) return { title, note: t("journey:mine.htb.overCap", { price: money(c.price), cap: money(HTB.priceCap) }) };
    if (c.price > c.htbStop) {
      return { title, note: t("journey:mine.htb.loanTooSmall", { minLoan: money(c.price * HTB.minLoanShare), maxLoan: money(c.maxLoan) }) };
    }
    const note = t("journey:mine.htb.note");
    return { title, rows: [
      [t("journey:mine.htb.most", { price: money(c.price) }), money(c.htbCap), true],
      [t("journey:mine.htb.counted"), money(c.htb)],
    ], note: c.loanShare < HTB.minLoanShare ? note + " " + t("journey:mine.htb.borrowEnough", { minLoan: money(c.price * HTB.minLoanShare) }) : note };
  }
  return null;
}

// Figures appear only after the person has saved the calculator, so the example
// numbers are never shown as theirs. They are read from this browser only.
function renderMine(s, isDone) {
  const box = document.getElementById("mine");
  if (!box) return;
  const saved = !!state.calcSaved;
  const mine = s.numbers && (s.auto !== "calculator" || isDone)
    ? (saved ? mineFor(s.numbers, calc(state))
      : { title: t("journey:mine.calculator.title"), note: s.auto === "calculator" ? t("journey:mine.notSaved") : t("journey:mine.saveFirst") })
    : null;
  box.hidden = !mine;
  if (!mine) return;
  bind("mineTitle", mine.title);
  document.getElementById("mine-rows").innerHTML = (mine.rows || []).map(([label, value, strong]) =>
    `<span class="mine__row${strong ? " is-total" : ""}"><span class="mine__label">${esc(label)}</span><span class="mine__value">${esc(value)}</span></span>`).join("");
  const note = document.getElementById("mine-note");
  note.textContent = mine.note || "";
  note.hidden = !mine.note;
}

// The note under a step: how it gets ticked, or why it cannot be yet.
function detailNote(p, s, isDone, locked) {
  const user = Account.user;
  if (s.auto === "calculator") return isDone ? "" : t("journey:note.calculator");
  if (s.auto === "account") {
    if (user) return isDone ? t("journey:note.signedInDone", { email: user.email }) : t("journey:note.signedInTicking", { email: user.email });
    if (!Account.ready) return t("journey:note.checking");
    return Account.enabled ? t("journey:note.signIn") : t("journey:note.accountsOff");
  }
  return locked ? t("journey:note.locked", { title: steps[p.unlocked].title }) : "";
}

// Every step can be read. Completing one by hand needs the earlier blocking steps done.
// Steps with data-auto are ticked by the site: the calculator step when the figures are
// saved there, the account step when the person signs in.
function renderDetail(p, s) {
  const index = steps.indexOf(s);
  const isDone = !!state.done[s.id];
  const locked = index > p.unlocked && !isDone;

  bind("openPhase", s.phase.n + " · " + s.phase.title);
  bind("openStepLabel", t("journey:detail.stepOf", { n: index + 1, total: steps.length }));
  bind("openTitle", s.title);
  bind("openTime", s.time);
  bind("openCost", s.cost);
  bind("openBody", s.body);
  const image = document.getElementById("open-image");
  document.getElementById("open-figure").hidden = !s.image;
  if (s.image && image.getAttribute("src") !== s.image) {
    image.src = s.image;
    image.alt = s.imageAlt;
  }
  bind("openTip", s.tip);
  const tag = document.getElementById("open-tag");
  tag.textContent = s.blocking ? t("guide:kind.blocking") : t("guide:kind.optional");
  tag.classList.toggle("is-optional", !s.blocking);
  document.getElementById("open-checklist").innerHTML = s.checklist
    .map((text) => `<li><span class="checklist__mark" aria-hidden="true">◆</span><span>${esc(text)}</span></li>`).join("");
  renderMine(s, isDone);

  // The page and the step list can briefly come from different versions (GitHub Pages
  // caches files for 10 minutes), so the newer parts are optional here.
  const howto = s.howto || [];
  const links = (s.links || []).filter((link) => /^https:\/\//.test(link.href));
  const howtoBox = document.getElementById("open-howto-box");
  const linksBox = document.getElementById("open-links");
  if (howtoBox) {
    howtoBox.hidden = !howto.length;
    bind("openHowtoLabel", s.howtoLabel || t("journey:detail.howto"));
    document.getElementById("open-howto").innerHTML = howto.map((text) => `<li>${esc(text)}</li>`).join("");
  }
  if (linksBox) {
    linksBox.hidden = !links.length;
    const newTab = esc(t("common:newTab"));
    linksBox.innerHTML = links.map((link) =>
      `<a class="step-link" href="${esc(link.href)}" target="_blank" rel="noopener noreferrer">${esc(link.text)}<span class="sr-only"> ${newTab}</span><span aria-hidden="true"> ↗</span></a>`).join("");
  }

  const note = detailNote(p, s, isDone, locked);
  const noteEl = document.getElementById("detail-note");
  noteEl.textContent = note;
  noteEl.hidden = !note;

  // Manual steps get the tick button; the calculator and account steps get a link instead.
  const toggle = document.getElementById("toggle-step");
  toggle.hidden = !!s.auto;
  toggle.disabled = locked;
  bind("openAction", isDone ? t("journey:detail.undo") : t("journey:detail.complete"));
  const go = document.getElementById("step-go");
  if (!go) return;
  const link = s.auto === "calculator"
    ? { href: "calculator.html", text: isDone ? t("journey:detail.changeNumbers") : t("journey:detail.openCalculator"), main: !isDone }
    : s.auto === "account" && !Account.user && Account.ready && Account.enabled
      ? { href: "signup.html?next=" + encodeURIComponent(stepLink(s)), text: t("journey:detail.signUp"), main: true } : null;
  go.hidden = !link;
  if (link) {
    go.href = link.href;
    go.textContent = link.text;
    go.classList.toggle("btn--primary", link.main);
    go.classList.toggle("btn--outline", !link.main);
  }
}

startPage({ init: initPage, render: renderPage, actions: {
  open: (el) => {
    openStep(el.dataset.id);
    focusDetail();
  },
  close: () => {
    const id = state.open;
    openStep(null);
    const node = nodeFor(id);
    if (node) node.focus();
  },
  toggle: () => {
    const s = steps.find((step) => step.id === state.open);
    if (!s || s.auto) return;
    const isDone = !!state.done[s.id];
    if (!isDone && steps.indexOf(s) > currentProgress().unlocked) return;
    setDone({ ...state.done, [s.id]: !isDone });
  },
  prev: () => {
    const i = steps.findIndex((s) => s.id === state.open);
    if (i > 0) openStep(steps[i - 1].id);
  },
  next: () => {
    const i = steps.findIndex((s) => s.id === state.open);
    if (i > -1 && i < steps.length - 1) openStep(steps[i + 1].id);
  },
  openNext: () => {
    const next = steps[currentProgress().unlocked];
    if (!next) return;
    openStep(next.id);
    focusDetail();
  },
  // A signed-in person keeps the account step: being signed in is what it asks for.
  reset: () => {
    const accountStep = steps.find((s) => s.account);
    setDone(Account.user && accountStep ? { [accountStep.id]: true } : {});
  },
} });
