// Calculator rules and maths, shared by the calculator, the journey and the dashboard.
// Pure: no DOM and no storage, so tests/calculator.test.js runs it in Node.
// The source of every rule is listed in specs/02-TRD.md, section 6.
import { num } from "./format.js?v=20260925";

// The calculator's sliders: lowest, highest and default value.
export const RANGES = { rate: [1, 8, 3.9], term: [5, 35, 30] };

export const DEPOSIT_RATE = 0.1; // Central Bank minimum for first-time and subsequent buyers since 2023
export const FEES = { solicitor: 2500, survey: 400, valuation: 150 };
export const FEES_TOTAL = FEES.solicitor + FEES.survey + FEES.valuation;
// VAT included in the price of a new home: 13.5% on houses, and 9% on apartments sold
// from 8 October 2025 to 31 December 2030.
export const VAT = { house: 0.135, apartment: 0.09 };
export const HTB = { max: 30000, share: 0.1, priceCap: 500000, minLoanShare: 0.7 };

export const homeVat = (s) => (!s.newBuild ? 0 : s.apartment ? VAT.apartment : VAT.house);

// Residential stamp duty since 2 October 2024: 1% up to €1m, 2% from €1m to €1.5m, 6% above.
// On a new home it is charged on the price without VAT.
export const stampBase = (price, vat) => price / (1 + (vat || 0));
export function stampDuty(price, vat) {
  const base = stampBase(price, vat);
  return Math.min(base, 1e6) * 0.01 + Math.max(0, Math.min(base, 1.5e6) - 1e6) * 0.02 + Math.max(0, base - 1.5e6) * 0.06;
}
export const stampBands = (base) => (base <= 1e6 ? "1%" : base <= 1.5e6 ? "1% and 2% bands" : "1%, 2% and 6% bands");

// Help to Buy: first-time buyers of a new home up to €500,000, with a mortgage of at least
// 70% of the price. So it also stops where 70% of the price is more than the person can borrow.
// The refund is the lowest of €30,000, 10% of the price and the amount typed in (the income
// tax and DIRT paid in the last four years).
export const htbCap = (price) => Math.min(HTB.max, price * HTB.share);
export const htbLimit = (maxLoan) => Math.min(HTB.priceCap, maxLoan / HTB.minLoanShare);
export const htbFor = (s, price, maxLoan) =>
  (s.ftb && s.newBuild && price <= htbLimit(maxLoan) ? Math.min(num(s.htb), htbCap(price)) : 0);

// Highest price (within 50 cent) for which ok(price) holds. Each check gets harder as the
// price rises, except where Help to Buy stops (split), so the prices above it are searched alone.
export function highestPrice(ok, split) {
  const search = (lo, hi) => {
    if (ok(hi)) return hi;
    while (hi - lo > 0.5) {
      const mid = (lo + hi) / 2;
      if (ok(mid)) lo = mid; else hi = mid;
    }
    return lo;
  };
  const upTo = ok(0) ? search(0, split) : 0;
  const above = ok(split + 1) ? search(split + 1, 1e8) : 0;
  return Math.max(upTo, above);
}

export function calc(s) {
  const income = num(s.salary) + (s.joint ? num(s.salary2) : 0);
  const multiple = s.ftb ? 4 : 3.5;
  const maxLoan = income * multiple;
  const vat = homeVat(s);
  const own = num(s.savings) + num(s.gift);
  const htbStop = htbLimit(maxLoan);
  const fundsAt = (p) => own + htbFor(s, p, maxLoan);
  const costsAt = (p) => stampDuty(p, vat) + FEES_TOTAL;
  // Cash must cover the 10% deposit and the costs; savings above that go into the purchase,
  // so the loan is the price plus costs minus all the funds.
  const fundsOk = (p) => fundsAt(p) >= p * DEPOSIT_RATE + costsAt(p);
  const fundsLimitedPrice = highestPrice(fundsOk, htbStop);
  const loanLimitedPrice = highestPrice((p) => p + costsAt(p) - fundsAt(p) <= maxLoan, htbStop);
  const maxPrice = Math.min(fundsLimitedPrice, loanLimitedPrice);
  // Savings needed to go just past the point where Help to Buy stops, without it.
  const pastHtb = htbStop + 1;
  const savingsPastHtb = pastHtb * DEPOSIT_RATE + costsAt(pastHtb) - own;

  const price = num(s.price);
  const htb = htbFor(s, price, maxLoan);
  const funds = own + htb;
  const deposit = price * DEPOSIT_RATE;
  const stamp = stampDuty(price, vat);
  const costs = stamp + FEES_TOTAL;
  const cashNeeded = deposit + costs;
  const extraSavings = Math.max(0, funds - cashNeeded);
  const loanNeeded = Math.max(0, price - deposit - extraSavings);
  const r = num(s.rate) / 100 / 12;
  const n = num(s.term) * 12;
  const monthly = r > 0 && n > 0 ? (loanNeeded * r) / (1 - Math.pow(1 + r, -n)) : loanNeeded / (n || 1);
  return { multiple, depositRate: DEPOSIT_RATE, maxLoan, price, own, htb, htbCap: htbCap(price), htbStop, savingsPastHtb, funds,
    loanLimitedPrice, fundsLimitedPrice, maxPrice, vat, stampBase: stampBase(price, vat), deposit, stamp, costs, ...FEES,
    cashNeeded, extraSavings, loanNeeded, loanShare: price ? loanNeeded / price : 0, monthly, gap: cashNeeded - funds, loanOver: loanNeeded - maxLoan };
}

// What blocks the purchase at the target price: "within" (nothing), "cashShort",
// "loanOver", or "outOfReach" (both). The calculator page turns it into the verdict card.
export function verdictKind(c) {
  const cashShort = c.gap > 0;
  const loanOver = c.loanOver > 0;
  return cashShort && loanOver ? "outOfReach" : cashShort ? "cashShort" : loanOver ? "loanOver" : "within";
}
