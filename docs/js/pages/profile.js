// My profile: change the name on the account, see the email, change password, sign out.
import { userName } from "../lib/people.js?v=20260924";
import { Account } from "../core/account.js?v=20260924";
import { startPage } from "../core/app.js?v=20260924";
import { bind } from "../core/dom.js?v=20260924";
import { checkForm, sayInForm, watchForm } from "../core/forms.js?v=20260924";
import { renderGate } from "../core/header.js?v=20260924";
import { showToast } from "../core/notices.js?v=20260924";

let profileFilled = false;

function initPage() {
  const form = document.getElementById("profile-form");
  watchForm(form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!checkForm(form)) return sayInForm(form, "");
    sayInForm(form, "Saving...");
    try {
      const res = await Account.updateProfile(form.elements.name.value.trim().replace(/\s+/g, " "));
      if (res.error) throw res.error;
      sayInForm(form, "");
      showToast("Your profile has been updated.");
    } catch (err) {
      sayInForm(form, err.message || "Something went wrong. Please try again.");
    }
  });
}

function renderPage() {
  const user = renderGate();
  if (!user) return;
  if (!profileFilled) {
    document.getElementById("profile-form").elements.name.value = userName(user);
    profileFilled = true;
  }
  bind("memberSince", new Date(user.created_at).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" }));
}

startPage({ init: initPage, render: renderPage });
