// Buying power calculator. The maths is calc() in app.js, shared with the journey and the dashboard.
// Saving here ticks step 1 of the journey; the figures themselves stay in this browser.

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

function htbHint(s, c) {
  if (!s.ftb) return "Help to Buy is for first-time buyers only, so it is not counted here.";
  if (!s.newBuild) return "Help to Buy only covers new builds and self-builds. Choose New house or New apartment above if that is what you are buying.";
  if (c.price > HTB.priceCap) return "Help to Buy only covers homes up to " + euro(HTB.priceCap) + ", so it is not counted at this price.";
  if (c.price > c.htbStop) {
    return "Help to Buy needs a mortgage of at least 70% of the price, which is " + euro(c.price * HTB.minLoanShare) +
      " here. You can borrow up to " + euro(c.maxLoan) + ", so it is not counted at this price.";
  }
  const loanShare = c.loanShare < HTB.minLoanShare
    ? " It also needs a mortgage of at least 70% of the price (" + euro(c.price * HTB.minLoanShare) + "), so plan to borrow that much and keep the rest of your savings." : "";
  return "Help to Buy gives back the income tax and DIRT you paid in the last four years, up to €30,000 or 10% of the price. On this price, the most is " +
    euro(c.htbCap) + "." + loanShare;
}

function stampLabel(s, c) {
  const vat = !s.newBuild ? "" : " of the price without " + (s.apartment ? "9%" : "13.5%") + " VAT";
  return "Stamp duty (" + stampBands(c.stampBase) + vat + ")";
}

// Which limit sets the maximum price, and what would move it.
function limitNote(s, c) {
  if (c.fundsLimitedPrice >= c.loanLimitedPrice) {
    return "Right now your income is the limit. The " + c.multiple + "× rule caps the loan at " + euro(c.maxLoan) + ".";
  }
  const perThousand = calc({ ...s, savings: num(s.savings) + 1000 }).fundsLimitedPrice - c.fundsLimitedPrice;
  if (perThousand >= 1) return "Right now your savings are the limit. Every extra €1,000 saved raises this by about " + euro(perThousand) + ".";
  // Stuck where Help to Buy stops: a little more saving does not help, going past it without Help to Buy does.
  return "Right now your savings are the limit, at the highest price where Help to Buy still applies. Going above it without Help to Buy needs about " +
    euro(c.savingsPastHtb) + " more in savings.";
}

function renderPage() {
  const s = state;
  const c = calc();
  const pills = { ftb: s.ftb, mover: !s.ftb, single: !s.joint, joint: s.joint,
    secondHand: !s.newBuild, newHouse: s.newBuild && !s.apartment, newApartment: s.newBuild && !!s.apartment };
  for (const action in pills) {
    const pill = document.querySelector('.calc [data-action="' + action + '"]');
    if (!pill) continue;
    pill.classList.toggle("is-on", pills[action]);
    pill.setAttribute("aria-pressed", pills[action]);
  }
  setField("salary2", s.joint, "Joint applications only");
  setField("htb", s.ftb && s.newBuild, s.ftb ? "New builds only" : "First-time buyers only");
  renderRange("rate", num(s.rate).toFixed(2) + "%");
  renderRange("term", num(s.term) + " years");

  bind("htbHint", htbHint(s, c));
  bind("maxPrice", euro(c.maxPrice));
  bind("limitNote", limitNote(s, c));
  bind("multipleLabel", c.multiple + "×");
  bind("maxLoan", euro(c.maxLoan));
  bind("funds", euro(c.funds));
  bind("priceLabel", euro(c.price));

  // "Saved" needs both the tick and the figures in this browser: step 1 can be done by hand
  // (before this button existed) or on another device, and then the journey has no figures yet.
  const step = calculatorStep();
  const saved = step && state.done[step.id] && state.calcSaved;
  bind("saveLabel", saved ? "Update my journey" : "Save to my journey");
  bind("saveNote", !step ? "Could not load your journey. Reload the page to save."
    : saved ? "Step 1 is done. Your journey always shows the figures on this page."
      : "Completes step 1. Your figures stay in this browser.");
  const saveBtn = document.querySelector('[data-action="saveToJourney"]');
  if (saveBtn && !step) saveBtn.disabled = true;

  const lines = [
    ["Deposit (10% minimum)", euro(c.deposit)],
    [c.extraSavings > 0 ? "Mortgage needed, using all your savings" : "Mortgage needed", euro(c.loanNeeded)],
    [stampLabel(s, c), euro(c.stamp)],
    ["Solicitor", "~" + euro(c.solicitor)],
    ["Structural survey", "~" + euro(c.survey)],
    ["Bank valuation", "~" + euro(c.valuation)],
    ["Total cash you need", euro(c.cashNeeded), true],
  ];
  document.getElementById("breakdown").innerHTML = lines.map(([label, value, strong]) =>
    `<span class="breakdown__row${strong ? " is-total" : ""}"><span class="breakdown__label">${esc(label)}</span><span class="breakdown__value">${esc(value)}</span></span>`).join("");
  bind("bookingNote", "To secure the house you pay a booking deposit of roughly €5,000 (refundable until contracts are signed). The rest of the " +
    euro(c.deposit) + " deposit is due when you sign.");

  // Two separate limits: cash for the deposit and costs, and the loan against the income multiple.
  const cashShort = c.gap > 0;
  const loanOver = c.loanOver > 0;
  const limit = "your " + c.multiple + "× limit of " + euro(c.maxLoan);
  const verdict = !cashShort && !loanOver
    ? ["This price is within your limits",
      "You have " + euro(c.funds) + " against " + euro(c.cashNeeded) + " needed in cash, and the mortgage of " + euro(c.loanNeeded) + " sits inside " + limit + ". Next step: gather the AIP paperwork."]
    : cashShort && loanOver
      ? ["This price is out of reach for now",
        "You are " + euro(c.gap) + " short in cash, and the mortgage you would need (" + euro(c.loanNeeded) + ") is " + euro(c.loanOver) + " above " + limit + ". Aim at or below " + euro(c.maxPrice) + "."]
      : cashShort
        ? ["You are " + euro(c.gap) + " short in cash",
          "You have " + euro(c.funds) + " available and need " + euro(c.cashNeeded) + " in cash at this price. Save the difference or aim closer to " + euro(c.maxPrice) + "."]
        : ["The mortgage is over your limit",
          "You would need to borrow " + euro(c.loanNeeded) + ", which is " + euro(c.loanOver) + " above " + limit + ". Aim at or below " + euro(c.maxPrice) + "."];
  document.getElementById("verdict").classList.toggle("is-short", cashShort || loanOver);
  bind("verdictTitle", verdict[0]);
  bind("verdictBody", verdict[1]);
  bind("monthly", euro(c.monthly));
  bind("monthlyNote", euro(c.loanNeeded) + " over " + num(s.term) + " years at " + num(s.rate).toFixed(2) + "%. Mortgage protection and home insurance are on top.");
}

let saving = false;

Object.assign(actions, {
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
      flash(first ? "Your numbers are saved and step 1 is done." : "Your journey now uses these numbers.");
      location.href = stepLink(step);
    } finally {
      saving = false;
    }
  },
});
