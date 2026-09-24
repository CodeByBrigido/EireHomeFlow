// Stamps partials/header.html and footer.html into every page in docs/.
//   npm run partials          writes the pages (run after editing a partial)
//   npm run check:partials    fails if any page has an out-of-date copy (used by CI)
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { stampPartials } from "./partials.js";

const DOCS = "docs";
const check = process.argv.includes("--check");
const read = (path) => {
  try {
    return readFileSync(join(DOCS, path), "utf8");
  } catch {
    return undefined;
  }
};

const stale = [];
for (const name of readdirSync(DOCS).filter((file) => file.endsWith(".html"))) {
  const file = join(DOCS, name);
  const html = readFileSync(file, "utf8");
  const next = stampPartials(html, read);
  if (next === html) continue;
  stale.push(file);
  if (!check) writeFileSync(file, next);
}

if (check && stale.length) {
  console.error(`Header or footer out of date in: ${stale.join(", ")}. Run npm run partials.`);
  process.exit(1);
}
console.log(check ? "Every page has the current header and footer." : `Header and footer stamped into ${stale.length} pages.`);
