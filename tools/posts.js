// Builds the page of each blog article (docs/blog/<slug>.html) from its entry in js/lib/posts.js
// and its text in content/blog/<slug>.json. The blog is in English only: the whole article, its
// labels, its reading time and its similar articles go straight into the page, marked lang="en-IE"
// and data-i18n-source-only. Only the shared header and footer follow the site's language.
// Pure functions, so tests/posts.test.js can run them.
import { CATEGORY_NAMES, postCardHtml, postImage, postSrcset, similarPosts } from "../docs/js/lib/posts.js";
import { FORBIDDEN, escapeText } from "./i18n.js";

const WORDS_PER_MINUTE = 200;
const TAGS = new Set(["a", "strong", "em", "br"]);
// Links in an article go to other sites (https) or to a page of this site (journey.html#step-aip-0).
const LINK = /^(https:\/\/[^\s"<>]+|[a-z-]+\.html(#[\w-]+)?)$/;

const escapeAttribute = (text) => escapeText(text).replace(/"/g, "&quot;");

// Every text in an article file.
const textsIn = (node) => (typeof node === "string" ? [node] : Array.isArray(node) ? node.flatMap(textsIn)
  : node && typeof node === "object" ? Object.values(node).flatMap(textsIn) : []);

// Minutes to read the article (lead, sections and the note on My journey), rounded up.
export function readingMinutes(article) {
  const words = textsIn([article.lead, article.sections, article.journey]).join(" ")
    .replace(/<[^>]*>/g, " ").split(/\s+/).filter((word) => /\p{L}/u.test(word)).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

// A section's body is a list of blocks: a paragraph (text), a bulleted list (a list of texts),
// numbered steps ({ steps: [...] }), a note ({ tip: text }) or a table ({ head: [...], rows: [[...]] }).
// Paragraphs, items, notes and cells may hold <strong>, <em>, <br> and links; titles and headings are plain text.
function blockHtml(block, where, pad) {
  if (typeof block === "string") return [`${pad}<p>${block}</p>`];
  if (Array.isArray(block)) return [`${pad}<ul class="post__list">`, ...block.map((item) => `${pad}  <li>${item}</li>`), `${pad}</ul>`];
  if (block && Array.isArray(block.steps)) {
    return [`${pad}<ol class="post__steps">`, ...block.steps.map((item) => `${pad}  <li>${item}</li>`), `${pad}</ol>`];
  }
  if (block && typeof block.tip === "string") {
    return [`${pad}<div class="post__tip">`, `${pad}  <p class="label">Worth knowing</p>`, `${pad}  <p>${block.tip}</p>`, `${pad}</div>`];
  }
  if (block && Array.isArray(block.head) && Array.isArray(block.rows)) {
    return [
      `${pad}<div class="post__table-wrap">`,
      `${pad}  <table class="post__table">`,
      `${pad}    <thead><tr>${block.head.map((cell) => `<th scope="col">${escapeText(cell)}</th>`).join("")}</tr></thead>`,
      `${pad}    <tbody>`,
      ...block.rows.map((row) => `${pad}      <tr>${row.map((cell, c) => (c === 0 ? `<th scope="row">${cell}</th>` : `<td>${cell}</td>`)).join("")}</tr>`),
      `${pad}    </tbody>`,
      `${pad}  </table>`,
      `${pad}</div>`,
    ];
  }
  throw new Error(`${where}: a block must be a text, a list of texts, { steps }, { tip } or { head, rows }.`);
}

// What is wrong with an article, before a page is built from it. post is its entry in js/lib/posts.js.
export function articleProblems(post, article, where) {
  const problems = [];
  for (const name of ["title", "summary"]) if (typeof post[name] !== "string" || !post[name].trim()) problems.push(`${post.slug}: js/lib/posts.js needs a ${name}.`);
  if (!article || typeof article !== "object") return [...problems, `${where}: the file must hold an object.`];
  for (const name of ["alt", "lead", "journey"]) if (typeof article[name] !== "string" || !article[name].trim()) problems.push(`${where}: needs a "${name}" text.`);
  if (typeof article.journey === "string" && !article.journey.includes("My journey")) problems.push(`${where}: "journey" must send readers to My journey by name.`);
  const extra = Object.keys(article).filter((name) => !["alt", "lead", "sections", "journey"].includes(name));
  if (extra.length) problems.push(`${where}: unknown parts ${extra.join(", ")}; use alt, lead, sections and journey.`);
  if (!Array.isArray(article.sections) || !article.sections.length) problems.push(`${where}: needs "sections", each with a "title" and a "body".`);
  (Array.isArray(article.sections) ? article.sections : []).forEach((section, i) => {
    if (!section || typeof section.title !== "string" || !Array.isArray(section.body) || !section.body.length) {
      problems.push(`${where}: sections.${i} needs a "title" text and a "body" list.`);
      return;
    }
    section.body.forEach((block, j) => {
      try {
        blockHtml(block, `${where}: sections.${i}.body.${j}`, "");
      } catch (err) {
        problems.push(err.message);
      }
    });
  });
  // The house style and safe markup, as for every text on the site.
  for (const text of [post.title, post.summary, ...textsIn(article)].filter((value) => typeof value === "string")) {
    for (const [char, label] of Object.entries(FORBIDDEN)) if (text.includes(char)) problems.push(`${where}: "${text.slice(0, 50)}..." contains ${label}; use a hyphen, "about" or three dots.`);
    for (const m of text.matchAll(/<\/?([a-zA-Z][\w-]*)([^>]*)>/g)) {
      if (!TAGS.has(m[1].toLowerCase())) problems.push(`${where}: <${m[1]}> is not allowed; use <strong>, <em>, <br> or <a href="...">.`);
      const href = (m[2].match(/href="([^"]*)"/) || [])[1];
      if (m[1].toLowerCase() === "a" && m[0][1] !== "/" && !(href && LINK.test(href))) problems.push(`${where}: the link "${href || ""}" must start with https:// or be a page of this site.`);
    }
  }
  for (const text of [post.title, post.summary, article.alt, article.lead, article.journey, ...(article.sections || []).map((s) => s && s.title)]) {
    if (typeof text === "string" && /[<>]/.test(text)) problems.push(`${where}: "${text.slice(0, 50)}" must be plain text, without tags.`);
  }
  return problems;
}

// A card from js/lib/posts.js, indented to sit at pad in the page.
const cardAt = (post, pad) => pad + postCardHtml(post, "column").replace(/\n {4}/g, "\n" + pad);

// The page. Only the header and footer carry translation keys: tools/stamp-posts.js stamps them
// in from partials/ with their English. version is the ?v= of the site.
export function postPage({ post, article, version }) {
  const body = article.sections.flatMap((section) => [
    `        <h2>${escapeText(section.title)}</h2>`,
    ...section.body.flatMap((block) => blockHtml(block, post.slug, "        ")),
  ]);
  const minutes = readingMinutes(article);
  return [
    "<!DOCTYPE html>",
    '<html lang="en-IE" data-i18n-ns="common">',
    "<head>",
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    `  <!-- Written by npm run posts from content/blog/${post.slug}.json and js/lib/posts.js: edit those, then run npm run posts -->`,
    '  <base href="../">',
    `  <script src="js/i18n-boot.js?v=${version}"></script>`,
    `  <title lang="en-IE" data-i18n-source-only>${escapeText(post.title)}</title>`,
    `  <meta name="description" content="${escapeAttribute(post.summary)}" data-i18n-source-only>`,
    '  <link rel="icon" href="img/icon/favicon-32.png" type="image/png" sizes="32x32">',
    '  <link rel="icon" href="img/icon/favicon.svg" type="image/svg+xml">',
    '  <link rel="apple-touch-icon" href="img/icon/apple-touch-icon.png">',
    `  <link rel="stylesheet" href="css/styles.css?v=${version}">`,
    `  <script type="module" src="js/pages/post.js?v=${version}"></script>`,
    "</head>",
    `<body data-page="post" data-post="${post.slug}">`,
    '<div class="page">',
    "",
    '  <div data-include="partials/header.html"></div>',
    "",
    '  <main class="main main--wide" lang="en-IE" data-i18n-source-only>',
    '    <article class="post">',
    '      <header class="post__head">',
    '        <a class="post__back" href="index.html#blog">← All articles</a>',
    `        <p class="post__category">${escapeText(CATEGORY_NAMES[post.category])}</p>`,
    `        <h1 class="post__title">${escapeText(post.title)}</h1>`,
    `        <p class="post__lead">${escapeText(article.lead)}</p>`,
    `        <p class="post__meta">${minutes} min read</p>`,
    "      </header>",
    '      <figure class="post__figure">',
    `        <img src="${postImage(post.slug, 960)}" srcset="${postSrcset(post.slug)}" sizes="(max-width: 800px) calc(100vw - 32px), 760px" alt="${escapeAttribute(article.alt)}" width="1440" height="810" fetchpriority="high">`,
    "      </figure>",
    '      <div class="post__body">',
    ...body,
    "      </div>",
    '      <aside class="post-journey">',
    '        <p class="label">In My journey</p>',
    `        <p class="post-journey__text">${escapeText(article.journey)}</p>`,
    `        <a class="btn post-journey__btn" href="journey.html#step-${post.step}">Open this step in My journey</a>`,
    "      </aside>",
    "    </article>",
    "",
    '    <section class="similar" aria-labelledby="similar-title">',
    '      <h2 class="similar__title" id="similar-title">Similar articles</h2>',
    '      <ul class="post-grid">',
    ...similarPosts(post.slug).map((other) => cardAt(other, "        ")),
    "      </ul>",
    "    </section>",
    "  </main>",
    "",
    '  <div data-include="partials/footer.html"></div>',
    "",
    "</div>",
    "</body>",
    "</html>",
    "",
  ].join("\n");
}

// sitemap.xml for search engines: the public pages and every article, as full addresses.
// site is the published folder, ending in "/" (the home page is the folder itself).
export function sitemapXml(site, paths) {
  const urls = paths.map((path) => `  <url><loc>${escapeText(site + (path === "index.html" ? "" : path))}</loc></url>`);
  return ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...urls, "</urlset>", ""].join("\n");
}
