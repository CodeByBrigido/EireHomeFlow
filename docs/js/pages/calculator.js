// Buying power calculator. The maths is calc() in lib/calculator.js, shared with the journey and the dashboard.
// Saving here ticks step 1 of the journey; the figures themselves stay in this browser.
import { calc, HTB, RANGES, stampBandCount, verdictKind } from "../lib/calculator.js?v=20261003";
import { esc, num } from "../lib/format.js?v=20261003";
import { startPage } from "../core/app.js?v=20261003";
import { bind } from "../core/dom.js?v=20261003";
import { money, number, percent, t } from "../core/i18n.js?v=20261003";
import { flash } from "../core/notices.js?v=20261003";
import { setState, state } from "../core/state.js?v=20261003";
import { calculatorStep, stepLink } from "../core/steps.js?v=20261003";
import { setDone } from "../core/sync.js?v=20261003";

function initPage() {
  document.querySelectorAll("[data-field]").forEach((input) => { input.value = state[input.dataset.field]; });
  // Coming back with the browser's Back button can restore the button as it was while saving.
  window.addEventListener("pageshow", () => {
    const btn = document.querySelector('[data-action="saveToJourney"]');
    if (btn) btn.disabled = false;
  });
}

// A field that does not apply keeps its place: it is switched off, emptied and says why.
function setField(key, on, offText) {
  const input = document.querySelector('[data-field="' + key + '"]');
  if (!input) return;
  const wasOff = input.disabled;
  input.disabled = !on;
  input.closest(".field").classList.toggle("is-off", !on);
  if (!on) {
    input.value = "";
    input.placeholder = offText;
  } else if (wasOff) {
    input.value = state[key];
    input.placeholder = input.dataset.placeholder;
  }
}

// Slider: the value beside the label, the green fill up to the handle and the spoken value.
function renderRange(key, text) {
  const input = document.querySelector('[data-field="' + key + '"]');
  const value = document.getElementById(key + "-value");
  if (!input || !value) return;
  const [min, max] = RANGES[key];
  input.style.setProperty("--pct", (num(state[key]) - min) / (max - min));
  input.setAttribute("aria-valuetext", text);
  value.textContent = text;
}

// "4×" or "3.5×", written the language's way.
const multipleText = (c) => number(c.multiple) + "×";
const rateText = (s) => percent(num(s.rate) / 100, 2);
const yearsText = (s) => t("calculator:years", { count: num(s.term) });

function htbHint(s, c) {
  if (!s.ftb) return t("calculator:htb.notFtb");
  if (!s.newBuild) return t("calculator:htb.notNew");
  if (c.price > HTB.priceCap) return t("calculator:htb.overCap", { cap: money(HTB.priceCap) });
  if (c.price > c.htbStop) return t("calculator:htb.loanTooSmall", { minLoan: money(c.price * HTB.minLoanShare), maxLoan: money(c.maxLoan) });
  const counted = t("calculator:htb.counted", { most: money(c.htbCap) });
  return c.loanShare < HTB.minLoanShare ? counted + " " + t("calculator:htb.borrowEnough", { minLoan: money(c.price * HTB.minLoanShare) }) : counted;
}

function stampLabel(s, c) {
  const count = stampBandCount(c.stampBase);
  const bands = t(`calculator:breakdown.bands.${count}`);
  if (!s.newBuild) return t("calculator:breakdown.stamp", { bands });
  // VAT on a new home: 13.5% on a house, 9% on an apartment.
  return t("calculator:breakdown.stampNew", { bands, vat: percent(c.vat, Math.round(c.vat * 1000) % 10 ? 1 : 0) });
}

// Which limit sets the maximum price, and what would move it.
function limitNote(s, c) {
  if (c.fundsLimitedPrice >= c.loanLimitedPrice) return t("calculator:limit.income", { multiple: multipleText(c), maxLoan: money(c.maxLoan) });
  const perThousand = calc({ ...s, savings: num(s.savings) + 1000 }).fundsLimitedPrice - c.fundsLimitedPrice;
  if (perThousand >= 1) return t("calculator:limit.savings", { amount: money(perThousand) });
  // Stuck where Help to Buy stops: a little more saving does not help, going past it without Help to Buy does.
  return t("calculator:limit.htbEdge", { amount: money(c.savingsPastHtb) });
}

