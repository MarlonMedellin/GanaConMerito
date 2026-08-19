import fs from "node:fs/promises";
import path from "node:path";
import { importMarkdownFile } from "../src/domain/content/import-from-file";

async function collectMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectMarkdownFiles(entryPath));
    else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".json"))) {
      if (entry.name !== "README.md") files.push(entryPath);
    }
  }

  return files;
}

async function main() {
  const itemsDir = path.resolve(process.cwd(), "content/items/beta-v1");
  const files = await collectMarkdownFiles(itemsDir);

  const results = [];
  for (const file of files) {
    const sourcePath = path.relative(process.cwd(), file).split(path.sep).join("/");
    const result = await importMarkdownFile(file, sourcePath);
    results.push(result);
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
