// Translation tools: copying the English texts into the HTML, and checking every language.
// Pure functions over text, so tests/i18n-tools.test.js can run them; tools/i18n-project.js
// reads the files. Used by npm run i18n and npm run check:i18n. See specs/08-Internationalisation.md.
import { createHash } from "node:crypto";

// Attributes that can be translated with data-i18n-<attribute>="namespace:key".
export const ATTRIBUTES = ["aria-label", "placeholder", "alt", "title", "content"];
export const PLURAL_CATEGORIES = ["zero", "one", "two", "few", "many", "other"];
// House style (CLAUDE.md): no long dashes, "about equal" signs or ellipsis characters, in any language.
export const FORBIDDEN = { "—": "an em dash", "–": "an en dash", "≈": "the ≈ sign", "…": "the … character" };

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const KEY = /^[a-z]+:[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*$/;

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Texts

export const isPlural = (value) =>
  !!value && typeof value === "object" && !Array.isArray(value) && typeof value.other === "string" &&
  Object.keys(value).every((name) => PLURAL_CATEGORIES.includes(name));

// A namespace file as a flat list: "ns:path.to.text" → { kind, value }. Array items get their index
// (guide:steps.aip-0.checklist.2); arrays also report their length, which every language must match.
export function flatten(tree, ns) {
  const entries = new Map();
  const arrays = new Map();
  const walk = (node, path) => {
    const key = ns + ":" + path.join(".");
    if (typeof node === "string") entries.set(key, { kind: "text", value: node });
    else if (Array.isArray(node)) {
      arrays.set(key, node.length);
      node.forEach((item, i) => walk(item, [...path, String(i)]));
    } else if (isPlural(node)) entries.set(key, { kind: "plural", value: node });
    else if (node && typeof node === "object" && !Object.keys(node).some((name) => PLURAL_CATEGORIES.includes(name))) {
      for (const [name, child] of Object.entries(node)) walk(child, [...path, name]);
    } else entries.set(key, { kind: "invalid", value: node });
  };
  walk(tree, []);
  return { entries, arrays };
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
export const decode = (text) => text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name) =>
  name[0] === "#" ? String.fromCodePoint(name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : Number(name.slice(1)))
    : ENTITIES[name.toLowerCase()] ?? whole);

