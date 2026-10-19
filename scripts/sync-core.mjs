/**
 * Copy the shared timeline core (src/core in mission-timeline, the backend) into this repo's core
 * folder, so the pages here use exactly the same time, model and timeline logic as the API and the
 * other apps.
 *
 *   npm run sync-core                       from GitHub (kevinlinit/mission-timeline, main)
 *   npm run sync-core -- ../mission-timeline  from a local checkout
 *   npm run sync-core -- --check            exit 1 if the copy here differs from GitHub's main
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DEST = join(ROOT, process.env.CORE_DIR || "core");
const REPO = "kevinlinit/mission-timeline";
const args = process.argv.slice(2);
const check = args.includes("--check");
const local = args.find((a) => !a.startsWith("--"));

async function fromGitHub() {
  const head = await (await fetch(`https://api.github.com/repos/${REPO}/commits/main`)).json();
  const list = await (await fetch(`https://api.github.com/repos/${REPO}/contents/src/core?ref=${head.sha}`)).json();
  if (!Array.isArray(list)) throw new Error(`Couldn't list ${REPO}/src/core: ${JSON.stringify(list).slice(0, 200)}`);
  const files = {};
  for (const f of list.filter((x) => x.name.endsWith(".js"))) files[f.name] = await (await fetch(f.download_url)).text();
  return { files, version: `${REPO}@${head.sha.slice(0, 7)}` };
}

async function fromDir(dir) {
  const src = join(resolve(dir), "src", "core");
  const files = {};
  for (const name of (await readdir(src)).filter((n) => n.endsWith(".js"))) files[name] = await readFile(join(src, name), "utf8");
  return { files, version: `${REPO}@local` };
}

const { files, version } = local ? await fromDir(local) : await fromGitHub();
if (check) {
  const differ = [];
  for (const [name, text] of Object.entries(files)) {
    const here = await readFile(join(DEST, name), "utf8").catch(() => null);
    if (here !== text) differ.push(name);
  }
  if (differ.length) {
    console.log(`core/ differs from ${version}: ${differ.join(", ")}. Run npm run sync-core.`);
    process.exit(1);
  }
  console.log(`core/ matches ${version}.`);
} else {
  await mkdir(DEST, { recursive: true });
  for (const [name, text] of Object.entries(files)) await writeFile(join(DEST, name), text);
  await writeFile(join(DEST, "VERSION"), version + "\n");
  console.log(`Copied ${Object.keys(files).length} files from ${version} into ${DEST}.`);
}
