// Account pages: sign in, create account, forgot password and new password.
// After signing in (with email or with Google), people go back to the page in ?next=
// (or to their dashboard).
import { firstName } from "../lib/people.js?v=20261002";
import { safeNext } from "../lib/validation.js?v=20261002";
import { Account } from "../core/account.js?v=20261002";
import { startPage } from "../core/app.js?v=20261002";
import { bind, PAGE } from "../core/dom.js?v=20261002";
import { checkForm, errorText, formValues, readerError, renderPasswordRules, sayInForm, watchForm } from "../core/forms.js?v=20261002";
import { t } from "../core/i18n.js?v=20261002";
import { flash } from "../core/notices.js?v=20261002";

const NEXT = safeNext(new URLSearchParams(location.search).get("next"), "dashboard.html");

// Google sign-in (sign-in and sign-up pages). The button shows as soon as accounts are on,
// so the form below never jumps, and hides only if the Supabase dashboard has Google off.
let googleOn = null;   // null until the Supabase settings have been read
let googleBusy = false;

function resetGoogle() {
  const btn = document.querySelector('[data-action="google"]');
  if (!btn) return;
  googleBusy = false;
  btn.disabled = false;
  bind("googleLabel", t("authentication:google.continue"));
}

async function continueWithGoogle(btn) {
  if (googleBusy) return;
  const status = document.getElementById("google-status");
  googleBusy = true;
  btn.disabled = true;
  bind("googleLabel", t("authentication:google.opening"));
  status.textContent = "";
  try {
    await Account.whenReady;
    if (!Account.enabled) throw readerError("common:gate.accountsOff");
    if (!(await Account.googleAvailable())) throw readerError("authentication:google.off");
    const { error } = await Account.signInWithGoogle(NEXT);
    if (error) throw error;
    // The browser is now on its way to Google; the button stays busy until the page changes.
  } catch (err) {
    resetGoogle();
    status.textContent = err.forReader ? err.message : t("authentication:google.failed");
  }
}

const AUTH_PAGES = {
  signin: {
    send: (v) => Account.signIn(v.email.trim(), v.password),
    after: (res) => {
      const name = firstName(res.data.user);
      flash(name ? t("common:welcome.back", { name }) : t("common:welcome.backNoName"));
      location.href = NEXT;
    },
  },
  signup: {
    send: (v) => Account.signUp(v.email.trim(), v.password, v.name.trim().replace(/\s+/g, " ")),
    after: (res, form) => {
      if (res.data.session) {
        flash(t("common:welcome.newAccountNoName"));
        location.href = NEXT;
        return;
      }
      form.reset();
      renderPasswordRules(form);
      sayInForm(form, t("authentication:signup.checkInbox"));
    },
  },
  "forgot-password": {
    send: (v) => Account.sendReset(v.email.trim()),
    after: (res, form) => sayInForm(form, t("authentication:forgot.sent")),
  },
  "new-password": {
    send: (v) => Account.setPassword(v.password),
    after: () => {
      flash(t("authentication:newPassword.changed"));
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
    if (!Account.ready) return sayInForm(form, t("common:forms.connecting"));
    if (!Account.enabled) return sayInForm(form, t("common:gate.accountsOff"));
    if (!checkForm(form)) return sayInForm(form, "");
    sayInForm(form, t("common:forms.wait"));
    try {
      const res = await AUTH_PAGES[PAGE].send(formValues(form));
      if (res.error) throw res.error;
      sayInForm(form, "");
      AUTH_PAGES[PAGE].after(res, form);
    } catch (err) {
      sayInForm(form, errorText(err));
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
  if (checking) note = t("authentication:note.checking");
  else if (!Account.available()) note = t("common:gate.accountsOff");
  else if (user && (PAGE === "signin" || PAGE === "signup")) note = t("authentication:note.signedIn", { email: user.email });
  else if (!user && PAGE === "new-password") note = t("authentication:note.needLink");
  bind("authNote", note);
  document.getElementById("auth-note").hidden = !note;
  document.getElementById("auth-note-links").hidden = !note || checking || !Account.available();
  document.getElementById("auth-form").hidden = !!note;
  const google = document.getElementById("auth-google");
  if (google) google.hidden = !!note || !Account.available() || googleOn === false;
}

startPage({ init: initPage, render: renderPage, actions: { google: continueWithGoogle } });
