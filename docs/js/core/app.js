// Start-up and what every page shares: rendering, clicks and account events.
// Each page module calls startPage({ init, render, actions }) once:
//   init()     runs once, after the texts and the step list have loaded;
//   render(p)  runs after every state change, with p = currentProgress();
//   actions    handlers for data-action="<name>" on that page.
import { firstName, isNewAccount } from "../lib/people.js?v=20260930";
import { safeNext } from "../lib/validation.js?v=20260930";
import { Account } from "./account.js?v=20260930";
import { PAGE } from "./dom.js?v=20260930";
import { renderHeader, renderHeaderEarly, setMenu } from "./header.js?v=20260930";
import { ready, t } from "./i18n.js?v=20260930";
import { chooseLanguage, renderLanguages, setLanguageMenu } from "./language.js?v=20260930";
import { flash, hideToast, showFlash, showToast } from "./notices.js?v=20260930";
import { loadSaved, onStateChange, setState } from "./state.js?v=20260930";
import { currentProgress, loadSteps, stepLink, steps } from "./steps.js?v=20260930";
import { syncOnSignIn } from "./sync.js?v=20260930";

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
  if (ret.error === "access_denied") return t("common:google.cancelled");
  return ret.description ? t("common:google.failedWith", { reason: ret.description.replace(/\.$/, "") }) : t("common:google.failed");
}
const cleanAuthUrl = () => history.replaceState(null, "", location.pathname);

// A greeting with the first name when there is one.
const greeting = (user, withName, withoutName) => (firstName(user) ? t(withName, { name: firstName(user) }) : t(withoutName));

let page = {};
let started = false;

const actions = {
  menu: () => {
    setLanguageMenu(false);
    setMenu(document.getElementById("account-menu").hidden);
  },
  languageMenu: () => {
    setMenu(false);
    setLanguageMenu(document.getElementById("lang-menu").hidden);
  },
  setLocale: (el) => chooseLanguage(el),
  closeToast: hideToast,
  signOut: async () => {
    setMenu(false);
    // The account circle can show before Supabase has answered; sign out only once it has.
    await Account.whenReady;
    if (Account.enabled) await Account.signOut();
    setState({ done: {}, open: null });
    const message = t("common:account.signedOut");
    if (["dashboard", "profile", "new-password"].includes(PAGE)) {
      flash(message);
      location.href = "index.html";
    } else {
      showToast(message);
    }
  },
};

function render() {
  renderHeader();
  if (page.render) page.render(currentProgress());
}

function listen() {
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#avatar")) setMenu(false);
    if (!e.target.closest("#lang-button, #lang-menu")) setLanguageMenu(false);
    const el = e.target.closest("[data-action]");
    if (el && actions[el.dataset.action]) actions[el.dataset.action](el, e);
  });

  document.addEventListener("input", (e) => {
    const key = e.target.dataset.field;
    if (key) setState({ [key]: e.target.value });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const menus = [["account-menu", "avatar", setMenu], ["lang-menu", "lang-button", setLanguageMenu]];
    for (const [menuId, buttonId, close] of menus) {
      const menu = document.getElementById(menuId);
      if (menu && !menu.hidden) {
        close(false);
        document.getElementById(buttonId).focus();
      }
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
      flash(isNewAccount(user)
        ? greeting(user, "common:welcome.newAccount", "common:welcome.newAccountNoName")
        : greeting(user, "common:welcome.back", "common:welcome.backNoName"));
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
    showToast(greeting(user, "common:welcome.confirmed", "common:welcome.confirmedNoName"), {
      sticky: true,
      action: accountStep ? { label: t("common:welcome.goToJourney"), href: stepLink(accountStep) } : null,
    });
  }
  render();
}

// The header, footer and notices are already in the page (stamped from partials/ by
// npm run partials), so only the texts and the step list are loaded here.
async function init() {
  loadSaved();
  // Draw the header now: the active link, and "Sign in" or the account circle.
  renderHeaderEarly();
  // Both are usually at hand already (the texts from this browser's copy); they load side by side.
  await Promise.all([ready(), loadSteps()]);
  renderLanguages();
  try {
    if (page.init) page.init();
  } finally {
    // Render even if the page's init failed, so the shared header is still drawn.
    render();
  }
  showFlash();
  if (AUTH_RETURN.error) {
    const google = Account.takeGoogleReturn();
    showToast(google ? googleErrorText(AUTH_RETURN) : t("common:linkExpired"),
      { error: true, sticky: true, action: google ? { label: t("common:header.signIn"), href: "signin.html?next=" + encodeURIComponent(safeNext(google.next, "dashboard.html")) } : null });
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
