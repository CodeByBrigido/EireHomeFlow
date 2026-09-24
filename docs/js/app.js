// ÉireHome Flow: code shared by every page. Partials, saved progress, the step list
// (read from guide.html), calculator maths, the header and account menu, notices,
// form checks and account events. Each page adds a script in js/pages/ that can define
// initPage() and renderPage(p) and add entries to `actions`.

const XP_PER_STEP = 25;
const STORAGE_KEY = "eirehome-flow";
const FLASH_KEY = "eirehome-flash";
const SAVED_FIELDS = ["ftb", "joint", "salary", "salary2", "savings", "gift", "htb", "price", "rate", "term"];
const PAGE = document.body.dataset.page;

const state = {
  done: {}, open: null,
  ftb: true, joint: false,
  salary: "45000", salary2: "38000", savings: "35000", gift: "0", htb: "0", price: "380000",
  rate: "3.9", term: "30",
};

let PHASES = [];
let steps = [];

const num = (v) => Number(v) || 0;
const euro = (n) => "€" + Math.round(n).toLocaleString("en-IE");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function bind(name, value) {
  document.querySelectorAll('[data-bind="' + name + '"]').forEach((el) => { el.textContent = value; });
}

// Links in the confirmation and password emails bring people back with details after
// "#" (e.g. type=signup, or error_code=otp_expired). Read them before Supabase clears them.
const AUTH_RETURN = (() => {
  const params = new URLSearchParams(location.search.slice(1) + "&" + location.hash.slice(1));
  return { type: params.get("type"), error: params.get("error_code") || params.get("error"), welcomed: false };
})();
const cleanAuthUrl = () => history.replaceState(null, "", location.pathname);

const userName = (user) => ((user && user.user_metadata && user.user_metadata.full_name) || "").trim();
const firstName = (user) => userName(user).split(/\s+/)[0] || "";

// First letter of the first and last names: "Rodrigo Andrade Brigido" gives "RB".
function initials(user) {
  const words = userName(user).split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] || user.email || "?")[0];
  return letters.toUpperCase();
}

