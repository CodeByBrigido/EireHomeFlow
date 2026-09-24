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

// read(path) returns a partial's text (path relative to docs/), or undefined if there is none.
export function stampPartials(html, read) {
  const page = (html.match(/<body[^>]*\bdata-page="([^"]+)"/) || [])[1];
  return html.replace(SLOT, (whole, indent, slotPath, stampedPath) => {
    const path = slotPath || stampedPath;
    const text = read(path);
    if (text === undefined) throw new Error(`Partial not found: ${path}`);
    // The page's own nav link starts active, so the header never flickers to its active state.
    const own = page ? text.replace(new RegExp(`class="nav__link"([^>]*\\bdata-page="${page}")`), 'class="nav__link is-active" aria-current="page"$1') : text;
    const lines = own.replace(/\r/g, "").replace(/\n+$/, "").split("\n").map((line) => (line ? indent + line : ""));
    return [`${indent}<!-- include ${path}: ${NOTE} -->`, ...lines, `${indent}<!-- /include -->`].join("\n");
  });
}
