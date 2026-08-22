import fs from "node:fs/promises";
import path from "node:path";
import { v4ItemSchema } from "../src/domain/content/v4-contract";

async function jsonFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await jsonFiles(target));
    else if (entry.isFile() && entry.name.endsWith(".json")) files.push(target);
  }
  return files.sort();
}

async function main() {
  const root = process.cwd();
  const base = path.join(root, "content/question-bank-v4");
  const [itemPaths, domain, topics, competencies, types] = await Promise.all([
    jsonFiles(path.join(base, "items")),
    fs.readFile(path.join(base, "taxonomy/domains.json"), "utf8").then(JSON.parse) as Promise<string[]>,
    fs.readFile(path.join(base, "taxonomy/topics.json"), "utf8").then(JSON.parse) as Promise<string[]>,
    fs.readFile(path.join(base, "taxonomy/competencies.json"), "utf8").then(JSON.parse) as Promise<string[]>,
    fs.readFile(path.join(base, "taxonomy/question-types.json"), "utf8").then(JSON.parse) as Promise<{ questionTypes: string[]; cognitiveLevels: string[] }> ,
  ]);
  const ids = new Set<string>();
  const errors: Array<{ file: string; issues: string[] }> = [];
  for (const file of itemPaths) {
    const relative = path.relative(root, file);
    try {
      const item = v4ItemSchema.parse(JSON.parse(await fs.readFile(file, "utf8")));
      const issues: string[] = [];
      if (ids.has(item.id)) issues.push(`id duplicado: ${item.id}`);
      ids.add(item.id);
      if (!domain.includes(item.domain)) issues.push(`domain fuera de catálogo: ${item.domain}`);
      if (!topics.includes(item.topic)) issues.push(`topic fuera de catálogo: ${item.topic}`);
      if (!competencies.includes(item.competency)) issues.push(`competency fuera de catálogo: ${item.competency}`);
      if (!types.questionTypes.includes(item.questionType)) issues.push(`questionType fuera de catálogo: ${item.questionType}`);
      if (!types.cognitiveLevels.includes(item.cognitiveLevel)) issues.push(`cognitiveLevel fuera de catálogo: ${item.cognitiveLevel}`);
      if (issues.length) errors.push({ file: relative, issues });
    } catch (error) {
      errors.push({ file: relative, issues: error instanceof Error ? [error.message] : [String(error)] });
    }
  }
  console.log(JSON.stringify({ bank: "v4", validatedFiles: itemPaths.length, valid: errors.length === 0, errors }, null, 2));
  if (errors.length) process.exit(1);
}
main().catch((error) => { console.error(error); process.exit(1); });
