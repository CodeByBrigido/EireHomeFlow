// Reads what the translation tools work on: the language list, every locales/ file, the pages,
// the partials, the page scripts and js/i18n-boot.js. Run from the repository root, next to docs/.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { LOCALES, NAMESPACES, SOURCE_LOCALE } from "../docs/js/lib/locales.js";
import { messagesVersion } from "./i18n.js";

export const BOOT = "docs/js/i18n-boot.js";

const read = (path) => readFileSync(path, "utf8");
const list = (dir, ext) => (existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith(ext)).sort() : []);

export function loadProject() {
  const folders = existsSync("docs/locales")
    ? readdirSync("docs/locales", { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
    : [];
  const messages = {};
  const files = {};
  const texts = [];
  const problems = [];
  for (const code of folders) {
    messages[code] = {};
    files[code] = [];
    for (const name of list(`docs/locales/${code}`, ".json")) {
      const path = `docs/locales/${code}/${name}`;
      const text = read(path);
      const ns = name.slice(0, -".json".length);
      files[code].push(ns);
      texts.push({ path: `locales/${code}/${name}`, text });
      try {
        messages[code][ns] = JSON.parse(text);
      } catch (err) {
        problems.push(`${path} is not valid JSON: ${err.message}`);
      }
    }
  }
  const html = (dir) => list(dir, ".html").map((name) => ({ file: `${dir}/${name}`, html: read(`${dir}/${name}`) }));
  const scripts = ["core", "pages", "lib"].flatMap((dir) =>
    list(`docs/js/${dir}`, ".js").map((name) => ({ file: `docs/js/${dir}/${name}`, dir, js: read(`docs/js/${dir}/${name}`) })));
  return {
    locales: LOCALES,
    namespaces: NAMESPACES,
    source: SOURCE_LOCALE,
    folders,
    messages,
    files,
    texts,
    version: messagesVersion(texts),
    pages: html("docs"),
    partials: html("docs/partials"),
    scripts,
    boot: { file: BOOT, text: read(BOOT) },
    problems,
  };
}