export const escapeText = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\u00a0/g, "&nbsp;");
const escapeAttribute = (text) => escapeText(text).replace(/"/g, "&quot;");

// What the reader sees of a text: without tags, entities decoded.
const plain = (text) => decode(text.replace(/<[^>]*>/g, " "));

export const placeholders = (text) => [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();

// The tags in a text with their attributes, in order: <a href="terms.html"> must stay that link.
export const tagsOf = (text) => [...text.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g)]
  .map((m) => (m[1] + m[2].toLowerCase() + " " + [...parseAttributes(m[3])].map(([name, value]) => `${name}="${value}"`).sort().join(" ")).trim());

const separatorCache = new Map();
function separators(tag) {
  if (!separatorCache.has(tag)) {
    const parts = new Intl.NumberFormat(tag).formatToParts(12345.6);
    separatorCache.set(tag, { group: parts.find((p) => p.type === "group").value, decimal: parts.find((p) => p.type === "decimal").value });
  }
  return separatorCache.get(tag);
}

// The numbers in a text, read the language's way: "€2,000" in English and "2.000 €" in German
// are both 2000. Every language must keep the numbers of the English (rates, limits, prices, dates).
export function numbersIn(text, tag) {
  const { group, decimal } = separators(tag);
  const groupChars = /\s/.test(group) ? "[\\s\\u00a0\\u202f]" : escapeRegExp(group);
  const dec = escapeRegExp(decimal);
  const number = new RegExp(`\\d{1,3}(?:${groupChars}\\d{3})+(?:${dec}\\d+)?(?!\\d)|\\d+(?:${dec}\\d+)?`, "g");
  return (plain(text).replace(/\{\w+\}/g, " ").match(number) || [])
    .map((found) => Number(found.replace(new RegExp(groupChars, "g"), "").replace(decimal, ".")))
    .sort((a, b) => a - b);
}

const count = (text, char) => text.split(char).length - 1;
const words = (text) => plain(text).split(/\s+/).filter((word) => /\p{L}/u.test(word)).length;

// Plural forms a language needs: those used by the numbers 0 to 1000, plus "other".
export function pluralNeeds(tag) {
  const rules = new Intl.PluralRules(tag);
  const needed = new Set(["other"]);
  for (let n = 0; n <= 1000; n++) needed.add(rules.select(n));
  return { needed: [...needed], allowed: rules.resolvedOptions().pluralCategories };
}

// HTML

export function parseAttributes(source) {
  const attrs = new Map();
  for (const m of source.matchAll(/([^\s"'=<>/`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    attrs.set(m[1].toLowerCase(), decode(m[2] ?? m[3] ?? m[4] ?? ""));
  }
  return attrs;
}

function lineIndex(text) {
  const starts = [0];
  for (let i = text.indexOf("\n"); i >= 0; i = text.indexOf("\n", i + 1)) starts.push(i + 1);
  return (offset) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= offset) lo = mid; else hi = mid - 1;
    }
    return lo + 1;
  };
}

// The elements and text of a page, with positions: enough for the hand-written HTML of this site.
export function scan(html) {
  const tag = /<!--[\s\S]*?-->|<!doctype[^>]*>|<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/gi;
  const lineAt = lineIndex(html);
  const elements = [];
  const texts = [];
  const stack = [];
  let last = 0;
  let m;
  const addText = (start, end) => {
    if (end > start) texts.push({ start, end, parent: stack[stack.length - 1] || null, line: lineAt(start) });
  };
  while ((m = tag.exec(html))) {
    addText(last, m.index);
    last = tag.lastIndex;
    if (!m[2]) continue; // comment or doctype
    const name = m[2].toLowerCase();
    if (m[1]) {
      const open = stack.map((el) => el.name).lastIndexOf(name);
      if (open >= 0) {
        stack[open].innerEnd = m.index;
        stack[open].end = tag.lastIndex;
        stack[open].closed = true;
        stack.length = open;
      }
      continue;
    }
    const el = {
      name, attrs: parseAttributes(m[3]), tag: m[0], start: m.index, innerStart: tag.lastIndex, innerEnd: tag.lastIndex,
      end: tag.lastIndex, parent: stack[stack.length - 1] || null, line: lineAt(m.index), closed: false,
    };
    elements.push(el);
    if (name === "script" || name === "style") {
      const close = html.toLowerCase().indexOf("</" + name, tag.lastIndex);
      el.innerEnd = close < 0 ? html.length : close;
      el.end = close < 0 ? html.length : html.indexOf(">", close) + 1;
      el.closed = close >= 0;
      tag.lastIndex = last = el.end;
      continue;
    }
    if (VOID.has(name) || /\/\s*$/.test(m[3])) el.closed = true;
    else stack.push(el);
  }
  addText(last, html.length);
  return { elements, texts };
}

const keyOf = (el) => el.attrs.get("data-i18n") || el.attrs.get("data-i18n-html") || "";
const hasKeys = (el) => !!keyOf(el) || ATTRIBUTES.some((name) => el.attrs.has("data-i18n-" + name));
const inside = (el, test) => {
  for (let up = el.parent; up; up = up.parent) if (test(up)) return true;
  return false;
};

// The translation keys a page uses, and how: "text" (data-i18n), "html" (data-i18n-html) or an attribute.
export function htmlKeys(html) {
  const refs = [];
  for (const el of scan(html).elements) {
    if (el.attrs.has("data-i18n")) refs.push({ key: el.attrs.get("data-i18n"), kind: "text", line: el.line });
    if (el.attrs.has("data-i18n-html")) refs.push({ key: el.attrs.get("data-i18n-html"), kind: "html", line: el.line });
    for (const name of ATTRIBUTES) if (el.attrs.has("data-i18n-" + name)) refs.push({ key: el.attrs.get("data-i18n-" + name), kind: name, line: el.line });
  }
  return refs;
}

// Markup the runtime could not translate properly.
export function htmlProblems(html) {
  const problems = [];
  const { elements } = scan(html);
  for (const el of elements) {
    if (!hasKeys(el)) continue;
    const at = `line ${el.line}`;
    if (el.attrs.has("data-i18n") && el.attrs.has("data-i18n-html")) problems.push(`${at}: use data-i18n or data-i18n-html, not both.`);
    if (!el.closed) problems.push(`${at}: <${el.name}> with a translation key has no closing tag.`);
    if (el.attrs.has("data-i18n") && elements.some((child) => child.parent === el)) {
      problems.push(`${at}: data-i18n replaces the whole content, so it cannot hold other elements. Use data-i18n-html.`);
    }
    if (inside(el, (up) => !!keyOf(up))) problems.push(`${at}: a translated element sits inside another translated element.`);
    for (const name of ATTRIBUTES) {
      const value = el.attrs.get("data-i18n-" + name);
      if (value !== undefined && !el.attrs.has(name)) problems.push(`${at}: data-i18n-${name} needs a ${name} attribute to fill in.`);
    }
    for (const value of [...el.attrs].filter(([name]) => name.startsWith("data-i18n")).map(([, v]) => v)) {
      if (!KEY.test(value)) problems.push(`${at}: "${value}" is not a key like namespace:path.to.text.`);
    }
  }
  return problems;
}

// Words a reader would see with no translation key: text outside data-i18n elements, and labels,
// alt texts, placeholders and titles without data-i18n-<attribute>. translate="no" marks names
// (ÉireHome Flow, XP); data-i18n-source-only marks text kept in English on purpose.
export function untranslatedText(html) {
  const { elements, texts } = scan(html);
  const exempt = (el) => el.attrs.get("translate") === "no" || el.attrs.has("data-i18n-source-only") || ["script", "style", "svg"].includes(el.name);
  const covered = (el) => !!keyOf(el) || exempt(el) || inside(el, (up) => !!keyOf(up) || exempt(up));
  const found = [];
  for (const text of texts) {
    const words = decode(html.slice(text.start, text.end)).replace(/\s+/g, " ").trim();
    if (!/\p{L}/u.test(words) || !text.parent || covered(text.parent)) continue;
    found.push({ line: text.line, text: words });
  }
  for (const el of elements) {
    if (exempt(el) || inside(el, exempt)) continue;
    const named = el.name === "meta" ? el.attrs.get("name") || el.attrs.get("property") || "" : "";
    const checked = ["aria-label", "alt", "placeholder", "title"].concat(/^(description|og:|twitter:)/.test(named) ? ["content"] : []);
    for (const name of checked) {
      const value = el.attrs.get(name);
      if (value && /\p{L}/u.test(value) && !el.attrs.has("data-i18n-" + name)) found.push({ line: el.line, text: `${name}="${value}"` });
    }
  }
  return found;
}

const setAttribute = (tag, name, value) => {
  const existing = new RegExp(`(\\s${escapeRegExp(name)}\\s*=\\s*)("[^"]*"|'[^']*'|[^\\s"'>]+)`);
  if (existing.test(tag)) return tag.replace(existing, (whole, start) => `${start}"${value}"`);
  return tag.replace(/\s*\/?>$/, (end) => ` ${name}="${value}"${end}`);
};

// Writes the English text of each key into the page: the content of data-i18n (as text) and
// data-i18n-html (as HTML) elements, and the attributes named by data-i18n-<attribute>.
// textOf(key) returns the English text, or undefined (left alone; the check reports it).
export function stampHtml(html, textOf) {
  const edits = [];
  for (const el of scan(html).elements) {
    if (!hasKeys(el) || !el.closed || inside(el, (up) => !!keyOf(up))) continue;
    const key = keyOf(el);
    const value = key ? textOf(key) : undefined;
    if (typeof value === "string") {
      const inner = el.attrs.has("data-i18n") ? escapeText(value) : value;
      if (html.slice(el.innerStart, el.innerEnd) !== inner) edits.push([el.innerStart, el.innerEnd, inner]);
    }
    let tag = el.tag;
    for (const name of ATTRIBUTES) {
      const text = el.attrs.has("data-i18n-" + name) ? textOf(el.attrs.get("data-i18n-" + name)) : undefined;
      if (typeof text === "string") tag = setAttribute(tag, name, escapeAttribute(text));
    }
    if (tag !== el.tag) edits.push([el.start, el.innerStart, tag]);
  }
  let out = html;
  for (const [from, to, text] of edits.sort((a, b) => b[0] - a[0])) out = out.slice(0, from) + text + out.slice(to);
  return out;
}

export const declaredNamespaces = (html) => {
  const found = html.match(/<html\b[^>]*\sdata-i18n-ns="([^"]*)"/);
  return found ? found[1].split(/\s+/).filter(Boolean) : null;
};