// Only relative page links are followed after signing in, e.g. "journey.html#step-aip-0".
const safeNext = (value, fallback) => (/^[a-z-]+\.html(#[a-z0-9-]+)?$/.test(value || "") ? value : fallback);

/* ---------- State and saving ---------- */

function setState(patch) {
  Object.assign(state, patch);
  save();
  render();
}

// Progress and calculator figures are kept in this browser. Signed-in users also get a cloud copy.
function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return;
    if (saved.done) state.done = saved.done;
    for (const key of SAVED_FIELDS) if (key in saved) state[key] = saved[key];
  } catch (err) {
    // Storage blocked or unreadable: start fresh.
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

function setDone(done) {
  setState({ done });
  if (Account.user) Account.saveProgress(done).catch((err) => console.error("Could not save progress to the account.", err));
}

/* ---------- Steps (the content lives in guide.html) ---------- */

async function loadSteps() {
  let doc = document;
  try {
    if (!document.querySelector(".guide-phase")) {
      const res = await fetch("guide.html");
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
    tasks: [...el.querySelectorAll(".guide-step")].map((s) => ({
      title: textOf(s, ".guide-step__title"),
      body: textOf(s, ".guide-step__body"),
      blocking: s.dataset.blocking === "true",
      account: s.dataset.account === "true",
      time: textOf(s, ".guide-step__time"),
      cost: textOf(s, ".guide-step__cost"),
      checklist: [...s.querySelectorAll(".guide-step__checklist li")].map((li) => li.textContent.trim()),
      tip: textOf(s, ".guide-step__tip-text"),
      image: s.querySelector(".guide-step__image") ? s.querySelector(".guide-step__image").getAttribute("src") : "",
      imageAlt: s.querySelector(".guide-step__image") ? s.querySelector(".guide-step__image").alt : "",
    })),
  }));
  steps = PHASES.flatMap((phase) => phase.tasks.map((task, i) => ({ ...task, id: phase.slug + "-" + i, phase })));
}

function progress() {
  let unlocked = 0;
  for (const s of steps) {
    if (s.blocking && !state.done[s.id]) break;
    unlocked += 1;
  }
  const doneCount = steps.filter((s) => state.done[s.id]).length;
  return { unlocked, doneCount, pct: steps.length ? Math.round((doneCount / steps.length) * 100) : 0 };
}

const stepLink = (s) => "journey.html#step-" + s.id;

function phaseCardsHtml() {
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

/* ---------- Calculator maths (calculator and dashboard) ---------- */

function calc() {
  const s = state;
  const income = num(s.salary) + (s.joint ? num(s.salary2) : 0);
  const multiple = s.ftb ? 4 : 3.5;
  const depositRate = 0.1; // Central Bank minimum for first-time and subsequent buyers since 2023
  const maxLoan = income * multiple;
  const price = num(s.price);
  const htbCap = Math.min(30000, price * 0.1);
  const htb = s.ftb ? Math.min(num(s.htb), htbCap) : 0;
  const funds = num(s.savings) + num(s.gift) + htb;
  const solicitor = 2500, survey = 400, valuation = 150;
  const fixedFees = solicitor + survey + valuation;
  // Highest price where cash covers the minimum deposit plus costs, and savings above
  // that minimum go into the purchase so the loan stays within the income limit.
  // Stamp duty is taken as 1%, the rate up to €1m.
  const fundsLimitedPrice = Math.max(0, (funds - fixedFees) / (depositRate + 0.01));
  const loanLimitedPrice = Math.max(0, (maxLoan + funds - fixedFees) / 1.01);
  const maxPrice = Math.min(fundsLimitedPrice, loanLimitedPrice);
  const deposit = price * depositRate;
  const stamp = price * 0.01;
  const cashNeeded = deposit + stamp + fixedFees;
  const extraSavings = Math.max(0, funds - cashNeeded);
  const loanNeeded = Math.max(0, price - deposit - extraSavings);
  const r = num(s.rate) / 100 / 12;
  const n = num(s.term) * 12;
  const monthly = r > 0 && n > 0 ? (loanNeeded * r) / (1 - Math.pow(1 + r, -n)) : loanNeeded / (n || 1);
  return { multiple, depositRate, maxLoan, price, htbCap, funds, loanLimitedPrice, fundsLimitedPrice, maxPrice,
    deposit, stamp, solicitor, survey, valuation, cashNeeded, extraSavings, loanNeeded, monthly,
    gap: cashNeeded - funds, loanOver: loanNeeded - maxLoan };
}

/* ---------- Rendering ---------- */

function render() {
  const p = progress();
  renderHeader(p);
  if (typeof renderPage === "function") renderPage(p);
}

function renderHeader(p) {
  document.querySelectorAll(".nav__link").forEach((link) => {
    const active = link.dataset.page === PAGE;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const streak = Math.min(p.doneCount, 7);
  bind("streak", streak + (streak === 1 ? " day" : " days"));
  bind("xp", p.doneCount * XP_PER_STEP);

  // Signed out: "Sign in" link. Signed in: circle with initials that opens the account menu.
  const user = Account.user;
  const signIn = document.getElementById("signin-link");
  const accountNav = document.getElementById("account-nav");
  if (signIn) signIn.hidden = !!user;
  if (accountNav) accountNav.hidden = !user;
  if (!user) return;
  bind("initials", initials(user));
  bind("userName", userName(user) || "Your account");
  bind("userEmail", user.email);
  const avatar = document.getElementById("avatar");
  if (avatar) avatar.setAttribute("aria-label", "Account menu for " + (userName(user) || user.email));
}

// Pages for signed-in people show a notice until we know someone is signed in.
function renderGate() {
  const user = Account.user;
  document.getElementById("gate").hidden = !!user;
  document.getElementById("signed-in").hidden = !user;
  if (!user) {
    bind("gateText", !Account.ready ? "Loading your account..."
      : Account.enabled ? "Sign in to see this page. Your journey, numbers and details are waiting for you."
        : "Accounts are not switched on yet. Please check back soon.");
    document.getElementById("gate-actions").hidden = !Account.ready || !Account.enabled;
  }
  return user;
}

function setMenu(open) {
  const menu = document.getElementById("account-menu");
  if (!menu) return;
  menu.hidden = !open;
  document.getElementById("avatar").setAttribute("aria-expanded", open);
}

/* ---------- Notices ---------- */

let toastTimer = null;

function showToast(message, { error = false, action = null, sticky = false } = {}) {
  const box = document.getElementById("toast");
  if (!box) return;
  clearTimeout(toastTimer);
  box.classList.toggle("is-error", error);
  box.querySelector(".toast__icon").textContent = error ? "!" : "✓";
  const link = document.getElementById("toast-action");
  link.hidden = !action;
  if (action) {
    link.textContent = action.label;
    link.href = action.href;
  }
  const text = document.getElementById("toast-text");
  text.textContent = "";
  box.hidden = false;
  // Filling the text a moment after showing the box lets screen readers announce it.
  setTimeout(() => { text.textContent = message; }, 50);
  if (!sticky) toastTimer = setTimeout(hideToast, 7000);
}

function hideToast() {
  clearTimeout(toastTimer);
  const box = document.getElementById("toast");
  if (box) box.hidden = true;
}

// A notice to show on the next page, e.g. "Welcome back" after signing in.
function flash(message, options) {
  try {
    sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message, options }));
  } catch (err) {
    // Storage blocked: the next page simply shows no notice.
  }
}

function showFlash() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(FLASH_KEY));
    sessionStorage.removeItem(FLASH_KEY);
    if (saved) showToast(saved.message, saved.options);
  } catch (err) {
    // Nothing to show.
  }
}

