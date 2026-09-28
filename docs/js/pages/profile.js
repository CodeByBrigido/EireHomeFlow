// My profile: change the name on the account, see the email, change password, sign out,
// delete the account.
import { userName } from "../lib/people.js?v=20260928";
import { Account } from "../core/account.js?v=20260928";
import { startPage } from "../core/app.js?v=20260928";
import { bind } from "../core/dom.js?v=20260928";
import { checkForm, sayInForm, watchForm } from "../core/forms.js?v=20260928";
import { renderGate } from "../core/header.js?v=20260928";
import { flash, showToast } from "../core/notices.js?v=20260928";
import { setState } from "../core/state.js?v=20260928";

let profileFilled = false;
let deleting = false;
const DELETE_LABEL = "Yes, delete my account";

// The confirmation opens in place of the "Delete my account" button.
function showDeleteConfirm(open) {
  document.getElementById("delete-start").hidden = open;
  document.getElementById("delete-confirm").hidden = !open;
  document.getElementById("delete-status").textContent = "";
  document.getElementById(open ? "delete-confirm-btn" : "delete-start").focus();
}

async function deleteAccount(btn) {
  if (deleting) return;
  const status = document.getElementById("delete-status");
  deleting = true;
  btn.disabled = true;
  btn.textContent = "Deleting...";
  status.textContent = "";
  try {
    await Account.whenReady;
    if (!Account.user) throw new Error("Sign in again to delete your account.");
    await Account.deleteAccount();
    setState({ done: {}, open: null });
    flash("Your account and its saved progress have been deleted.");
    location.href = "index.html";
  } catch (err) {
    deleting = false;
    btn.disabled = false;
    btn.textContent = DELETE_LABEL;
    status.textContent = err.message || "Your account could not be deleted. Please try again.";
  }
}

function initPage() {
  const form = document.getElementById("profile-form");
  watchForm(form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!checkForm(form)) return sayInForm(form, "");
    sayInForm(form, "Saving...");
    try {
      await Account.whenReady;
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

startPage({
  init: initPage,
  render: renderPage,
  actions: {
    deleteStart: () => showDeleteConfirm(true),
    deleteCancel: () => showDeleteConfirm(false),
    deleteConfirm: deleteAccount,
  },
});
