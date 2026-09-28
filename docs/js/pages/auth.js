// Account pages: sign in, create account, forgot password and new password.
// After signing in (with email or with Google), people go back to the page in ?next=
// (or to their dashboard).
import { firstName } from "../lib/people.js?v=20260928";
import { safeNext } from "../lib/validation.js?v=20260928";
import { Account } from "../core/account.js?v=20260928";
import { startPage } from "../core/app.js?v=20260928";
import { bind, PAGE } from "../core/dom.js?v=20260928";
import { checkForm, formValues, renderPasswordRules, sayInForm, watchForm } from "../core/forms.js?v=20260928";
import { flash } from "../core/notices.js?v=20260928";

const NEXT = safeNext(new URLSearchParams(location.search).get("next"), "dashboard.html");

// Google sign-in (sign-in and sign-up pages). The button shows as soon as accounts are on,
// so the form below never jumps, and hides only if the Supabase dashboard has Google off.
let googleOn = null;   // null until the Supabase settings have been read
let googleBusy = false;
const GOOGLE_LABEL = "Continue with Google";

function resetGoogle() {
  const btn = document.querySelector('[data-action="google"]');
  if (!btn) return;
  googleBusy = false;
  btn.disabled = false;
  bind("googleLabel", GOOGLE_LABEL);
}

async function continueWithGoogle(btn) {
  if (googleBusy) return;
  const status = document.getElementById("google-status");
  googleBusy = true;
  btn.disabled = true;
  bind("googleLabel", "Opening Google...");
  status.textContent = "";
  try {
    await Account.whenReady;
    if (!Account.enabled) throw new Error("Accounts are not switched on yet.");
    if (!(await Account.googleAvailable())) throw new Error("Google sign-in is not switched on yet. Please use your email for now.");
    const { error } = await Account.signInWithGoogle(NEXT);
    if (error) throw error;
    // The browser is now on its way to Google; the button stays busy until the page changes.
  } catch (err) {
    resetGoogle();
    status.textContent = err.message || "Google could not be opened. Please try again.";
  }
}

const AUTH_PAGES = {
  signin: {
    send: (v) => Account.signIn(v.email.trim(), v.password),
    after: (res) => {
      const name = firstName(res.data.user);
      flash("Welcome back" + (name ? ", " + name : "") + ".");
      location.href = NEXT;
    },
  },
  signup: {
    send: (v) => Account.signUp(v.email.trim(), v.password, v.name.trim().replace(/\s+/g, " ")),
    after: (res, form) => {
      if (res.data.session) {
        flash("Your account is ready. Welcome to ÉireHome Flow!");
        location.href = NEXT;
        return;
      }
      form.reset();
      renderPasswordRules(form);
      sayInForm(form, "Check your inbox and click the link we sent to confirm your account.");
    },
  },
  "forgot-password": {
    send: (v) => Account.sendReset(v.email.trim()),
    after: (res, form) => sayInForm(form, "If that email has an account, a reset link is on its way. Check your inbox."),
  },
  "new-password": {
    send: (v) => Account.setPassword(v.password),
    after: () => {
      flash("Your password has been changed.");
      location.href = "dashboard.html";
    },
  },
};

function initPage() {
  // Keep ?next= on the links between sign-in and sign-up.
  document.querySelectorAll("[data-keep-next]").forEach((link) => { link.href = link.getAttribute("href") + location.search; });
  if (document.getElementById("auth-google")) {
    Account.googleAvailable().then((on) => {
      googleOn = on;
      renderPage();
    });
    // Coming back from Google with the browser's Back button can restore the busy button.
    window.addEventListener("pageshow", resetGoogle);
  }
  const form = document.getElementById("auth-form");
  watchForm(form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!Account.ready) return sayInForm(form, "One moment, still connecting. Please try again.");
    if (!Account.enabled) return sayInForm(form, "Accounts are not switched on yet.");
    if (!checkForm(form)) return sayInForm(form, "");
    sayInForm(form, "Please wait...");
    try {
      const res = await AUTH_PAGES[PAGE].send(formValues(form));
      if (res.error) throw res.error;
      sayInForm(form, "");
      AUTH_PAGES[PAGE].after(res, form);
    } catch (err) {
      sayInForm(form, err.message || "Something went wrong. Please try again.");
    }
  });
}

// A short note replaces the form when there is nothing to do here: accounts switched off,
// already signed in (sign-in and sign-up), or no session on the new-password page.
// Someone signed in on this browser gets the note at once, from the saved session.
function renderPage() {
  const user = Account.shown();
  const checking = PAGE === "new-password" && !Account.ready;
  let note = "";
  if (checking) note = "Checking your link...";
  else if (!Account.available()) note = "Accounts are not switched on yet. Please check back soon.";
  else if (user && (PAGE === "signin" || PAGE === "signup")) note = "You are signed in as " + user.email + ".";
  else if (!user && PAGE === "new-password") note = "To choose a new password, open the link in your email again, or sign in first.";
  bind("authNote", note);
  document.getElementById("auth-note").hidden = !note;
  document.getElementById("auth-note-links").hidden = !note || checking || !Account.available();
  document.getElementById("auth-form").hidden = !!note;
  const google = document.getElementById("auth-google");
  if (google) google.hidden = !!note || !Account.available() || googleOn === false;
}

startPage({ init: initPage, render: renderPage, actions: { google: continueWithGoogle } });
