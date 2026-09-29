import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { CATEGORIES, CATEGORY_NAMES, POSTS, SLIDESHOW, homeSelection, postCardHtml, shuffle, similarPosts } from "../docs/js/lib/posts.js";
import { articleProblems, postPage, readingMinutes, sitemapXml } from "../tools/posts.js";
import { htmlProblems, untranslatedText } from "../tools/i18n.js";

const fromRoot = (path) => new URL("../" + path, import.meta.url);
const guideSteps = Object.keys(JSON.parse(readFileSync(fromRoot("docs/locales/en/guide.json"), "utf8")).steps);

// A repeatable stand-in for Math.random.
const seeded = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const article = {
  alt: "A small house",
  lead: "A short lead.",
  sections: [{ title: "First part", body: ["A paragraph with <strong>bold</strong> text.", ["One", "Two"], { tip: "A tip." }] }],
  journey: "Step 5 of My journey covers this.",
};
const post = { slug: "sample", category: "money", step: "preparation-4", tags: ["deposit"], title: "A sample article", summary: "What it is about." };

test("every article has a category, a real My journey step, its text and its picture", () => {
  const slugs = POSTS.map((item) => item.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.ok(POSTS.length >= 20);
  for (const item of POSTS) {
    assert.ok(CATEGORIES.includes(item.category), `${item.slug}: ${item.category}`);
    assert.ok(guideSteps.includes(item.step), `${item.slug}: ${item.step}`);
    assert.ok(item.title && item.summary && item.tags.length, item.slug);
    assert.ok(existsSync(fromRoot(`content/blog/${item.slug}.json`)), `${item.slug}: text`);
    assert.ok(existsSync(fromRoot(`docs/img/blog/${item.slug}.svg`)), `${item.slug}: picture`);
  }
});

test("shuffle keeps every item once", () => {
  const items = [1, 2, 3, 4, 5, 6];
  const out = shuffle(items, seeded(7));
  assert.deepEqual([...out].sort(), items);
  assert.deepEqual(items, [1, 2, 3, 4, 5, 6]);
});

test("the home page shows four slides, three beside them and the rest, never twice", () => {
  const pick = homeSelection(seeded(42));
  assert.equal(pick.slides.length, 4);
  assert.equal(pick.side.length, 3);
  assert.equal(pick.more.length, POSTS.length - 7);
  const shown = [...pick.slides, ...pick.side, ...pick.more].map((item) => item.slug);
  assert.equal(new Set(shown).size, POSTS.length);
});

test("similar articles share the category first and never include the article itself", () => {
  const similar = similarPosts("help-to-buy-step-by-step");
  assert.equal(similar.length, 3);
  assert.ok(!similar.some((item) => item.slug === "help-to-buy-step-by-step"));
  assert.ok(similar.every((item) => item.category === "schemes"));
  assert.deepEqual(similarPosts("help-to-buy-step-by-step"), similar);
  assert.deepEqual(similarPosts("not-an-article"), []);
});

test("a card links to the article, names its category and can wait for Show more articles", () => {
  const html = postCardHtml({ ...POSTS[0], title: "Tom & Jerry <b>" }, "row", true);
  assert.match(html, /href="blog\/government-schemes-checker\.html"/);
  assert.match(html, /<li class="post-card post-card--row" hidden>/);
  assert.match(html, /post-card__category">Schemes</);
  assert.match(html, /post-card__title">Tom &amp; Jerry &lt;b&gt;</);
});

test("the blog has an English name for every category and the words of the slideshow", () => {
  assert.deepEqual(CATEGORIES, Object.keys(CATEGORY_NAMES));
  assert.equal(SLIDESHOW.position(2, 4), "2 of 4");
  assert.equal(SLIDESHOW.goTo(1, 4), "Show article 1 of 4");
});

test("reading time counts the lead, the sections and the note, rounded up", () => {
  assert.equal(readingMinutes(article), 1);
  const long = { ...article, sections: [{ title: "Long", body: [Array(450).fill("word").join(" ")] }] };
  assert.equal(readingMinutes(long), 3);
});

test("article checks: the house style, safe links and a pointer to My journey", () => {
  assert.deepEqual(articleProblems(post, article, "sample.json"), []);
  const problems = articleProblems(post, {
    ...article,
    lead: "Fast — and simple",
    sections: [{ title: "Links", body: ['<a href="javascript:alert(1)">x</a>', "<img src=x>", { quote: "?" }] }],
    journey: "Open the calculator.",
  }, "sample.json");
  assert.ok(problems.some((p) => p.includes("an em dash")));
  assert.ok(problems.some((p) => p.includes("javascript:alert(1)")));
  assert.ok(problems.some((p) => p.includes("<img> is not allowed")));
  assert.ok(problems.some((p) => p.includes("a block must be")));
  assert.ok(problems.some((p) => p.includes("My journey")));
  assert.ok(articleProblems({ ...post, title: "" }, article, "sample.json").some((p) => p.includes("needs a title")));
});

test("an article page is in English, apart from the shared header and footer", () => {
  const html = postPage({ post, article, version: "20260929" });
  assert.match(html, /<html lang="en-IE" data-i18n-ns="common">/);
  assert.match(html, /<base href="\.\.\/">/);
  assert.match(html, /<main class="main main--wide" lang="en-IE" data-i18n-source-only>/);
  assert.match(html, /<h1 class="post__title">A sample article<\/h1>/);
  assert.match(html, /<p class="post__category">Money<\/p>/);
  assert.match(html, /<p class="post__meta">1 min read<\/p>/);
  assert.match(html, /<p>A paragraph with <strong>bold<\/strong> text\.<\/p>/);
  assert.match(html, /href="journey\.html#step-preparation-4">Open this step in My journey</);
  assert.ok(!html.includes("data-i18n="), "no translation keys outside the header and footer");
  assert.deepEqual(htmlProblems(html), []);
  assert.deepEqual(untranslatedText(html), []);
});

test("an article page lists its three similar articles", () => {
  const real = POSTS.find((item) => item.slug === "deposit-savings-plan");
  const html = postPage({ post: real, article, version: "20260929" });
  for (const other of similarPosts(real.slug)) assert.ok(html.includes(`href="blog/${other.slug}.html"`), other.slug);
  assert.equal(html.split("post-card post-card--column").length - 1, 3);
});

test("sitemap.xml lists full addresses, with the home page as the site folder", () => {
  const xml = sitemapXml("https://example.com/site/", ["index.html", "guide.html", "blog/a&b.html"]);
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
  assert.match(xml, /<url><loc>https:\/\/example.com\/site\/<\/loc><\/url>/);
  assert.match(xml, /<loc>https:\/\/example.com\/site\/guide.html<\/loc>/);
  assert.match(xml, /<loc>https:\/\/example.com\/site\/blog\/a&amp;b.html<\/loc>/);
  assert.equal(xml.split("<url>").length - 1, 3);
});

test("the published sitemap.xml lists every article", () => {
  const xml = readFileSync(fromRoot("docs/sitemap.xml"), "utf8");
  for (const item of POSTS) assert.ok(xml.includes(`/blog/${item.slug}.html</loc>`), item.slug);
  assert.ok(xml.includes("/contact.html</loc>") && xml.includes("/sitemap.html</loc>"));
  assert.ok(!xml.includes("dashboard.html"), "account pages stay out");
});
