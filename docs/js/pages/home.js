// Home page: ticker loop, phase cards, the start or resume button, and the blog: a slideshow of
// four articles, three more beside it and the rest below, picked at random on every visit.
// The blog is in English only (its words are in lib/posts.js).
import { esc } from "../lib/format.js?v=20260929";
import { CATEGORY_NAMES, SLIDESHOW, homeSelection, postCardHtml, postImage, postPath } from "../lib/posts.js?v=20260929";
import { startPage } from "../core/app.js?v=20260929";
import { bind } from "../core/dom.js?v=20260929";
import { t } from "../core/i18n.js?v=20260929";
import { phaseCardsHtml } from "../core/steps.js?v=20260929";

const SLIDE_SECONDS = 7;
const MORE_AT_A_TIME = 6;

// The slideshow moves on its own unless the reader paused it, is pointing at it or has keyboard
// focus in it, or asked their system for less motion (then it starts paused).
const slideshow = { current: 0, paused: false, held: false };

function slideHtml(post, index, total) {
  return `<div class="slide" role="group" aria-roledescription="${SLIDESHOW.slide}" aria-label="${esc(SLIDESHOW.position(index + 1, total))}">
      <a class="slide__link" href="${esc(postPath(post.slug))}">
        <img class="slide__image" src="${esc(postImage(post.slug))}" alt="" width="800" height="500"${index ? ' loading="lazy"' : ""}>
        <span class="slide__category">${esc(CATEGORY_NAMES[post.category])}</span>
        <span class="slide__title">${esc(post.title)}</span>
        <span class="slide__summary">${esc(post.summary)}</span>
      </a>
    </div>`;
}

function showSlide(index, byReader) {
  const slides = document.querySelectorAll("#slides .slide");
  if (!slides.length) return;
  slideshow.current = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    const on = i === slideshow.current;
    slide.classList.toggle("is-active", on);
    slide.inert = !on;
    slide.setAttribute("aria-hidden", String(!on));
  });
  document.querySelectorAll("#slide-dots .slideshow__dot").forEach((dot, i) => dot.setAttribute("aria-current", String(i === slideshow.current)));
  // Only a change the reader asked for is announced; the automatic ones would interrupt reading.
  document.getElementById("slides").setAttribute("aria-live", byReader ? "polite" : "off");
}

function setPaused(paused) {
  slideshow.paused = paused;
  bind("slidePause", paused ? SLIDESHOW.play : SLIDESHOW.pause);
}

function renderBlog() {
  const pick = homeSelection();
  const total = pick.slides.length;
  const box = document.getElementById("slideshow");
  box.setAttribute("aria-roledescription", SLIDESHOW.role);
  document.getElementById("slides").innerHTML = pick.slides.map((post, i) => slideHtml(post, i, total)).join("");
  document.getElementById("slide-dots").innerHTML = pick.slides.map((post, i) =>
    `<button type="button" class="slideshow__dot" data-action="slideTo" data-index="${i}" aria-label="${esc(SLIDESHOW.goTo(i + 1, total))}"></button>`).join("");
  document.getElementById("blog-side").innerHTML = pick.side.map((post) => postCardHtml(post, "row")).join("");
  document.getElementById("blog-more").innerHTML = pick.more.map((post, i) => postCardHtml(post, "row", i >= MORE_AT_A_TIME)).join("");
  document.getElementById("more-posts").hidden = pick.more.length <= MORE_AT_A_TIME;
  showSlide(0, false);

  setPaused(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const hold = (held) => () => { slideshow.held = held; };
  box.addEventListener("mouseenter", hold(true));
  box.addEventListener("mouseleave", hold(false));
  box.addEventListener("focusin", hold(true));
  box.addEventListener("focusout", (e) => { if (!box.contains(e.relatedTarget)) slideshow.held = false; });
  setInterval(() => {
    if (!slideshow.paused && !slideshow.held && !document.hidden) showSlide(slideshow.current + 1, false);
  }, SLIDE_SECONDS * 1000);
}

// Reveals the next articles and moves the focus to the first of them.
function morePosts() {
  const waiting = [...document.querySelectorAll("#blog-more .post-card[hidden]")];
  const next = waiting.slice(0, MORE_AT_A_TIME);
  next.forEach((item) => { item.hidden = false; });
  if (next.length) next[0].querySelector("a").focus();
  document.getElementById("more-posts").hidden = waiting.length <= MORE_AT_A_TIME;
}

function initPage() {
  // A second, hidden copy of the ticker items makes the loop seamless.
  const track = document.getElementById("ticker-track");
  [...track.children].forEach((item) => {
    const copy = item.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    track.appendChild(copy);
  });
  renderBlog();
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

startPage({ init: initPage, render: renderPage, actions: {
  ticker: toggleTicker,
  slidePrev: () => showSlide(slideshow.current - 1, true),
  slideNext: () => showSlide(slideshow.current + 1, true),
  slideTo: (el) => showSlide(Number(el.dataset.index), true),
  slidePause: () => setPaused(!slideshow.paused),
  morePosts,
} });
