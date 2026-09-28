// Small helpers for numbers and text. Pure: no DOM, so Node tests can use them.
// The format* helpers take a language tag (en-IE, pt-BR...). Pages use money(), number(),
// percent() and date() from core/i18n.js, which pass the language the page is shown in.

export const num = (v) => Number(v) || 0;

const numberFormats = new Map();
function numberFormat(tag, options) {
  const id = tag + JSON.stringify(options);
  if (!numberFormats.has(id)) numberFormats.set(id, new Intl.NumberFormat(tag, options));
  return numberFormats.get(id);
}

// Whole euros: "€209,851" in Irish English, "209.851 €" in German. The narrow symbol keeps "€"
// in every language (Romanian would otherwise write "EUR"). (|| 0 turns -0 into 0.)
export const formatMoney = (n, tag) =>
  numberFormat(tag, { style: "currency", currency: "EUR", currencyDisplay: "narrowSymbol", minimumFractionDigits: 0, maximumFractionDigits: 0 })
    .format(Math.round(num(n)) || 0);

export const formatNumber = (n, tag, options = {}) => numberFormat(tag, { maximumFractionDigits: 2, ...options }).format(num(n));

// share is a fraction: formatPercent(0.039, "en-IE", 2) gives "3.90%", and "3,90 %" in French.
export const formatPercent = (share, tag, digits = 0) =>
  numberFormat(tag, { style: "percent", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(num(share));

export const formatDate = (value, tag, options = { day: "numeric", month: "long", year: "numeric" }) =>
  new Intl.DateTimeFormat(tag, options).format(new Date(value));

// Irish English euros, for text that is always in English.
export const euro = (n) => formatMoney(n, "en-IE");

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
