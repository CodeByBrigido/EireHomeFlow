// Copies the English texts from locales/en into the HTML, and the language list into
// js/i18n-boot.js. Run it after changing locales/, an element's data-i18n key, or js/lib/locales.js:
//   npm run i18n
// Then run npm run partials if a partial changed. npm run check:i18n fails while this is out of date.
import { writeFileSync } from "node:fs";
import { flatten, generatedBlock, stampBoot, stampHtml } from "./i18n.js";
import { loadProject } from "./i18n-project.js";

const project = loadProject();
if (project.problems.length) {
  console.error(project.problems.join("\n"));
  process.exit(1);
}

const english = new Map();
for (const [ns, tree] of Object.entries(project.messages[project.source] || {})) {
  for (const [key, entry] of flatten(tree, ns).entries) if (entry.kind === "text") english.set(key, entry.value);
}

const changed = [];
for (const item of [...project.partials, ...project.pages]) {
  const next = stampHtml(item.html, (key) => english.get(key));
  if (next === item.html) continue;
  writeFileSync(item.file, next);
  changed.push(item.file);
}
const boot = stampBoot(project.boot.text, generatedBlock(project.locales, project.files, project.version));
if (boot !== project.boot.text) {
  writeFileSync(project.boot.file, boot);
  changed.push(project.boot.file);
}

console.log(changed.length ? `Updated from locales/${project.source}: ${changed.join(", ")}.` : `Everything already matches locales/${project.source}.`);
if (changed.some((file) => file.includes("/partials/"))) console.log("A partial changed: run npm run partials to copy it into the pages.");
if (changed.length) console.log("Texts changed: run npm run bump so browsers fetch the new js/i18n-boot.js.");
