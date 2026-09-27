import { test } from "node:test";
import assert from "node:assert/strict";
import { calc, stampDuty, VAT, verdictKind } from "../docs/js/lib/calculator.js";

// The calculator's example figures (specs/02-TRD.md, section 12.1).
const BASE = {
  ftb: true, joint: false, newBuild: false, apartment: false,
  salary: "45000", salary2: "38000", savings: "35000", gift: "0", htb: "0",
  price: "380000", rate: "3.9", term: "30",
};
const run = (patch = {}) => calc({ ...BASE, ...patch });
// The page shows whole euros, so reference values are compared after rounding.
const whole = (c, keys) => Object.fromEntries(keys.map((k) => [k, Math.round(c[k])]));

test("default figures", () => {
  const c = run();
  assert.deepEqual(whole(c, ["maxPrice", "maxLoan", "cashNeeded", "loanNeeded", "monthly"]),
    { maxPrice: 209851, maxLoan: 180000, cashNeeded: 44850, loanNeeded: 342000, monthly: 1613 });
  assert.equal(verdictKind(c), "outOfReach");
});

test("family gift of 60,000 raises the maximum price", () => {
  assert.equal(Math.round(run({ gift: "60000" }).maxPrice), 269257);
});

test("price 200,000 is within limits, using all savings", () => {
  const c = run({ price: "200000" });
  assert.equal(Math.round(c.maxPrice), 209851);
  assert.equal(Math.round(c.loanNeeded), 170050);
  assert.ok(c.extraSavings > 0);
  assert.equal(verdictKind(c), "within");
});

test("savings 60,000 at 300,000: the mortgage is over the limit", () => {
  const c = run({ savings: "60000", price: "300000" });
  assert.equal(Math.round(c.maxPrice), 234604);
  assert.equal(Math.round(c.loanNeeded), 246050);
  assert.equal(verdictKind(c), "loanOver");
});

test("salary 120,000 with savings 20,000 at 300,000: short in cash", () => {
  const c = run({ salary: "120000", savings: "20000", price: "300000" });
  assert.equal(Math.round(c.maxPrice), 154091);
  assert.equal(Math.round(c.gap), 16050);
  assert.equal(verdictKind(c), "cashShort");
});

test("moving home uses 3.5x and still a 10% deposit", () => {
  const c = run({ ftb: false });
  assert.equal(c.multiple, 3.5);
  assert.equal(Math.round(c.maxPrice), 187574);
  assert.equal(Math.round(c.deposit), 38000);
  assert.equal(verdictKind(c), "outOfReach");
});

test("new house: stamp duty on the price without 13.5% VAT", () => {
  const c = run({ newBuild: true });
  assert.deepEqual(whole(c, ["maxPrice", "stamp", "cashNeeded"]), { maxPrice: 210099, stamp: 3348, cashNeeded: 44398 });
});

test("new apartment: stamp duty on the price without 9% VAT", () => {
  const c = run({ newBuild: true, apartment: true });
  assert.deepEqual(whole(c, ["maxPrice", "stamp"]), { maxPrice: 210023, stamp: 3486 });
});

test("new house with Help to Buy: counted in the maximum, not at 380,000", () => {
  const c = run({ newBuild: true, htb: "30000" });
  assert.deepEqual(whole(c, ["maxPrice", "htbStop", "funds", "loanNeeded"]),
    { maxPrice: 233217, htbStop: 257143, funds: 35000, loanNeeded: 342000 });
  assert.equal(c.htb, 0);
});

test("Help to Buy with savings 100,000: above the stop, income is the limit", () => {
  const c = run({ newBuild: true, htb: "30000", savings: "100000" });
  assert.equal(Math.round(c.maxPrice), 274531);
  assert.equal(verdictKind(c), "loanOver");
});

test("Help to Buy on a joint application", () => {
  const c = run({ newBuild: true, htb: "30000", joint: true });
  assert.deepEqual(whole(c, ["maxPrice", "maxLoan", "htb", "loanNeeded", "monthly"]),
    { maxPrice: 390509, maxLoan: 332000, htb: 30000, loanNeeded: 321398, monthly: 1516 });
  assert.equal(verdictKind(c), "within");
});

test("stuck at the Help to Buy price cap", () => {
  const c = run({ newBuild: true, htb: "30000", joint: true, salary: "60000", salary2: "60000", savings: "45000" });
  assert.equal(Math.round(c.maxPrice), 500000);
  assert.equal(Math.round(c.savingsPastHtb), 12455);
  assert.equal(verdictKind(c), "within");
});

test("price 1,200,000 uses the 1% and 2% bands", () => {
  const c = run({ price: "1200000" });
  assert.equal(Math.round(c.stamp), 14000);
  assert.equal(verdictKind(c), "outOfReach");
});

test("Revenue's own example: new home at 400,000", () => {
  assert.equal(stampDuty(400000, VAT.house).toFixed(2), "3524.23");
  assert.equal(stampDuty(400000, VAT.apartment).toFixed(2), "3669.72");
});
