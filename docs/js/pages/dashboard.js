// Dashboard for signed-in people: progress, current phase, next step, phases,
// calculator figures and account details.
import { calc } from "../lib/calculator.js?v=20260924";
import { euro } from "../lib/format.js?v=20260924";
import { firstName } from "../lib/people.js?v=20260924";
import { startPage } from "../core/app.js?v=20260924";
import { bind } from "../core/dom.js?v=20260924";
import { renderGate } from "../core/header.js?v=20260924";
import { state } from "../core/state.js?v=20260924";
import { phaseCardsHtml, stepLink, steps } from "../core/steps.js?v=20260924";

function renderPage(p) {
  const user = renderGate();
  if (!user) return;
  const c = calc(state);
  const next = steps[p.unlocked];
  const current = next || steps[steps.length - 1];

  bind("dashGreeting", firstName(user) ? "Hi, " + firstName(user) : "Hi there");
  bind("pct", p.pct + "%");
  bind("countLabel", p.doneCount + " of " + steps.length + " steps");
  bind("dashPhaseNumber", current.phase.n);
  bind("dashPhaseName", current.phase.title);
  bind("nextTitle", next ? next.title : "Every step is done. Put the kettle on.");
  const nextLink = document.getElementById("next-link");
  nextLink.hidden = !next;
  if (next) nextLink.href = stepLink(next);
  document.getElementById("dash-phases").innerHTML = phaseCardsHtml();

  // Until the calculator is saved, the figures are only the examples, so none are shown.
  const saved = !!state.calcSaved;
  bind("maxPrice", saved ? euro(c.maxPrice) : "Not saved yet");
  bind("numbersNote", saved ? "Maximum property price, based on the figures in your calculator."
    : "Fill in the calculator and choose Save to my journey to see your numbers here. They stay in this browser.");
  const numbers = document.getElementById("dash-numbers");
  if (numbers) numbers.hidden = !saved;
  bind("numbersAction", saved ? "Open the calculator" : "Use the calculator");
  bind("maxLoan", euro(c.maxLoan));
  bind("funds", euro(c.funds));
  bind("memberSince", "Member since " + new Date(user.created_at).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" }));
}

startPage({ render: renderPage });
