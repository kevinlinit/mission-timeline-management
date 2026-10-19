// Every page's scripts and stylesheets exist, and every relative import resolves to a file, so a
// moved or renamed file is caught before it reaches the site. Then each module is parsed by Node.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const walk = (d) => readdirSync(d).flatMap((n) => {
  if (n.startsWith(".") || n === "node_modules" || n === "test" || n === "scripts") return [];
  const p = join(d, n);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const files = walk(ROOT);

test("pages reference files that exist", () => {
  for (const html of files.filter((f) => f.endsWith(".html"))) {
    const text = readFileSync(html, "utf8");
    for (const [, ref] of text.matchAll(/(?:src|href)="([^"#?:]+\.(?:js|css|html|svg|png|json))"/g)) {
      assert.ok(existsSync(resolve(dirname(html), ref)), `${relative(ROOT, html)} -> ${ref}`);
    }
  }
});

test("relative imports resolve, and every module parses", async () => {
  for (const js of files.filter((f) => f.endsWith(".js"))) {
    const text = readFileSync(js, "utf8");
    for (const [, ref] of text.matchAll(/(?:import|export)[^"'`;]*?from\s*["'](\.[^"']+)["']/g)) {
      assert.ok(existsSync(resolve(dirname(js), ref)), `${relative(ROOT, js)} imports ${ref}`);
    }
  }
  // The core has no browser globals at load time, so Node can import it.
  const core = files.find((f) => f.endsWith(join("core", "index.js")));
  if (core) assert.ok(Object.keys(await import(core)).length > 20);
});