// Scripts

// Whole-line comments hold examples, not uses.
const withoutComments = (js) => js.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " ")).replace(/^\s*\/\/.*$/gm, "");

// The keys a script uses: "ns:path" strings, and `ns:path.${value}` templates, which stand for
// every key with some name where ${...} is.
export function scriptKeys(js, namespaces) {
  const lineAt = lineIndex(js);
  const keys = [];
  const patterns = [];
  const quoted = new RegExp(`(["'\`])((?:${namespaces.map(escapeRegExp).join("|")}):[\\w.$\\{\\}-]+)\\1`, "g");
  for (const m of withoutComments(js).matchAll(quoted)) {
    const line = lineAt(m.index);
    if (m[1] === "`" && m[2].includes("${")) {
      const regex = new RegExp("^" + m[2].split(/\$\{[^}]*\}/).map(escapeRegExp).join("[\\w-]+") + "$");
      patterns.push({ key: m[2], line, regex });
    } else keys.push({ key: m[2], line });
  }
  return { keys, patterns };
}

// Sentences written straight into a script instead of going through t(). A heuristic: a string
// that starts with a capital and has three or more words. Add // i18n-ignore to a line that is
// meant for developers only.
export function hardcodedStrings(js) {
  const found = [];
  withoutComments(js).split("\n").forEach((line, i) => {
    if (/console\.|i18n-ignore/.test(line)) return;
    for (const m of line.matchAll(/(["'`])([A-Z][a-z]+[^"'`]*?)\1/g)) {
      const text = m[2];
      if (count(text, " ") >= 2 && !/[<>{}=;$]/.test(text)) found.push({ line: i + 1, text });
    }
  });
  return found;
}

// The runtime (js/i18n-boot.js)

// A short fingerprint of all the texts. The runtime puts it in each locales/ address and in its
// copies, so a changed text is fetched again as soon as the site is published.
export function messagesVersion(files) {
  const hash = createHash("sha256");
  for (const { path, text } of [...files].sort((a, b) => (a.path < b.path ? -1 : 1))) hash.update(path + "\n" + text.replace(/\r\n/g, "\n") + "\n");
  return hash.digest("hex").slice(0, 10);
}

export function generatedBlock(locales, files, version) {
  const rows = locales.map((locale) => "    " + JSON.stringify({ ...locale, namespaces: [...(files[locale.code] || [])].sort() }));
  return `  var LOCALES = [\n${rows.join(",\n")},\n  ];\n  var MESSAGES_VERSION = "${version}";`;
}

export function stampBoot(text, block) {
  const marked = /(\/\/ i18n:generated[^\n]*\n)[\s\S]*?(\n[ \t]*\/\/ \/i18n:generated)/;
  if (!marked.test(text)) throw new Error("js/i18n-boot.js has lost its // i18n:generated ... // /i18n:generated lines.");
  return text.replace(marked, (whole, open, close) => open + block + close);
}

// Checking

function compareText(value, base, where, locale, sourceTag, problems) {
  const mineNames = placeholders(value);
  const theirNames = placeholders(base);
  if (mineNames.join() !== theirNames.join()) {
    problems.push(`${where}: uses {${mineNames.join("}, {")}} but English uses {${theirNames.join("}, {")}}.`);
  }
  if (tagsOf(value).join("|") !== tagsOf(base).join("|")) problems.push(`${where}: its tags differ from English (${tagsOf(base).join(" ") || "none"}).`);
  const mine = numbersIn(value, locale.tag).join(", ");
  const theirs = numbersIn(base, sourceTag).join(", ");
  if (mine !== theirs) problems.push(`${where}: has the numbers [${mine}] but English has [${theirs}]. Rules, prices and dates must match in every language.`);
  for (const sign of ["€", "%"]) {
    if (count(plain(value), sign) !== count(plain(base), sign)) problems.push(`${where}: has ${count(plain(value), sign)} "${sign}" but English has ${count(plain(base), sign)}.`);
  }
}

function compareEntry(entry, base, where, locale, sourceTag) {
  const problems = [];
  if (entry.kind !== base.kind) return [`${where}: English has a ${base.kind === "plural" ? "plural text" : "text"} here, not a ${entry.kind === "plural" ? "plural text" : entry.kind === "text" ? "text" : "value like this"}.`];
  if (entry.kind === "text") {
    if (!entry.value.trim()) return [`${where}: is empty.`];
    compareText(entry.value, base.value, where, locale, sourceTag, problems);
    return problems;
  }
  const { needed, allowed } = pluralNeeds(locale.tag);
  for (const category of needed) if (typeof entry.value[category] !== "string") problems.push(`${where}: needs a "${category}" form in ${locale.code}.`);
  for (const category of Object.keys(entry.value)) if (!allowed.includes(category)) problems.push(`${where}: "${category}" is not a plural form of ${locale.code}.`);
  const known = new Set(Object.values(base.value).flatMap(placeholders));
  const required = [...known].filter((name) => name !== "count");
  for (const [category, text] of Object.entries(entry.value)) {
    const used = placeholders(text);
    const extra = used.filter((name) => !known.has(name));
    const lacking = required.filter((name) => !used.includes(name));
    if (extra.length || lacking.length) problems.push(`${where}.${category}: uses {${used.join("}, {")}}; English uses {${[...known].join("}, {")}}.`);
    if (!text.trim()) problems.push(`${where}.${category}: is empty.`);
    if (numbersIn(text, locale.tag).join() !== numbersIn(base.value.other, sourceTag).join()) problems.push(`${where}.${category}: its numbers differ from English.`);
  }
  return problems;
}

// Checks the whole site. project: see tools/i18n-project.js. Returns errors (the check fails),
// warnings (printed) and how much of each language is translated.
export function validate(project) {
  const { locales, namespaces, source } = project;
  const errors = [...(project.problems || [])];
  const warnings = [];
  const sourceLocale = locales.find((locale) => locale.code === source);
  const sourceTag = sourceLocale ? sourceLocale.tag : "en-IE";

  // The list of languages
  const codes = new Set();
  for (const locale of locales) {
    if (codes.has(locale.code)) errors.push(`js/lib/locales.js lists ${locale.code} twice.`);
    codes.add(locale.code);
    let canonical = null;
    try {
      canonical = Intl.getCanonicalLocales(locale.tag)[0];
    } catch {
      // not a language tag
    }
    if (!/^[a-z]{2,3}$/.test(locale.code)) errors.push(`js/lib/locales.js: "${locale.code}" should be a two- or three-letter language code.`);
    if (canonical !== locale.tag) errors.push(`js/lib/locales.js: ${locale.code} has "${locale.tag}", which is not a language tag like pt-BR.`);
    if (!["complete", "draft"].includes(locale.status)) errors.push(`js/lib/locales.js: ${locale.code} has status "${locale.status}"; use "complete" or "draft".`);
    if (!locale.name) errors.push(`js/lib/locales.js: ${locale.code} needs its own name, as speakers write it.`);
    const files = project.files[locale.code] || [];
    for (const ns of files) if (!namespaces.includes(ns)) errors.push(`locales/${locale.code}/${ns}.json: "${ns}" is not in NAMESPACES in js/lib/locales.js.`);
    if (locale.status === "complete") {
      for (const ns of namespaces) if (!files.includes(ns)) errors.push(`locales/${locale.code}/${ns}.json is missing, and ${locale.code} is marked complete.`);
    }
  }
  if (!sourceLocale || sourceLocale.status !== "complete") errors.push(`js/lib/locales.js must list ${source} as complete: it is the source language.`);
  for (const folder of project.folders) if (!codes.has(folder)) errors.push(`locales/${folder}/ is not listed in js/lib/locales.js.`);

  // English, the source
  const english = new Map();
  const englishArrays = new Map();
  for (const ns of namespaces) {
    const tree = project.messages[source] && project.messages[source][ns];
    if (!tree) continue;
    const { entries, arrays } = flatten(tree, ns);
    for (const [key, entry] of entries) {
      english.set(key, entry);
      if (!KEY.test(key)) errors.push(`locales/${source}/${ns}.json: "${key}" has a name that is not letters, digits, - or _.`);
      if (entry.kind === "invalid") errors.push(`locales/${source}/${ns}.json: ${key} must be a text, a list of texts or a plural text.`);
      else if (entry.kind === "text" && !entry.value.trim()) errors.push(`locales/${source}/${ns}.json: ${key} is empty.`);
    }
    for (const [key, length] of arrays) englishArrays.set(key, length);
  }
  const englishText = (key) => (english.get(key) && english.get(key).kind === "text" ? english.get(key).value : undefined);

  // Where keys are used
  const used = new Set();
  const patterns = [];
  const moduleNamespaces = new Map();
  const nsOf = (key) => key.split(":")[0];
  const checkRef = (where, ref, allowed) => {
    used.add(ref.key);
    const entry = english.get(ref.key);
    if (!entry) return errors.push(`${where}:${ref.line}: ${ref.key} is not in locales/${source}/${nsOf(ref.key)}.json.`);
    if (!allowed.includes(nsOf(ref.key))) {
      errors.push(`${where}:${ref.line}: ${ref.key} is in the "${nsOf(ref.key)}" namespace, which is not loaded here (${allowed.join(", ") || "none"}).`);
    }
    if (ref.kind && entry.kind !== "text") errors.push(`${where}:${ref.line}: ${ref.key} is not a single text, so HTML cannot use it.`);
    else if (ref.kind && ref.kind !== "html" && /<[a-z/]/i.test(entry.value)) errors.push(`${where}:${ref.line}: ${ref.key} has tags, so use data-i18n-html.`);
  };
  const checkHtml = (file, html, allowed) => {
    for (const problem of htmlProblems(html)) errors.push(`${file} ${problem}`);
    for (const ref of htmlKeys(html)) checkRef(file, ref, allowed);
    for (const { line, text } of untranslatedText(html)) {
      errors.push(`${file}:${line}: "${text.slice(0, 70)}" is shown without a translation key. Add it to locales/${source} and mark the element with data-i18n.`);
    }
    if (stampHtml(html, englishText) !== html) errors.push(`${file}: its English text differs from locales/${source}. Run npm run i18n.`);
  };
  for (const partial of project.partials) checkHtml(partial.file, partial.html, ["common"]);
  for (const page of project.pages) {
    const declared = declaredNamespaces(page.html);
    if (!declared) {
      errors.push(`${page.file}: <html> needs data-i18n-ns="common ..." with the namespaces the page uses.`);
      continue;
    }
    for (const ns of declared) if (!namespaces.includes(ns)) errors.push(`${page.file}: data-i18n-ns lists "${ns}", which is not a namespace.`);
    if (!declared.includes("common")) errors.push(`${page.file}: data-i18n-ns must include common (the header and footer).`);
    const boot = page.html.search(/<script src="js\/i18n-boot\.js\?v=\d+"><\/script>/);
    const styles = page.html.search(/<link rel="stylesheet"/);
    if (boot < 0) errors.push(`${page.file}: the <head> must load <script src="js/i18n-boot.js?v=..."></script>.`);
    else if (styles >= 0 && boot > styles) errors.push(`${page.file}: load js/i18n-boot.js before the stylesheet, so the page never shows untranslated.`);
    checkHtml(page.file, page.html, declared);
    const module = page.html.match(/<script type="module" src="js\/pages\/([\w-]+)\.js/);
    if (module) {
      const before = moduleNamespaces.get(module[1]);
      moduleNamespaces.set(module[1], before ? before.filter((ns) => declared.includes(ns)) : declared);
    }
  }
  for (const script of project.scripts) {
    const { keys, patterns: found } = scriptKeys(script.js, namespaces);
    const name = script.file.replace(/^.*[\\/]/, "").replace(/\.js$/, "");
    if (script.dir === "lib") {
      for (const ref of [...keys, ...found]) errors.push(`${script.file}:${ref.line}: lib/ modules are pure, so they cannot use texts (${ref.key}). Return a code and let the page translate it.`);
      continue;
    }
    const allowed = script.dir === "pages" ? moduleNamespaces.get(name) || [] : ["common"];
    for (const ref of keys) checkRef(script.file, ref, allowed);
    for (const pattern of found) {
      patterns.push(pattern);
      if (!allowed.includes(nsOf(pattern.key))) errors.push(`${script.file}:${pattern.line}: ${pattern.key} is in a namespace not loaded here.`);
      if (![...english.keys()].some((key) => pattern.regex.test(key))) errors.push(`${script.file}:${pattern.line}: no key in locales/${source} matches ${pattern.key}.`);
    }
    for (const { line, text } of hardcodedStrings(script.js)) {
      errors.push(`${script.file}:${line}: "${text.slice(0, 70)}" looks like text for readers. Put it in locales/${source} and use t().`);
    }
  }
  for (const key of english.keys()) {
    if (!used.has(key) && !patterns.some((pattern) => pattern.regex.test(key))) {
      errors.push(`locales/${source}/${nsOf(key)}.json: ${key} is not used by any page or script. Use it or remove it.`);
    }
  }

  // The runtime's copy of the language list
  if (project.boot) {
    try {
      const expected = stampBoot(project.boot.text, generatedBlock(locales, project.files, project.version));
      if (expected !== project.boot.text) errors.push(`${project.boot.file}: its language list or text version is out of date. Run npm run i18n.`);
    } catch (err) {
      errors.push(err.message);
    }
  }

  // Every language, English included
  const coverage = [];
  for (const locale of locales) {
    const seen = new Set();
    let translated = 0;
    for (const ns of namespaces) {
      const tree = project.messages[locale.code] && project.messages[locale.code][ns];
      if (!tree) continue;
      const { entries, arrays } = flatten(tree, ns);
      for (const [key, entry] of entries) {
        const where = `locales/${locale.code}/${ns}.json: ${key}`;
        for (const text of entry.kind === "text" ? [entry.value] : entry.kind === "plural" ? Object.values(entry.value) : []) {
          for (const [char, label] of Object.entries(FORBIDDEN)) if (text.includes(char)) errors.push(`${where}: contains ${label}; the house style uses a hyphen, "about" or three dots.`);
        }
        if (locale.code === source) continue;
        seen.add(key);
        const base = english.get(key);
        if (!base) {
          errors.push(`${where} is not in English. Remove it, or add it to locales/${source} first.`);
          continue;
        }
        const problems = compareEntry(entry, base, where, locale, sourceTag);
        errors.push(...problems);
        if (!problems.length) translated += 1;
        if (entry.kind === "text" && entry.value === base.value && words(base.value) >= 5) warnings.push(`${where}: is the same as English. Is it translated?`);
      }
      if (locale.code === source) continue;
      for (const [key, length] of arrays) {
        if (englishArrays.has(key) && englishArrays.get(key) !== length) errors.push(`locales/${locale.code}/${ns}.json: ${key} has ${length} items, English has ${englishArrays.get(key)}.`);
      }
    }
    if (locale.code === source) {
      coverage.push({ code: locale.code, name: locale.name, status: "source", translated: english.size, total: english.size });
      continue;
    }
    const missing = [...english.keys()].filter((key) => !seen.has(key));
    if (locale.status === "complete" && missing.length) {
      errors.push(`${locale.code} is marked complete, but ${missing.length} texts are not translated: ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? ", ..." : ""}. Translate them, or mark ${locale.code} as a draft.`);
    }
    coverage.push({ code: locale.code, name: locale.name, status: locale.status, translated, total: english.size });
  }
  return { errors, warnings, coverage };
}
