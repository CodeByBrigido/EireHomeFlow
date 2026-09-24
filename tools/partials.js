// Copies partials/header.html and footer.html into every page, so the header is in the HTML
// from the first frame instead of arriving by fetch() a moment later (which made pages jump).
// The partials stay the single source: edit them, then run npm run partials.
// See specs/02-TRD.md, section 4.1.

const NOTE = "edit that file, then run npm run partials";
// An empty <div data-include="..."> slot, or a copy stamped earlier between markers.
const SLOT = new RegExp(
  String.raw`^([ \t]*)(?:<div data-include="([^"]+)"><\/div>|<!-- include (\S+): ${NOTE} -->\n[\s\S]*?^[ \t]*<!-- \/include -->)[ \t]*$`,
  "gm",
);

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// read(path) returns a partial's text (path relative to docs/), or undefined if there is none.
// Pages come out with LF line endings, like the rest of the repository (.gitattributes).
export function stampPartials(html, read) {
  const source = html.replace(/\r\n/g, "\n");
  const page = (source.match(/<body[^>]*\bdata-page="([^"]+)"/) || [])[1];
  const out = source.replace(SLOT, (whole, indent, slotPath, stampedPath) => {
    const path = slotPath || stampedPath;
    const text = read(path);
    if (text === undefined) throw new Error(`Partial not found: ${path}`);
    // The page's own nav link starts active, so the header never flickers to its active state.
    const own = page
      ? text.replace(new RegExp(`class="nav__link"([^>]*\\bdata-page="${escapeRegExp(page)}")`), 'class="nav__link is-active" aria-current="page"$1')
      : text;
    const lines = own.replace(/\r/g, "").replace(/\n+$/, "").split("\n").map((line) => (line ? indent + line : ""));
    return [`${indent}<!-- include ${path}: ${NOTE} -->`, ...lines, `${indent}<!-- /include -->`].join("\n");
  });
  // Anything the patterns above did not match would ship as a page without its header or footer.
  if (/data-include=/.test(out)) throw new Error('A data-include slot was not stamped: write it on its own line as <div data-include="partials/<file>.html"></div>.');
  const opened = (out.match(/<!-- include /g) || []).length;
  const closed = (out.match(/<!-- \/include -->/g) || []).length;
  if (opened !== closed) throw new Error("An include block is missing its <!-- /include --> marker.");
  return out;
}
