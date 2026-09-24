// Home page: ticker loop, phase cards and the start or resume button.

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

actions.ticker = () => {
  const ticker = document.getElementById("ticker");
  const paused = ticker.classList.toggle("is-paused");
  ticker.querySelector(".ticker__toggle").textContent = paused ? "Play" : "Pause";
};
