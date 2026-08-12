import fs from "node:fs/promises";
import path from "node:path";
import { importMarkdownFile } from "../src/domain/content/import-from-file";

async function main() {
  const itemsDir = path.resolve(process.cwd(), "content/items/no-beta-v1/banco-operacional-previo");
  const entries = await fs.readdir(itemsDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subdir = path.join(itemsDir, entry.name);
      const subfiles = await fs.readdir(subdir);
      for (const subfile of subfiles) {
        if (subfile.endsWith(".md")) {
          files.push(path.join(subdir, subfile));
        }
      }
    }
  }

  const results = [];
  for (const file of files) {
    const result = await importMarkdownFile(file);
    results.push(result);
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
