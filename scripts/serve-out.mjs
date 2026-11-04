// Backup server for the built site: `npm run build` then `npm run serve:backup`.
// Pass --no-wasm to answer 404 for engine.wasm, which rehearses the JS-fallback path.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const ROOT = join(process.cwd(), "out");
const PORT = Number(process.env.PORT ?? 8080);
const noWasm = process.argv.includes("--no-wasm");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".wasm": "application/wasm",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};

if (!existsSync(ROOT)) {
  console.error("No out/ folder. Run `npm run build` first.");
  process.exit(1);
}

createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
  let file = normalize(join(ROOT, urlPath === "/" ? "index.html" : urlPath));
  if (!file.startsWith(ROOT) || (noWasm && file.endsWith(".wasm"))) {
    res.writeHead(404).end("not found");
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`Serving out/ at http://localhost:${PORT}${noWasm ? "  (wasm blocked: testing the JS fallback)" : ""}`);
});
