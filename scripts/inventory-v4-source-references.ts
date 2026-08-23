import fs from "node:fs/promises";
import path from "node:path";

type ItemSource = {
  reference?: unknown;
  url?: unknown;
};

type V4Item = {
  id?: unknown;
  source?: ItemSource | null;
};

type SourceUsage = {
  reference: string;
  urls: string[];
  itemCount: number;
  itemIds: string[];
};

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

function normalizeReference(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

async function main() {
  const root = process.cwd();
  const itemsRoot = path.join(root, "content/question-bank-v4/items");
  const files = await jsonFiles(itemsRoot);
  const usages = new Map<string, { urls: Set<string>; itemIds: string[] }>();
  const errors: Array<{ file: string; issue: string }> = [];

  for (const file of files) {
    const relative = path.relative(root, file);
    try {
      const item = JSON.parse(await fs.readFile(file, "utf8")) as V4Item;
      if (typeof item.id !== "string" || !item.id.trim()) {
        errors.push({ file: relative, issue: "item.id ausente o inválido" });
        continue;
      }
      if (!item.source || typeof item.source.reference !== "string" || !item.source.reference.trim()) {
        errors.push({ file: relative, issue: "source.reference ausente o inválido" });
        continue;
      }

      const reference = normalizeReference(item.source.reference);
      const usage = usages.get(reference) ?? { urls: new Set<string>(), itemIds: [] };
      usage.itemIds.push(item.id);
      if (typeof item.source.url === "string" && item.source.url.trim()) {
        usage.urls.add(item.source.url.trim());
      }
      usages.set(reference, usage);
    } catch (error) {
      errors.push({
        file: relative,
        issue: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const references: SourceUsage[] = [...usages.entries()]
    .map(([reference, usage]) => ({
      reference,
      urls: [...usage.urls].sort(),
      itemCount: usage.itemIds.length,
      itemIds: usage.itemIds.sort(),
    }))
    .sort((a, b) => a.reference.localeCompare(b.reference, "es"));

  const output = {
    schemaVersion: 1,
    bank: "question-bank-v4",
    scannedItems: files.length,
    uniqueReferences: references.length,
    references,
    errors,
  };

  console.log(JSON.stringify(output, null, 2));
  if (errors.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
