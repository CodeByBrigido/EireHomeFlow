// Checks the translations: texts missing, unused or inconsistent between languages, pages
// without keys, and English out of step with the HTML. Part of npm run check and of CI.
//   npm run check:i18n
// What each message means and how to fix it: specs/08-Internationalisation.md.
import { validate } from "./i18n.js";
import { loadProject } from "./i18n-project.js";

const project = loadProject();
const { errors, warnings, coverage } = validate(project);

const total = coverage.length ? coverage[0].total : 0;
console.log(`Languages (${total} texts in English):`);
for (const row of coverage) {
  const share = row.total ? Math.floor((row.translated / row.total) * 100) : 0;
  console.log(`  ${row.code.padEnd(3)} ${row.name.padEnd(20)} ${row.status.padEnd(9)} ${String(row.translated).padStart(5)}  ${share}%`);
}
if (warnings.length) console.log("\nWarnings:\n" + warnings.map((line) => "  " + line).join("\n"));
if (errors.length) {
  console.error(`\n${errors.length} problem${errors.length === 1 ? "" : "s"}:\n` + errors.map((line) => "  " + line).join("\n"));
  process.exit(1);
}
console.log("\nTranslations are complete and consistent.");
