// Texts, numbers and dates in the page's language, for the page scripts.
// js/i18n-boot.js (first thing in <head>) has picked the language and loaded this page's texts;
// this module is how the scripts use them:
//   t("calculator:save.done")                   a text (English when a language lacks it)
//   t("journey:detail.stepOf", { n: 3, total: 31 })  with values filled in
//   t("calculator:years", { count: 2 })          plural chosen by count: "2 years", "2 anos"
//   money(209851), percent(0.039, 2), date(user.created_at)
// Every text lives in locales/<language>/<namespace>.json, English first. See specs/08-Internationalisation.md.
import { formatDate, formatMoney, formatNumber, formatPercent } from "../lib/format.js?v=20261002";

// Read when used, not when this module loads: tests load the page modules without the runtime.
const runtime = () => window.EireI18n || null;

export const t = (key, params) => (runtime() ? runtime().t(key, params) : key);

// Resolves once this page's texts are in (straight away when this browser has a copy).
export const ready = () => (runtime() ? runtime().ready : Promise.resolve());

export const locale = () => (runtime() ? runtime().locale : "en");
export const tag = () => (runtime() ? runtime().tag : "en-IE");

export const money = (n) => formatMoney(n, tag());
export const number = (n, options) => formatNumber(n, tag(), options);
export const percent = (share, digits) => formatPercent(share, tag(), digits);
export const date = (value, options) => formatDate(value, tag(), options);

// Translates the data-i18n attributes in an element or a parsed document.
export const translate = (root) => {
  if (runtime()) runtime().translate(root);
};

// Saves the choice and reloads the page in that language.
export const setLocale = (code) => (runtime() ? runtime().setLocale(code) : Promise.resolve(false));
