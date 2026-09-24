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
let started = false;

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
  if (started) throw new Error("startPage() was called twice; each page calls it once.");
  started = true;
  page = hooks;
  Object.assign(actions, hooks.actions);
  onStateChange(render);
  listen();
  // Modules run after the HTML is parsed, so this is normally "interactive" already.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}
