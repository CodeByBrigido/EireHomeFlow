// The language menu in the header. It offers the complete languages in js/lib/locales.js,
// each in its own name; choosing one saves it in this browser and reloads the page in it.
import { esc } from "../lib/format.js?v=20261001";
import { offeredLocales } from "../lib/locales.js?v=20261001";
import { locale, setLocale, tag } from "./i18n.js?v=20261001";

// Each language's name in the language of the page as well ("Deutsch", German), where the browser knows it.
// Every row shows it, even when it matches the language's own name ("Italiano", italiano), so no row looks untranslated.
function nameHere(code) {
  try {
    return new Intl.DisplayNames([tag()], { type: "language", fallback: "none" }).of(code) || "";
  } catch (err) {
    return "";
  }
}

export function renderLanguages() {
  const list = document.getElementById("lang-list");
  if (!list) return;
  list.innerHTML = offeredLocales().map((l) => {
    const current = l.code === locale();
    const here = current ? "" : nameHere(l.code);
    const second = here ? `<span class="lang__here">${esc(here)}</span>` : "";
    return `<button type="button" class="lang__option" data-action="setLocale" data-locale="${l.code}"${current ? ' aria-current="true"' : ""}>
        <span class="lang__badge" aria-hidden="true">${l.code.toUpperCase()}</span>
        <span class="lang__names"><span class="lang__name" lang="${l.tag}">${esc(l.name)}</span>${second}</span>
        ${current ? '<span class="lang__check" aria-hidden="true">✓</span>' : ""}
      </button>`;
  }).join("");
}

export function setLanguageMenu(open) {
  const menu = document.getElementById("lang-menu");
  const button = document.getElementById("lang-button");
  if (!menu || !button) return;
  menu.hidden = !open;
  button.setAttribute("aria-expanded", open);
}

export async function chooseLanguage(option) {
  if (option.getAttribute("aria-current") === "true") {
    setLanguageMenu(false);
    return;
  }
  option.closest(".lang__list").setAttribute("aria-busy", "true");
  // Reloads the page in the new language; if the language cannot be chosen, the menu stays open.
  if (!(await setLocale(option.dataset.locale))) option.closest(".lang__list").removeAttribute("aria-busy");
}
