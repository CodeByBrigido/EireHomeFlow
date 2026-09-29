// Dashboard for signed-in people: progress, current phase, next step, phases,
// calculator figures and account details.
import { calc } from "../lib/calculator.js?v=20261004";
import { firstName } from "../lib/people.js?v=20261004";
import { XP_PER_STEP } from "../lib/progress.js?v=20261004";
import { startPage } from "../core/app.js?v=20261004";
import { bind } from "../core/dom.js?v=20261004";
import { renderGate } from "../core/header.js?v=20261004";
import { date, money, number, percent, t } from "../core/i18n.js?v=20261004";
import { state } from "../core/state.js?v=20261004";
import { phaseCardsHtml, stepLink, steps } from "../core/steps.js?v=20261004";

function renderPage(p) {
  const user = renderGate();
  if (!user) return;
  const c = calc(state);
  const next = steps[p.unlocked];
  const current = next || steps[steps.length - 1];

  bind("dashGreeting", firstName(user) ? t("account:dashboard.hello", { name: firstName(user) }) : t("account:dashboard.helloNoName"));
  bind("pct", percent(p.pct / 100));
  bind("countLabel", t("common:progress.steps", { done: p.doneCount, count: steps.length }));
  bind("xp", number(p.doneCount * XP_PER_STEP));
  bind("dashPhaseNumber", current.phase.n);
  bind("dashPhaseName", current.phase.title);
  bind("nextTitle", next ? next.title : t("account:dashboard.allDone"));
  const nextLink = document.getElementById("next-link");
  nextLink.hidden = !next;
  if (next) nextLink.href = stepLink(next);
  document.getElementById("dash-phases").innerHTML = phaseCardsHtml();

  // Until the calculator is saved, the figures are only the examples, so none are shown.
  const saved = !!state.calcSaved;
  bind("maxPrice", saved ? money(c.maxPrice) : t("account:dashboard.notSaved"));
  bind("numbersNote", saved ? t("account:dashboard.numbersSaved") : t("account:dashboard.numbersHint"));
  const numbers = document.getElementById("dash-numbers");
  if (numbers) numbers.hidden = !saved;
  bind("numbersAction", saved ? t("account:dashboard.openCalculator") : t("account:dashboard.useCalculator"));
  bind("maxLoan", money(c.maxLoan));
  bind("funds", money(c.funds));
  bind("memberSince", t("account:dashboard.memberSince", { date: date(user.created_at) }));
}

startPage({ render: renderPage });
