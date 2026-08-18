import fs from "node:fs";
import path from "node:path";

const ACTIVE_BETA_DIR = path.join(process.cwd(), "content/items/beta-v1");

function listJsonFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listJsonFiles(absolutePath));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(path.relative(process.cwd(), absolutePath).replaceAll(path.sep, "/"));
    }
  }

  return files.sort();
}

export const CURRENT_QUESTION_BANK_FILES = listJsonFiles(ACTIVE_BETA_DIR);

export const EXPECTED_ACTIVE_CORPUS_COUNT = 100;
