// My profile: change the name on the account, see the email, change password, sign out,
// delete the account.
import { userName } from "../lib/people.js?v=20260930";
import { Account } from "../core/account.js?v=20260930";
import { startPage } from "../core/app.js?v=20260930";
import { bind } from "../core/dom.js?v=20260930";
import { checkForm, errorText, readerError, sayInForm, watchForm } from "../core/forms.js?v=20260930";
import { renderGate } from "../core/header.js?v=20260930";
import { date, t } from "../core/i18n.js?v=20260930";
import { flash, showToast } from "../core/notices.js?v=20260930";
import { setState } from "../core/state.js?v=20260930";

let profileFilled = false;
let deleting = false;

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
  btn.textContent = t("account:profile.delete.deleting");
  status.textContent = "";
  try {
    await Account.whenReady;
    if (!Account.user) throw readerError("account:profile.delete.signInAgain");
    await Account.deleteAccount();
    setState({ done: {}, open: null });
    flash(t("account:profile.delete.done"));
    location.href = "index.html";
  } catch (err) {
    deleting = false;
    btn.disabled = false;
    btn.textContent = t("account:profile.delete.confirm");
    status.textContent = err.code === "delete_not_enabled" ? t("account:profile.delete.notEnabled")
      : err.forReader ? err.message : t("account:profile.delete.failed");
  }
}

function initPage() {
  const form = document.getElementById("profile-form");
  watchForm(form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!checkForm(form)) return sayInForm(form, "");
    sayInForm(form, t("account:profile.saving"));
    try {
      await Account.whenReady;
      const res = await Account.updateProfile(form.elements.name.value.trim().replace(/\s+/g, " "));
      if (res.error) throw res.error;
      sayInForm(form, "");
      showToast(t("account:profile.updated"));
    } catch (err) {
      sayInForm(form, errorText(err));
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
  bind("memberSince", date(user.created_at));
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
