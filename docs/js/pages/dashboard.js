// Dashboard for signed-in people: progress, current phase, next step, phases,
// calculator figures and account details.

function renderPage(p) {
  const user = renderGate();
  if (!user) return;
  const c = calc();
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

  bind("maxPrice", euro(c.maxPrice));
  bind("maxLoan", euro(c.maxLoan));
  bind("funds", euro(c.funds));
  bind("memberSince", "Member since " + new Date(user.created_at).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" }));
}
