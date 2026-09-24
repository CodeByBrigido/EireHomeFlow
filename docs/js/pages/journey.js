// My journey: the step path, the step panel and the progress sidebar.
// Links can open a step (journey.html#step-aip-0) or jump to a phase (journey.html#phase-aip).
import { calc, HTB } from "../lib/calculator.js?v=20260924";
import { esc, euro } from "../lib/format.js?v=20260924";
import { Account } from "../core/account.js?v=20260924";
import { startPage } from "../core/app.js?v=20260924";
import { bind } from "../core/dom.js?v=20260924";
import { setState, state } from "../core/state.js?v=20260924";
import { currentProgress, PHASES, stepLink, steps } from "../core/steps.js?v=20260924";
import { setDone } from "../core/sync.js?v=20260924";

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
      const status = [checked ? "completed" : locked ? "locked" : current ? "current step" : "", s.blocking ? "" : "optional"]
        .filter(Boolean).map((word) => ", " + word).join("");
      const callout = current ? '<span class="callout callout--start" aria-hidden="true">Start here</span>'
        : !s.blocking && !checked ? '<span class="callout" aria-hidden="true">Optional</span>' : "";
      return `<li class="path__step" style="--shift:${shift}px">
          ${callout}
          <button type="button" class="${nodeClass}" data-action="open" data-id="${s.id}"${current ? ' aria-current="step"' : ""}
            aria-label="${esc("Step " + (idx + 1) + " of " + steps.length + ": " + s.title + status)}">${checked ? "✓" : locked ? "🔒" : s.blocking ? "★" : "◆"}</button>
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
          <span class="phase__count">${dn} / ${phase.tasks.length}</span>
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
  bind("finishTitle", complete ? "Settled in" : "Home, fully settled");
  bind("finishNote", complete ? "Every step done, floors and curtains included." : "Unlocks when every blocking step is ticked.");

  document.getElementById("detail").hidden = !openStepData;
  if (openStepData) renderDetail(p, openStepData);

  document.getElementById("ring-fill").setAttribute("stroke-dasharray", (RING * p.pct / 100).toFixed(1) + " " + RING.toFixed(1));
  bind("pct", p.pct + "%");
  bind("countLabel", p.doneCount + " of " + steps.length + " steps");
  const next = steps[p.unlocked];
  bind("nextTitle", next ? next.title : "Put the kettle on");
}

// The person's figures for a step (data-numbers in guide.html), worked out by calc().
function mineFor(kind, c) {
  const s = state;
  if (kind === "calculator") {
    return { title: "Your numbers", rows: [
      ["Maximum property price", euro(c.maxPrice), true],
      ["Maximum mortgage (" + c.multiple + "×)", euro(c.maxLoan)],
      ["Funds available", euro(c.funds)],
      ["Monthly repayment for a " + euro(c.price) + " home", euro(c.monthly)],
    ] };
  }
  if (kind === "deposit") {
    return { title: "Your deposit", rows: [
      ["10% of " + euro(c.price), euro(c.deposit), true],
      ["Savings and family gift", euro(c.own)],
      ...(c.htb ? [["Help to Buy", euro(c.htb)]] : []),
    ], note: c.funds >= c.deposit ? "Your funds cover the deposit." : "You are " + euro(c.deposit - c.funds) + " short of the deposit." };
  }
  if (kind === "costs") {
    return { title: "Your extra costs on " + euro(c.price), rows: [
      ["Stamp duty", euro(c.stamp)],
      ["Solicitor", "~" + euro(c.solicitor)],
      ["Structural survey", "~" + euro(c.survey)],
      ["Bank valuation", "~" + euro(c.valuation)],
      ["Total, on top of the deposit", euro(c.costs), true],
    ], note: s.newBuild ? "The calculator is set to a new " + (s.apartment ? "apartment" : "house") + ", so stamp duty is worked out on the price without " +
      (s.apartment ? "9%" : "13.5%") + " VAT." : "" };
  }
  if (kind === "htb") {
    const title = "Help to Buy and you";
    if (!s.ftb) return { title, note: "Your calculator says you are moving home. Help to Buy is for first-time buyers only, so you can skip this optional step." };
    if (!s.newBuild) return { title, note: "Your calculator is set to a second-hand home. Help to Buy only covers new builds and self-builds, so choose New house or New apartment in the calculator if that is what you are looking at." };
    if (c.price > HTB.priceCap) return { title, note: "Your target price of " + euro(c.price) + " is above the " + euro(HTB.priceCap) + " limit, so Help to Buy would not apply." };
    if (c.price > c.htbStop) {
      return { title, note: "Help to Buy needs a mortgage of at least 70% of the price, which is " + euro(c.price * HTB.minLoanShare) +
        " at your target price. You can borrow up to " + euro(c.maxLoan) + ", so Help to Buy would not apply at this price." };
    }
    const loanShare = c.loanShare < HTB.minLoanShare
      ? " It also needs a mortgage of at least 70% of the price (" + euro(c.price * HTB.minLoanShare) + "), so plan to borrow that much and keep the rest of your savings." : "";
    return { title, rows: [
      ["Most you could get on " + euro(c.price), euro(c.htbCap), true],
      ["Counted in your calculator", euro(c.htb)],
    ], note: "The final amount is also limited by the income tax and DIRT you paid in the last four years. Your Revenue application shows it." + loanShare };
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
      : { title: "Your numbers", note: s.auto === "calculator"
        ? "Your figures are not saved in this browser yet. Open the calculator and choose Save to my journey to see them here."
        : "Save your numbers in the calculator (step 1) to see your own figures here." })
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

// Every step can be read. Completing one by hand needs the earlier blocking steps done.
// Steps with data-auto are ticked by the site: the calculator step when the figures are
// saved there, the account step when the person signs in.
function renderDetail(p, s) {
  const index = steps.indexOf(s);
  const isDone = !!state.done[s.id];
  const locked = index > p.unlocked && !isDone;

  bind("openPhase", s.phase.n + " · " + s.phase.title);
  bind("openStepLabel", "Step " + (index + 1) + " of " + steps.length);
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
  tag.textContent = s.blocking ? "Blocking step" : "Optional step";
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
    bind("openHowtoLabel", s.howtoLabel || "How to do it");
    document.getElementById("open-howto").innerHTML = howto.map((text) => `<li>${esc(text)}</li>`).join("");
  }
  if (linksBox) {
    linksBox.hidden = !links.length;
    linksBox.innerHTML = links.map((link) =>
      `<a class="step-link" href="${esc(link.href)}" target="_blank" rel="noopener noreferrer">${esc(link.text)}<span class="sr-only"> (opens in a new tab)</span><span aria-hidden="true"> ↗</span></a>`).join("");
  }

  const user = Account.user;
  const note = s.auto === "calculator"
    ? (isDone ? "" : "This step is ticked for you when you choose Save to my journey in the calculator.")
    : s.auto === "account"
      ? (user ? "You are signed in as " + user.email + (isDone ? ", so this step is done." : ". This step is being ticked for you.")
        : !Account.ready ? "Checking your account..."
          : Account.enabled ? "This step is ticked for you as soon as you sign in."
            : "Accounts are not switched on yet, so this step cannot be completed.")
      : locked ? 'You can read this step now. You can complete it once you finish "' + steps[p.unlocked].title + '".' : "";
  const noteEl = document.getElementById("detail-note");
  noteEl.textContent = note;
  noteEl.hidden = !note;

  // Manual steps get the tick button; the calculator and account steps get a link instead.
  const toggle = document.getElementById("toggle-step");
  toggle.hidden = !!s.auto;
  toggle.disabled = locked;
  bind("openAction", isDone ? "Mark as not done" : "Complete step +25 XP");
  const go = document.getElementById("step-go");
  if (!go) return;
  const link = s.auto === "calculator" ? { href: "calculator.html", text: isDone ? "Change my numbers" : "Open the calculator", main: !isDone }
    : s.auto === "account" && !user && Account.ready && Account.enabled
      ? { href: "signup.html?next=" + encodeURIComponent(stepLink(s)), text: "Create account or sign in", main: true } : null;
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
