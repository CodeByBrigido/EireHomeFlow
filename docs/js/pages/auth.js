// Account pages: sign in, create account, forgot password and new password.
// After signing in, people go back to the page in ?next= (or to their dashboard).
import { firstName } from "../lib/people.js?v=20260925";
import { safeNext } from "../lib/validation.js?v=20260925";
import { Account } from "../core/account.js?v=20260925";
import { startPage } from "../core/app.js?v=20260925";
import { bind, PAGE } from "../core/dom.js?v=20260925";
import { checkForm, formValues, renderPasswordRules, sayInForm, watchForm } from "../core/forms.js?v=20260925";
import { flash } from "../core/notices.js?v=20260925";

const NEXT = safeNext(new URLSearchParams(location.search).get("next"), "dashboard.html");

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
function renderPage() {
  let note = "";
  if (!Account.ready) note = PAGE === "new-password" ? "Checking your link..." : "";
  else if (!Account.enabled) note = "Accounts are not switched on yet. Please check back soon.";
  else if (Account.user && (PAGE === "signin" || PAGE === "signup")) note = "You are signed in as " + Account.user.email + ".";
  else if (!Account.user && PAGE === "new-password") note = "To choose a new password, open the link in your email again, or sign in first.";
  bind("authNote", note);
  document.getElementById("auth-note").hidden = !note;
  document.getElementById("auth-note-links").hidden = !note || !Account.ready || !Account.enabled;
  document.getElementById("auth-form").hidden = !!note;
}

startPage({ init: initPage, render: renderPage });
