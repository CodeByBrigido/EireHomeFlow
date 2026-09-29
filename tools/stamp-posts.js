// Writes docs/blog/<slug>.html for every article in js/lib/posts.js, from its text in
// content/blog/<slug>.json, with the header and the footer stamped in from partials/, and
// docs/sitemap.xml with the public pages and every article.
//   npm run posts          writes the pages and the sitemap (run after adding or editing an article)
//   npm run check:posts    fails if an article has a problem or a file is out of date (used by CI)
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { POSTS, postPath } from "../docs/js/lib/posts.js";
import { flatten, stampHtml } from "./i18n.js";
import { stampPartials } from "./partials.js";
import { articleProblems, postPage, sitemapXml } from "./posts.js";
import { findVersions } from "./versions.js";

const DOCS = "docs";
const BLOG = join(DOCS, "blog");
const CONTENT = join("content", "blog");
const check = process.argv.includes("--check");
// The published site, and the pages search engines should list (not the account pages).
const SITE = "https://codebybrigido.github.io/EireHomeFlow/";
const PUBLIC_PAGES = ["index.html", "guide.html", "journey.html", "calculator.html", "contact.html", "sitemap.html", "privacy.html", "terms.html"];

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const readPartial = (path) => {
  try {
    return readFileSync(join(DOCS, path), "utf8");
  } catch {
    return undefined;
  }
};

// The header and footer are translated like on every page; the article carries their English.
const english = new Map();
for (const [key, entry] of flatten(readJson(join(DOCS, "locales/en/common.json")), "common").entries) {
  if (entry.kind === "text") english.set(key, entry.value);
}

const version = findVersions(readFileSync(join(DOCS, "index.html"), "utf8"))[0];
const problems = [];
const stale = [];
const slugs = new Set();
if (!check && !existsSync(BLOG)) mkdirSync(BLOG);

for (const post of POSTS) {
  if (slugs.has(post.slug)) problems.push(`js/lib/posts.js lists ${post.slug} twice.`);
  slugs.add(post.slug);
  const source = join(CONTENT, post.slug + ".json");
  if (!existsSync(source)) {
    problems.push(`${source} is missing: write the article there first.`);
    continue;
  }
  if (!existsSync(join(DOCS, "img/blog", post.slug + ".svg"))) problems.push(`docs/img/blog/${post.slug}.svg is missing: every article needs its picture.`);
  let article;
  try {
    article = readJson(source);
  } catch (err) {
    problems.push(`${source} is not valid JSON: ${err.message}`);
    continue;
  }
  const found = articleProblems(post, article, source);
  if (found.length) {
    problems.push(...found);
    continue;
  }
  const file = join(BLOG, post.slug + ".html");
  const html = stampHtml(stampPartials(postPage({ post, article, version }), readPartial), (key) => english.get(key));
  const current = existsSync(file) ? readFileSync(file, "utf8") : null;
  if (current === html) continue;
  stale.push(file);
  if (!check) writeFileSync(file, html);
}

// The sitemap for search engines.
const sitemapFile = join(DOCS, "sitemap.xml");
const sitemap = sitemapXml(SITE, [...PUBLIC_PAGES, ...POSTS.map((post) => postPath(post.slug))]);
for (const page of PUBLIC_PAGES) if (!existsSync(join(DOCS, page))) problems.push(`docs/${page} is listed for sitemap.xml but does not exist.`);
if ((existsSync(sitemapFile) ? readFileSync(sitemapFile, "utf8") : null) !== sitemap) {
  stale.push(sitemapFile);
  if (!check) writeFileSync(sitemapFile, sitemap);
}

// An article left out of js/lib/posts.js would stay online with no way to reach it.
const orphans = existsSync(BLOG) ? readdirSync(BLOG).filter((name) => name.endsWith(".html") && !slugs.has(name.slice(0, -5))) : [];
for (const name of orphans) problems.push(`${join(BLOG, name)} has no article in js/lib/posts.js. Delete the page, or add the article back.`);
const unused = existsSync(CONTENT) ? readdirSync(CONTENT).filter((name) => name.endsWith(".json") && !slugs.has(name.slice(0, -5))) : [];
for (const name of unused) problems.push(`${join(CONTENT, name)} is not in js/lib/posts.js, so it has no page.`);

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
if (check && stale.length) {
  console.error(`Out of date: ${stale.join(", ")}. Run npm run posts.`);
  process.exit(1);
}
console.log(check ? `All ${POSTS.length} article pages and sitemap.xml are up to date.` : `Wrote ${stale.length} files (${POSTS.length} article pages and sitemap.xml checked).`);
