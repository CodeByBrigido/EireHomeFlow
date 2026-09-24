// Sets every ?v= number in docs/ to one new version. Run after changing any CSS or JS:
//   npm run bump              (today's date)
//   npm run bump -- 20261001  (a given date)
import { readFileSync, writeFileSync } from "node:fs";
import { bumpText, findVersions, siteFiles, today } from "./versions.js";

const version = process.argv[2] || today();
if (!/^\d{8}$/.test(version)) {
  console.error("The version must be a date like 20261001.");
  process.exit(1);
}
let changed = 0;
for (const file of siteFiles()) {
  const text = readFileSync(file, "utf8");
  if (!findVersions(text).length) continue;
  const next = bumpText(text, version);
  if (next !== text) {
    writeFileSync(file, next);
    changed += 1;
  }
}
console.log(`?v=${version} in ${changed} files.`);
