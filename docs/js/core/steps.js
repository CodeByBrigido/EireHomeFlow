// The step list, read from guide.html (the single source of the steps' content).
// PHASES and steps are live exports: they fill in once loadSteps() has run.
import { esc } from "../lib/format.js?v=20260926";
import { progress } from "../lib/progress.js?v=20260926";
import { state } from "./state.js?v=20260926";

export let PHASES = [];
export let steps = [];

export async function loadSteps() {
  let doc = document;
  try {
    if (!document.querySelector(".guide-phase")) {
      // "no-cache" asks the server whether the guide changed, so the steps never come
      // from an older copy than the scripts reading them.
      const res = await fetch("guide.html", { cache: "no-cache" });
      doc = new DOMParser().parseFromString(await res.text(), "text/html");
    }
  } catch (err) {
    console.error("Could not load the step list from guide.html.", err);
    return;
  }
  const textOf = (el, selector) => el.querySelector(selector).textContent.trim();
  PHASES = [...doc.querySelectorAll(".guide-phase")].map((el) => ({
    n: textOf(el, ".guide-phase__badge"),
    slug: el.dataset.slug,
    title: textOf(el, ".guide-phase__title"),
    subtitle: textOf(el, ".guide-phase__subtitle"),
    text: textOf(el, ".guide-phase__text"),
    // data-auto: the site ticks the step itself ("calculator": saved from the calculator,
    // "account": signed in). data-numbers: which calculator figures the journey shows on it.
    tasks: [...el.querySelectorAll(".guide-step")].map((s) => ({
      title: textOf(s, ".guide-step__title"),
      body: textOf(s, ".guide-step__body"),
      blocking: s.dataset.blocking === "true",
      auto: s.dataset.auto || (s.dataset.account === "true" ? "account" : ""),
      account: s.dataset.auto === "account" || s.dataset.account === "true",
      numbers: s.dataset.numbers || "",
      time: textOf(s, ".guide-step__time"),
      cost: textOf(s, ".guide-step__cost"),
      checklist: [...s.querySelectorAll(".guide-step__checklist li")].map((li) => li.textContent.trim()),
      howtoLabel: s.querySelector(".guide-step__howto-label") ? textOf(s, ".guide-step__howto-label") : "",
      howto: [...s.querySelectorAll(".guide-step__howto li")].map((li) => li.textContent.trim()),
      links: [...s.querySelectorAll(".guide-step__links a")].map((a) => ({ href: a.getAttribute("href"), text: a.textContent.trim() })),
      tip: textOf(s, ".guide-step__tip-text"),
      image: s.querySelector(".guide-step__image") ? s.querySelector(".guide-step__image").getAttribute("src") : "",
      imageAlt: s.querySelector(".guide-step__image") ? s.querySelector(".guide-step__image").alt : "",
    })),
  }));
  steps = PHASES.flatMap((phase) => phase.tasks.map((task, i) => ({ ...task, id: phase.slug + "-" + i, phase })));
}

export const currentProgress = () => progress(steps, state.done);

export const stepLink = (s) => "journey.html#step-" + s.id;

// The calculator step: the site ticks it when the person saves their figures there.
// Step IDs never change, so the ID is a fallback if the guide came without data-auto.
export const calculatorStep = () => steps.find((s) => s.auto === "calculator") || steps.find((s) => s.id === "preparation-0");

export function phaseCardsHtml() {
  return PHASES.map((phase) => {
    const dn = phase.tasks.filter((t, i) => state.done[phase.slug + "-" + i]).length;
    const pc = Math.round((dn / phase.tasks.length) * 100);
    return `<a class="phase-card" href="journey.html#phase-${phase.slug}">
        <span class="phase-card__head">
          <span class="phase-card__badge${dn ? " is-active" : ""}">${phase.n}</span>
          <span class="phase-card__title">${esc(phase.title)}</span>
        </span>
        <span class="phase-card__text">${esc(phase.text)}</span>
        <span class="bar"><span class="bar__fill${pc === 100 ? " is-full" : ""}" style="width:${pc}%"></span></span>
        <span class="phase-card__progress">${dn} of ${phase.tasks.length} steps done</span>
      </a>`;
  }).join("");
}
