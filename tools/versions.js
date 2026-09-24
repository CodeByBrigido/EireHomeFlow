// Helpers for the ?v= numbers that make browsers fetch new CSS and JS after a change
// (GitHub Pages caches files for 10 minutes). See specs/02-TRD.md, section 10.
import { readdirSync } from "node:fs";
import { join } from "node:path";

const VERSION = /\?v=(\d{8})/g;

// Every HTML page and script of the site: the files that carry ?v= numbers.
export function siteFiles(root = "docs") {
  return readdirSync(root, { recursive: true })
    .map((name) => join(root, name))
    .filter((path) => /\.(html|js)$/.test(path));
}

export const findVersions = (text) => [...text.matchAll(VERSION)].map((m) => m[1]);

// Local scripts and stylesheets loaded without ?v=. They could come from an older cache,
// and a module imported with and without ?v= runs twice, with two separate states.
export function unversionedRefs(text) {
  const refs = [];
  for (const m of text.matchAll(/(?:\bfrom|\bimport)\s*\(?\s*["'](\.{1,2}\/[^"'?]+)["']/g)) refs.push(m[1]);
  for (const m of text.matchAll(/\b(?:src|href)="((?:js|css)\/[^"?]+\.(?:js|css))"/g)) refs.push(m[1]);
  return refs;
}

export const bumpText = (text, version) => text.replace(VERSION, "?v=" + version);

export const today = () => new Date().toISOString().slice(0, 10).replaceAll("-", "");
