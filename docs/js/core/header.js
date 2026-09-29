// The shared header (active link, sign-in link or account circle), the gate on
// signed-in pages, and the account menu.
import { initials, userName } from "../lib/people.js?v=20261002";
import { Account } from "./account.js?v=20261002";
import { bind, PAGE } from "./dom.js?v=20261002";
import { t } from "./i18n.js?v=20261002";

// The parts drawn at once, before the texts and the step list have loaded: the active link,
// and "Sign in" or the account circle with the initials. Returns the person shown.
export function renderHeaderEarly() {
  document.querySelectorAll(".nav__link").forEach((link) => {
    const active = link.dataset.page === PAGE;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  // "Sign in" or the account circle is drawn at once from the session saved in this browser;
  // it waits for Supabase only when someone arrives from an email link.
  const header = document.querySelector(".site-header");
  if (header && Account.settled()) header.removeAttribute("data-auth-pending");

  // Signed out: "Sign in" link. Signed in: circle with initials that opens the account menu.
  const user = Account.shown();
  const signIn = document.getElementById("signin-link");
  const accountNav = document.getElementById("account-nav");
  if (signIn) signIn.hidden = !!user;
  if (accountNav) accountNav.hidden = !user;
  if (user) bind("initials", initials(user));
  return user;
}

export function renderHeader() {
  const user = renderHeaderEarly();
  if (!user) return;
  const name = userName(user);
  bind("userName", name || t("common:account.fallbackName"));
  bind("userEmail", user.email);
  const avatar = document.getElementById("avatar");
  if (avatar) avatar.setAttribute("aria-label", t("common:account.menuFor", { name: name || user.email }));
}

// Pages for signed-in people show a notice until we know someone is signed in.
// Someone signed in on this browser sees the page at once, from the saved session.
export function renderGate() {
  const user = Account.shown();
  document.getElementById("gate").hidden = !!user;
  document.getElementById("signed-in").hidden = !user;
  if (!user) {
    bind("gateText", !Account.settled() ? t("common:gate.loading")
      : Account.available() ? t("common:gate.signInPrompt") : t("common:gate.accountsOff"));
    document.getElementById("gate-actions").hidden = !Account.settled() || !Account.available();
  }
  return user;
}

export function setMenu(open) {
  const menu = document.getElementById("account-menu");
  if (!menu) return;
  menu.hidden = !open;
  document.getElementById("avatar").setAttribute("aria-expanded", open);
}
