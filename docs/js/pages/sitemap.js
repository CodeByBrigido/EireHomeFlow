// Sitemap: every page in one place. The phases and steps come from the step list, in the page's
// language, and link into My journey; the blog articles come from js/lib/posts.js, in English.
import { esc } from "../lib/format.js?v=20261002";
import { CATEGORIES, CATEGORY_NAMES, POSTS, postPath } from "../lib/posts.js?v=20261002";
import { startPage } from "../core/app.js?v=20261002";
import { PHASES, steps } from "../core/steps.js?v=20261002";

function initPage() {
  document.getElementById("sitemap-steps").innerHTML = PHASES.map((phase) => `<div class="sitemap__column">
      <h3 class="sitemap__heading"><a href="journey.html#phase-${esc(phase.slug)}">${esc(phase.n)} · ${esc(phase.title)}</a></h3>
      <ol class="sitemap__list">${steps.filter((s) => s.phase === phase)
    .map((s) => `<li><a href="journey.html#step-${esc(s.id)}">${esc(s.title)}</a></li>`).join("")}</ol>
    </div>`).join("");
  document.getElementById("sitemap-posts").innerHTML = CATEGORIES.map((category) => `<div class="sitemap__column">
      <h3 class="sitemap__heading">${esc(CATEGORY_NAMES[category])}</h3>
      <ul class="sitemap__list">${POSTS.filter((post) => post.category === category)
    .map((post) => `<li><a href="${esc(postPath(post.slug))}">${esc(post.title)}</a></li>`).join("")}</ul>
    </div>`).join("");
}

startPage({ init: initPage });
