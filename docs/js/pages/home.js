// Home page: ticker loop, phase cards and the start or resume button.
import { startPage } from "../core/app.js?v=20260929";
import { bind } from "../core/dom.js?v=20260929";
import { t } from "../core/i18n.js?v=20260929";
import { phaseCardsHtml } from "../core/steps.js?v=20260929";

function initPage() {
  // A second, hidden copy of the ticker items makes the loop seamless.
  const track = document.getElementById("ticker-track");
  [...track.children].forEach((item) => {
    const copy = item.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    track.appendChild(copy);
  });
}

function renderPage(p) {
  bind("resumeLabel", p.doneCount ? t("home:hero.resume") : t("home:hero.start"));
  document.getElementById("phase-cards").innerHTML = phaseCardsHtml();
}

function toggleTicker() {
  const ticker = document.getElementById("ticker");
  const paused = ticker.classList.toggle("is-paused");
  ticker.querySelector(".ticker__toggle").textContent = paused ? t("home:ticker.play") : t("home:ticker.pause");
}

startPage({ init: initPage, render: renderPage, actions: { ticker: toggleTicker } });
