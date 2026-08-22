import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const canonicalOrigin = "https://ganaconmerito.com";
const retiredHost = ["cnsc", "profemarlon", "com"].join(".");

async function collectFiles(relativePath: string): Promise<string[]> {
  const absolutePath = path.join(root, relativePath);
  const entries = await readdir(absolutePath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(child));
    } else if (/\.(?:js|mjs|ts)$/.test(entry.name)) {
      files.push(child);
    }
  }

  return files;
}

test("runtime and test defaults use the canonical production domain", async () => {
  const checkedFiles = [
    "playwright.config.ts",
    ".env.example",
    ...await collectFiles("scripts"),
    ...await collectFiles("tests"),
  ];
  const violations: string[] = [];

  for (const file of checkedFiles) {
    const contents = await readFile(path.join(root, file), "utf8");
    if (contents.includes(retiredHost)) {
      violations.push(file);
    }
  }

  assert.deepEqual(violations, [], `Retired runtime host found in: ${violations.join(", ")}`);

  const playwrightConfig = await readFile(path.join(root, "playwright.config.ts"), "utf8");
  assert.match(playwrightConfig, new RegExp(canonicalOrigin.replaceAll(".", "\\.")));
});
