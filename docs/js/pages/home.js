// Home page: ticker loop, phase cards and the start or resume button.
import { startPage } from "../core/app.js?v=20260924";
import { bind } from "../core/dom.js?v=20260924";
import { phaseCardsHtml } from "../core/steps.js?v=20260924";

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
  bind("resumeLabel", p.doneCount ? "Resume my journey" : "Start my journey");
  document.getElementById("phase-cards").innerHTML = phaseCardsHtml();
}

function toggleTicker() {
  const ticker = document.getElementById("ticker");
  const paused = ticker.classList.toggle("is-paused");
  ticker.querySelector(".ticker__toggle").textContent = paused ? "Play" : "Pause";
}

startPage({ init: initPage, render: renderPage, actions: { ticker: toggleTicker } });
