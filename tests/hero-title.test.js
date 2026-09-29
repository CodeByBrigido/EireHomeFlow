// The home page title is sized per language (--title-em in styles.css) so each half stays on one
// line. The numbers were measured for these exact titles. Changed a title, or added a language?
// Measure the longest half again in the browser (specs/08, section 7) and update both places.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOCALES, SOURCE_LOCALE } from "../docs/js/lib/locales.js";

const fromRoot = (path) => new URL("../" + path, import.meta.url);
const css = readFileSync(fromRoot("docs/css/styles.css"), "utf8");

const MEASURED = {
  en: "From first savings<br>to your <em>first sofa</em>.",
  pt: "Das primeiras economias<br>ao seu <em>primeiro sofá</em>.",
  es: "De los primeros ahorros<br>a tu <em>primer sofá</em>.",
  fr: "Des premières économies<br>à votre <em>premier canapé</em>.",
  de: "Vom ersten Ersparten<br>bis zum <em>ersten Sofa</em>.",
  it: "Dai primi risparmi<br>al tuo <em>primo divano</em>.",
  pl: "Od pierwszych oszczędności<br>do <em>pierwszej kanapy</em>.",
  ro: "De la primele economii<br>la <em>prima canapea</em>.",
  lt: "Nuo pirmųjų santaupų<br>iki <em>pirmos sofos</em>.",
};

test("every language's home title is the one its size was measured for", () => {
  for (const { code } of LOCALES) {
    const title = JSON.parse(readFileSync(fromRoot(`docs/locales/${code}/home.json`), "utf8")).hero.title;
    assert.equal(title, MEASURED[code], `${code}: the title changed, so measure --title-em again`);
  }
});

test("every language has its own title width in styles.css", () => {
  assert.match(css, /\.hero__title \{ --title-em: [\d.]+;/, "the English width is the default");
  for (const { code } of LOCALES) {
    if (code === SOURCE_LOCALE) continue;
    assert.match(css, new RegExp(`\\.hero__title:lang\\(${code}\\) \\{ --title-em: [\\d.]+; \\}`), code);
  }
});