/* ---------- Form checks (sign-up, sign-in, passwords, profile) ---------- */

// New passwords need 8+ characters, a capital letter and a symbol from the set Supabase Auth accepts.
const PASSWORD_RULES = {
  length: (pw) => pw.length >= 8,
  upper: (pw) => /\p{Lu}/u.test(pw),
  special: (pw) => /[!@#$%^&*()_+\-=[\]{};'\\:"|<>?,./`~]/.test(pw),
};
const strongPassword = (pw) => Object.values(PASSWORD_RULES).every((rule) => rule(pw));
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isFullName = (name) => name.trim().split(/\s+/).filter((word) => (word.match(/\p{L}/gu) || []).length >= 2).length >= 2;

// Each check returns an error message, or "" when the field is fine. A form lists the
// fields to check in data-fields; data-password="current" means sign-in (no strength rules).
const FIELD_CHECKS = {
  name: (v) => (isFullName(v.name) ? "" : "Enter your first and last name."),
  email: (v) => (EMAIL_PATTERN.test(v.email.trim()) ? "" : "Enter a valid email address, like name@example.com."),
  password: (v, form) => (form.dataset.password === "current"
    ? (v.password ? "" : "Enter your password.")
    : (strongPassword(v.password) ? "" : "Your password does not meet the requirements below.")),
  confirm: (v) => (!v.confirm ? "Confirm your password." : v.confirm === v.password ? "" : "The passwords do not match."),
};

const formFields = (form) => form.dataset.fields.split(" ");

function formValues(form) {
  const values = {};
  for (const el of form.elements) if (el.name) values[el.name] = el.value;
  return values;
}

function markField(form, field, message) {
  const input = form.elements[field];
  input.closest(".field").classList.toggle("is-invalid", !!message);
  if (message) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
  form.querySelector("#error-" + field).textContent = message;
  const rules = form.querySelector(".password-rules");
  if (field === "password" && rules) rules.classList.toggle("is-invalid", !!message);
}

function checkField(form, field) {
  const message = FIELD_CHECKS[field](formValues(form), form);
  markField(form, field, message);
  return message;
}

// Checks every field; marks the wrong ones in red and moves focus to the first of them.
function checkForm(form) {
  const invalid = formFields(form).filter((field) => checkField(form, field));
  if (invalid.length) form.elements[invalid[0]].focus();
  return invalid.length === 0;
}

function renderPasswordRules(form) {
  const pw = form.elements.password ? form.elements.password.value : "";
  form.querySelectorAll(".password-rules li").forEach((li) => li.classList.toggle("is-met", PASSWORD_RULES[li.dataset.rule](pw)));
}

// Live feedback: a red field turns back to normal once fixed, and leaving a filled field checks it.
function watchForm(form) {
  form.addEventListener("input", (e) => {
    const field = e.target.name;
    if (field === "password") renderPasswordRules(form);
    if (e.target.getAttribute("aria-invalid") === "true") checkField(form, field);
    if (field === "password" && form.elements.confirm && form.elements.confirm.getAttribute("aria-invalid") === "true") checkField(form, "confirm");
  });
  form.addEventListener("focusout", (e) => {
    if (formFields(form).includes(e.target.name) && e.target.value) checkField(form, e.target.name);
  });
}

const sayInForm = (form, message) => { form.querySelector(".form-status").textContent = message; };

/* ---------- Actions and events ---------- */

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

// On sign-in, progress from this browser and from the account are merged (a step
// done in either place stays done) and saved back.
async function onAccountChange(user, event) {
  if (event === "PASSWORD_RECOVERY" && PAGE !== "new-password") {
    location.replace("new-password.html");
    return;
  }
  if (user && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "PASSWORD_RECOVERY")) {
    try {
      const merged = { ...(await Account.loadProgress()) };
      for (const id in state.done) if (state.done[id]) merged[id] = true;
      setDone(merged);
    } catch (err) {
      console.error("Could not load progress from the account.", err);
    }
  }
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

/* ---------- Start-up ---------- */

// Header, footer and notices live in partials/ and are fetched at load. fetch() needs the site
// to be served over http(s): GitHub Pages, or `python -m http.server` from docs/ locally.
async function loadPartials() {
  await Promise.all([...document.querySelectorAll("[data-include]")].map(async (slot) => {
    try {
      const res = await fetch(slot.dataset.include);
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
  if (typeof initPage === "function") initPage();
  render();
  showFlash();
  if (AUTH_RETURN.error) {
    showToast("This link has expired or has already been used. Sign in, or ask for a new link.", { error: true, sticky: true });
    cleanAuthUrl();
  }
  Account.init(onAccountChange);
}

document.addEventListener("DOMContentLoaded", init);
