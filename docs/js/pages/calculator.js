// Buying power calculator. The maths is calc() in app.js, shared with the dashboard.

function initPage() {
  document.querySelectorAll("[data-field]").forEach((input) => { input.value = state[input.dataset.field]; });
}

function renderPage() {
  const s = state;
  const c = calc();
  const pills = { ftb: s.ftb, mover: !s.ftb, single: !s.joint, joint: s.joint };
  for (const action in pills) {
    const pill = document.querySelector('.calc [data-action="' + action + '"]');
    pill.classList.toggle("is-on", pills[action]);
    pill.setAttribute("aria-pressed", pills[action]);
  }
  document.getElementById("field-salary2").hidden = !s.joint;
  document.getElementById("field-htb").hidden = !s.ftb;

  bind("htbHint", s.ftb
    ? "Help to Buy is capped at €30,000 or 10% of the price and only applies to new builds. On this price, that is " + euro(c.htbCap) + "."
    : "Help to Buy is first-time buyers only, so it is not counted here.");
  bind("maxPrice", euro(c.maxPrice));
  bind("limitNote", c.fundsLimitedPrice < c.loanLimitedPrice
    ? "Right now your savings are the limit. Every extra €1,000 saved raises this by about " + euro(1000 / (c.depositRate + 0.01)) + "."
    : "Right now your income is the limit. The " + c.multiple + "× rule caps the loan at " + euro(c.maxLoan) + ".");
  bind("multipleLabel", c.multiple + "×");
  bind("maxLoan", euro(c.maxLoan));
  bind("funds", euro(c.funds));
  bind("priceLabel", euro(c.price));

  const lines = [
    ["Deposit (10% minimum)", euro(c.deposit)],
    [c.extraSavings > 0 ? "Mortgage needed, using all your savings" : "Mortgage needed", euro(c.loanNeeded)],
    ["Stamp duty (1%)", euro(c.stamp)],
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
  bind("monthlyNote", euro(c.loanNeeded) + " over " + num(s.term) + " years at " + num(s.rate) + "%. Mortgage protection and home insurance are on top.");
}

Object.assign(actions, {
  ftb: () => setState({ ftb: true }),
  mover: () => setState({ ftb: false }),
  single: () => setState({ joint: false }),
  joint: () => setState({ joint: true }),
});
