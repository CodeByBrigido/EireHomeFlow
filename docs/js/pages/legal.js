// Privacy Policy and Terms of Use: "On this page" list built from the section headings,
// with the section on screen highlighted. The list starts open; people can fold it.
import { esc } from "../lib/format.js?v=20260924";
import { startPage } from "../core/app.js?v=20260924";

function initPage() {
  const headings = [...document.querySelectorAll(".legal h2")];
  const list = document.getElementById("legal-toc-list");
  headings.forEach((h) => {
    if (!h.id) h.id = h.textContent.trim().toLowerCase().replace(/^\d+\.\s*/, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  });
  list.innerHTML = headings.map((h) => `<li><a href="#${h.id}">${esc(h.textContent.trim())}</a></li>`).join("");

  const links = new Map([...list.querySelectorAll("a")].map((a) => [a.getAttribute("href").slice(1), a]));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.remove("is-current"));
      const link = links.get(entry.target.id);
      if (link) link.classList.add("is-current");
    });
  }, { rootMargin: "-90px 0px -70% 0px" });
  headings.forEach((h) => observer.observe(h));
}

startPage({ init: initPage });
