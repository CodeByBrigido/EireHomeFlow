// Fails when the site's ?v= numbers differ, or when a local script or stylesheet has none.
// Run with: npm run check:versions
import { readFileSync } from "node:fs";
import { findVersions, siteFiles, unversionedRefs } from "./versions.js";

const versions = new Map();
const problems = [];
for (const file of siteFiles()) {
  const text = readFileSync(file, "utf8");
  for (const v of findVersions(text)) versions.set(v, (versions.get(v) || new Set()).add(file));
  for (const ref of unversionedRefs(text)) problems.push(`${file}: "${ref}" has no ?v= number`);
}
if (versions.size === 0) problems.push("No ?v= numbers found. Run this from the repository root, next to docs/.");
if (versions.size > 1) {
  const list = [...versions].map(([v, files]) => `${v} (${files.size} files)`).join(", ");
  problems.push(`The site uses more than one ?v= number: ${list}. Run npm run bump.`);
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`All files use ?v=${[...versions.keys()][0]}.`);
