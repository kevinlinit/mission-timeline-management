/**
 * A small static server for working on this site locally, with no dependencies:
 *
 *   npm start                                       http://127.0.0.1:5173
 *   SERVER_URL=http://127.0.0.1:8080 npm start      sign-in and the studio against a local backend
 *   API_URL=http://127.0.0.1:8080/ npm start        published missions from a local backend
 *
 * When API_URL or SERVER_URL is set, config.js is served with those values instead of the file's.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PORT = Number(process.env.PORT) || 5173;
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json" };
const CONFIGS = ["config.js"];

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path.endsWith("/")) path += "index.html";
  const file = resolve(ROOT, "." + path);
  if (!file.startsWith(ROOT + sep)) return res.writeHead(403).end();
  try {
    let body = await readFile((await stat(file)).isDirectory() ? join(file, "index.html") : file);
    const rel = file.slice(ROOT.length + 1);
    if (CONFIGS.includes(rel) && (process.env.API_URL || process.env.SERVER_URL)) {
      body = Buffer.from(body.toString()
        .replace(/export const API_URL = .*;/, (m) => (process.env.API_URL ? `export const API_URL = ${JSON.stringify(process.env.API_URL)};` : m))
        .replace(/export const SERVER_URL = .*;/, (m) => (process.env.SERVER_URL ? `export const SERVER_URL = ${JSON.stringify(process.env.SERVER_URL)};` : m)));
    }
    res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" }).end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found\n");
  }
}).listen(PORT, "127.0.0.1", () => console.log(`http://127.0.0.1:${PORT}`));
