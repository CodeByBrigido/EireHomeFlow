// Start-up and what every page shares: rendering, clicks and account events.
// Each page module calls startPage({ init, render, actions }) once:
//   init()     runs once, after the step list has loaded;
//   render(p)  runs after every state change, with p = currentProgress();
//   actions    handlers for data-action="<name>" on that page.
import { firstName, isNewAccount } from "../lib/people.js?v=20260928";
import { safeNext } from "../lib/validation.js?v=20260928";
import { Account } from "./account.js?v=20260928";
import { PAGE } from "./dom.js?v=20260928";
import { renderHeader, setMenu } from "./header.js?v=20260928";
import { flash, hideToast, showFlash, showToast } from "./notices.js?v=20260928";
import { loadSaved, onStateChange, setState, state } from "./state.js?v=20260928";
import { currentProgress, loadSteps, stepLink, steps } from "./steps.js?v=20260928";
import { syncOnSignIn } from "./sync.js?v=20260928";

// Links in the confirmation and password emails, and the return from Google, bring people back
// with details after "#" or "?" (type=signup, access_token, error_code=otp_expired, error=access_denied).
// Read them before Supabase clears them.
const AUTH_RETURN = (() => {
  const params = new URLSearchParams(location.search.slice(1) + "&" + location.hash.slice(1));
  return {
    type: params.get("type"),
    token: params.has("access_token") || params.has("code"),
    error: params.get("error_code") || params.get("error"),
    description: (params.get("error_description") || "").trim(),
    welcomed: false,
  };
})();

// What to say when Google sign-in comes back with an error instead of a session.
function googleErrorText(ret) {
  if (ret.error === "access_denied") return "Signing in with Google was cancelled. You can try again, or use your email.";
  return "Signing in with Google did not work" + (ret.description ? ": " + ret.description.replace(/\.$/, "") : "") + ". Please try again, or use your email.";
}
const cleanAuthUrl = () => history.replaceState(null, "", location.pathname);

let page = {};
let started = false;

const actions = {
  menu: () => setMenu(document.getElementById("account-menu").hidden),
  closeToast: hideToast,
  signOut: async () => {
    setMenu(false);
    // The account circle can show before Supabase has answered; sign out only once it has.
    await Account.whenReady;
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
  // Back from Google: greet the person and take them on to the page they signed in from.
  // No need to wait for the progress sync here: the next page runs it as it opens.
  if (user && AUTH_RETURN.token && !AUTH_RETURN.welcomed && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
    const google = Account.takeGoogleReturn();
    if (google) {
      AUTH_RETURN.welcomed = true;
      const name = firstName(user);
      flash(isNewAccount(user)
        ? "Your account is ready. Welcome to ÉireHome Flow" + (name ? ", " + name : "") + "!"
        : "Welcome back" + (name ? ", " + name : "") + ".");
      location.replace(safeNext(google.next, "dashboard.html"));
      return;
    }
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

// The header, footer and notices are already in the page (stamped from partials/ by
// npm run partials), so only the step list is fetched here.
async function init() {
  loadSaved();
  // Draw the header now, before the step list arrives: XP from the steps ticked in this browser.
  renderHeader({ doneCount: Object.values(state.done).filter(Boolean).length });
  await loadSteps();
  try {
    if (page.init) page.init();
  } finally {
    // Render even if the page's init failed, so the shared header still shows its XP.
    render();
  }
  showFlash();
  if (AUTH_RETURN.error) {
    const google = Account.takeGoogleReturn();
    showToast(google ? googleErrorText(AUTH_RETURN) : "This link has expired or has already been used. Sign in, or ask for a new link.",
      { error: true, sticky: true, action: google ? { label: "Sign in", href: "signin.html?next=" + encodeURIComponent(safeNext(google.next, "dashboard.html")) } : null });
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