function renderPage() {
  const s = state;
  const c = calc(s);
  const pills = { ftb: s.ftb, mover: !s.ftb, single: !s.joint, joint: s.joint,
    secondHand: !s.newBuild, newHouse: s.newBuild && !s.apartment, newApartment: s.newBuild && !!s.apartment };
  for (const action in pills) {
    const pill = document.querySelector('.calc [data-action="' + action + '"]');
    if (!pill) continue;
    pill.classList.toggle("is-on", pills[action]);
    pill.setAttribute("aria-pressed", pills[action]);
  }
  setField("salary2", s.joint, t("calculator:off.joint"));
  setField("htb", s.ftb && s.newBuild, s.ftb ? t("calculator:off.newBuild") : t("calculator:off.ftb"));
  renderRange("rate", rateText(s));
  renderRange("term", yearsText(s));

  bind("htbHint", htbHint(s, c));
  bind("maxPrice", money(c.maxPrice));
  bind("limitNote", limitNote(s, c));
  bind("multipleLabel", multipleText(c));
  bind("maxLoan", money(c.maxLoan));
  bind("funds", money(c.funds));
  bind("priceLabel", money(c.price));

  // "Saved" needs both the tick and the figures in this browser: step 1 can be done by hand
  // (before this button existed) or on another device, and then the journey has no figures yet.
  const step = calculatorStep();
  const saved = step && state.done[step.id] && state.calcSaved;
  bind("saveLabel", saved ? t("calculator:save.update") : t("calculator:save.label"));
  bind("saveNote", !step ? t("calculator:save.noJourney") : saved ? t("calculator:save.saved") : t("calculator:save.hint"));
  const saveBtn = document.querySelector('[data-action="saveToJourney"]');
  if (saveBtn && !step) saveBtn.disabled = true;

  const approx = (n) => t("common:approx", { amount: money(n) });
  const lines = [
    [t("calculator:breakdown.deposit"), money(c.deposit)],
    [c.extraSavings > 0 ? t("calculator:breakdown.loanAll") : t("calculator:breakdown.loan"), money(c.loanNeeded)],
    [stampLabel(s, c), money(c.stamp)],
    [t("calculator:breakdown.solicitor"), approx(c.solicitor)],
    [t("calculator:breakdown.survey"), approx(c.survey)],
    [t("calculator:breakdown.valuation"), approx(c.valuation)],
    [t("calculator:breakdown.total"), money(c.cashNeeded), true],
  ];
  document.getElementById("breakdown").innerHTML = lines.map(([label, value, strong]) =>
    `<span class="breakdown__row${strong ? " is-total" : ""}"><span class="breakdown__label">${esc(label)}</span><span class="breakdown__value">${esc(value)}</span></span>`).join("");
  bind("bookingNote", t("calculator:breakdown.booking", { deposit: money(c.deposit) }));

  // Two separate limits: cash for the deposit and costs, and the loan against the income multiple.
  const kind = verdictKind(c);
  const figures = { funds: money(c.funds), cash: money(c.cashNeeded), loan: money(c.loanNeeded), gap: money(c.gap),
    over: money(c.loanOver), maxLoan: money(c.maxLoan), maxPrice: money(c.maxPrice), multiple: multipleText(c) };
  document.getElementById("verdict").classList.toggle("is-short", kind !== "within");
  bind("verdictTitle", t(`calculator:verdict.${kind}.title`, figures));
  bind("verdictBody", t(`calculator:verdict.${kind}.body`, figures));
  bind("monthly", money(c.monthly));
  bind("monthlyNote", t("calculator:monthly.note", { loan: money(c.loanNeeded), years: yearsText(s), rate: rateText(s) }));
}

let saving = false;

startPage({ init: initPage, render: renderPage, actions: {
  ftb: () => setState({ ftb: true }),
  mover: () => setState({ ftb: false }),
  single: () => setState({ joint: false }),
  joint: () => setState({ joint: true }),
  secondHand: () => setState({ newBuild: false, apartment: false }),
  newHouse: () => setState({ newBuild: true, apartment: false }),
  newApartment: () => setState({ newBuild: true, apartment: true }),
  // Ticks step 1 (and waits for the account copy) before going back to it in the journey.
  saveToJourney: async (btn) => {
    const step = calculatorStep();
    if (!step || saving) return;
    saving = true;
    btn.disabled = true;
    try {
      const first = !state.done[step.id];
      setState({ calcSaved: true });
      await setDone({ ...state.done, [step.id]: true });
      flash(first ? t("calculator:save.done") : t("calculator:save.updated"));
      location.href = stepLink(step);
    } finally {
      saving = false;
    }
  },
} });
