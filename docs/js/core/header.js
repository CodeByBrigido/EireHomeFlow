// The shared header (active link, XP, sign-in link or account circle), the gate on
// signed-in pages, and the account menu.
import { XP_PER_STEP } from "../lib/progress.js?v=20260924";
import { initials, userName } from "../lib/people.js?v=20260924";
import { Account } from "./account.js?v=20260924";
import { bind, PAGE } from "./dom.js?v=20260924";

export function renderHeader(p) {
  document.querySelectorAll(".nav__link").forEach((link) => {
    const active = link.dataset.page === PAGE;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const streak = Math.min(p.doneCount, 7);
  bind("streak", streak + (streak === 1 ? " day" : " days"));
  bind("xp", p.doneCount * XP_PER_STEP);

  // Signed out: "Sign in" link. Signed in: circle with initials that opens the account menu.
  const user = Account.user;
  const signIn = document.getElementById("signin-link");
  const accountNav = document.getElementById("account-nav");
  if (signIn) signIn.hidden = !!user;
  if (accountNav) accountNav.hidden = !user;
  if (!user) return;
  bind("initials", initials(user));
  bind("userName", userName(user) || "Your account");
  bind("userEmail", user.email);
  const avatar = document.getElementById("avatar");
  if (avatar) avatar.setAttribute("aria-label", "Account menu for " + (userName(user) || user.email));
}

// Pages for signed-in people show a notice until we know someone is signed in.
export function renderGate() {
  const user = Account.user;
  document.getElementById("gate").hidden = !!user;
  document.getElementById("signed-in").hidden = !user;
  if (!user) {
    bind("gateText", !Account.ready ? "Loading your account..."
      : Account.enabled ? "Sign in to see this page. Your journey, numbers and details are waiting for you."
        : "Accounts are not switched on yet. Please check back soon.");
    document.getElementById("gate-actions").hidden = !Account.ready || !Account.enabled;
  }
  return user;
}

export function setMenu(open) {
  const menu = document.getElementById("account-menu");
  if (!menu) return;
  menu.hidden = !open;
  document.getElementById("avatar").setAttribute("aria-expanded", open);
}
