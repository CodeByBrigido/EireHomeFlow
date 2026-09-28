// The languages of the site. Pure, so the tools and Node tests can read it.
// English is the source: every text is written first in locales/en/<namespace>.json, and each
// other language translates those files. How to add a language: specs/08-Internationalisation.md.
//
// status "complete": every text is translated (npm run check:i18n makes sure of it). Only these
//   languages are offered in the header menu and picked from the browser's language.
// status "draft": translation in progress. It is never offered; texts not translated yet show in
//   English. Reviewers open it with ?lang=<code> on any page.
//
// After changing this list, run npm run i18n: it copies the list into js/i18n-boot.js.
export const SOURCE_LOCALE = "en";

// code: the folder in locales/. tag: the language for the browser (html lang, dates and numbers).
// name: the language's own name, as the menu shows it.
export const LOCALES = [
  { code: "en", tag: "en-IE", name: "English", status: "complete" },
  { code: "pt", tag: "pt-BR", name: "Português (Brasil)", status: "complete" },
  { code: "es", tag: "es-ES", name: "Español", status: "complete" },
  { code: "fr", tag: "fr-FR", name: "Français", status: "complete" },
  { code: "de", tag: "de-DE", name: "Deutsch", status: "complete" },
  { code: "it", tag: "it-IT", name: "Italiano", status: "complete" },
  { code: "pl", tag: "pl-PL", name: "Polski", status: "complete" },
  { code: "ro", tag: "ro-RO", name: "Română", status: "complete" },
  { code: "lt", tag: "lt-LT", name: "Lietuvių", status: "complete" },
];

// One file per namespace in each language folder. A page lists the ones it needs in
// <html data-i18n-ns="...">; common (header, footer, notices, forms) is on every page.
export const NAMESPACES = ["common", "home", "guide", "journey", "calculator", "authentication", "account", "legal"];

export const findLocale = (code) => LOCALES.find((locale) => locale.code === code) || null;

// The languages in the header menu.
export const offeredLocales = () => LOCALES.filter((locale) => locale.status === "complete");
