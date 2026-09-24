// My journey: the step path, the step panel and the progress sidebar.
// Links can open a step (journey.html#step-aip-0) or jump to a phase (journey.html#phase-aip).

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

// Every step can be read. Completing one needs the earlier blocking steps done,
// and the account step also needs the person to be signed in.
function renderDetail(p, s) {
  const index = steps.indexOf(s);
  const isDone = !!state.done[s.id];
  const locked = index > p.unlocked && !isDone;
  const needsAccount = s.account && !isDone && !Account.user;

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

  const note = locked
    ? 'You can read this step now. You can complete it once you finish "' + steps[p.unlocked].title + '".'
    : !needsAccount ? ""
      : !Account.ready ? "Checking your account..."
        : Account.enabled ? "Create an account or sign in to complete this step."
          : "Accounts are not switched on yet, so this step cannot be completed.";
  const noteEl = document.getElementById("detail-note");
  noteEl.textContent = note;
  noteEl.hidden = !note;

  document.getElementById("toggle-step").disabled = locked || (needsAccount && !(Account.ready && Account.enabled));
  bind("openAction", isDone ? "Mark as not done" : needsAccount ? "Create account or sign in" : "Complete step +25 XP");
}

Object.assign(actions, {
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
    const isDone = !!state.done[s.id];
    if (!isDone && steps.indexOf(s) > progress().unlocked) return;
    if (!isDone && s.account && !Account.user) {
      location.href = "signup.html?next=" + encodeURIComponent(stepLink(s));
      return;
    }
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
    const next = steps[progress().unlocked];
    if (!next) return;
    openStep(next.id);
    focusDetail();
  },
  reset: () => setDone({}),
});
