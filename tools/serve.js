// Local web server for the site in docs/: npm start, then open http://localhost:8000/.
// The site needs http (partials and steps are fetched), and ES modules need the
// text/javascript type, which some Python installs on Windows get wrong.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

const ROOT = resolve("docs");
const PORT = Number(process.env.PORT) || 8000;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};
// Fonts and images never change while you work, so the browser keeps them (as GitHub Pages
// lets it). Without this, every click re-downloads the font and the text flashes in a fallback.
// Pages, styles and scripts are checked on every load (a cheap 304), so edits show at once.
const KEPT = new Set([".woff2", ".png", ".webp", ".svg"]);

const server = createServer(async (req, res) => {
  let path;
  try {
    path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }).end("Bad request");
    return;
  }
  let file = normalize(join(ROOT, path));
  if (file !== ROOT && !file.startsWith(ROOT + sep)) {
    res.writeHead(403).end();
    return;
  }
  if (path.endsWith("/")) file = join(file, "index.html");
  try {
    const { mtime } = await stat(file);
    const lastModified = mtime.toUTCString();
    const headers = {
      "Content-Type": TYPES[extname(file)] || "application/octet-stream",
      "Cache-Control": KEPT.has(extname(file)) ? "max-age=3600" : "no-cache",
      "Last-Modified": lastModified,
    };
    // Last-Modified has whole seconds, so compare at that precision.
    if (Date.parse(req.headers["if-modified-since"]) >= Date.parse(lastModified)) {
      res.writeHead(304, headers).end();
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, headers);
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found: " + path);
  }
}).listen(PORT, () => console.log(`ÉireHome Flow on http://localhost:${PORT}/`));

server.on("error", (err) => {
  console.error(err.code === "EADDRINUSE" ? `Port ${PORT} is in use. Stop the other server, or run with PORT=8001.` : err.message);
  process.exit(1);
});
