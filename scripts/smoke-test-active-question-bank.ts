import fs from "node:fs/promises";
import path from "node:path";
import { parseMarkdownItem } from "../src/domain/content/parse-md";
import { parseBetaJsonItem } from "../src/domain/content/parse-beta-json";
import { CURRENT_QUESTION_BANK_FILES, EXPECTED_ACTIVE_CORPUS_COUNT } from "./question-bank-current-corpus";

type CheckStatus = "passed" | "failed";

type Check = {
  name: string;
  status: CheckStatus;
  details: string;
};

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function pushCheck(checks: Check[], errors: string[], name: string, condition: boolean, details: string) {
  checks.push({ name, status: condition ? "passed" : "failed", details });
  if (!condition) {
    errors.push(`${name}: ${details}`);
  }
}

async function main() {
  const repoRoot = process.cwd();
  const checks: Check[] = [];
  const errors: string[] = [];
  const warnings: Array<{ file: string; warnings: string[] }> = [];
  const activeItems: Array<{ contentId: string; slug: string; optionCount: number; file: string }> = [];
  const idToFiles = new Map<string, string[]>();
  const slugToFiles = new Map<string, string[]>();

  for (const relativeFile of CURRENT_QUESTION_BANK_FILES) {
    const absoluteFile = path.join(repoRoot, relativeFile);
    const rawContent = await fs.readFile(absoluteFile, "utf8");
    const result = path.extname(absoluteFile) === ".json" ? parseBetaJsonItem(rawContent) : parseMarkdownItem(rawContent);

    if (result.warnings.length > 0) {
      warnings.push({ file: relativeFile, warnings: result.warnings });
    }

    if (!result.ok || !result.item) {
      errors.push(`${relativeFile}: ${result.errors.join(" | ")}`);
      continue;
    }

    activeItems.push({
      contentId: result.item.id,
      slug: result.item.slug,
      optionCount: result.item.options.length,
      file: relativeFile,
    });

    idToFiles.set(result.item.id, [...(idToFiles.get(result.item.id) ?? []), relativeFile]);
    slugToFiles.set(result.item.slug, [...(slugToFiles.get(result.item.slug) ?? []), relativeFile]);
  }

  const duplicatedIds = [...idToFiles.entries()].filter(([, files]) => files.length > 1);
  const duplicatedSlugs = [...slugToFiles.entries()].filter(([, files]) => files.length > 1);
  const nonFourOptionItems = activeItems.filter((item) => item.optionCount !== 4);
  const activeIds = new Set(activeItems.map((item) => item.contentId));
  const activeSlugs = new Set(activeItems.map((item) => item.slug));

  pushCheck(
    checks,
    errors,
    "expected-active-count",
    activeItems.length === EXPECTED_ACTIVE_CORPUS_COUNT,
    `esperados ${EXPECTED_ACTIVE_CORPUS_COUNT}, encontrados ${activeItems.length}`,
  );

  pushCheck(
    checks,
    errors,
    "unique-content-id",
    duplicatedIds.length === 0,
    duplicatedIds.length === 0
      ? `${activeIds.size} content_id únicos`
      : `duplicados: ${duplicatedIds.map(([id, files]) => `${id} -> ${files.join(", ")}`).join("; ")}`,
  );

  pushCheck(
    checks,
    errors,
    "unique-slug",
    duplicatedSlugs.length === 0,
    duplicatedSlugs.length === 0
      ? `${activeSlugs.size} slugs únicos`
      : `duplicados: ${duplicatedSlugs.map(([slug, files]) => `${slug} -> ${files.join(", ")}`).join("; ")}`,
  );

  pushCheck(
    checks,
    errors,
    "four-options-per-active-item",
    nonFourOptionItems.length === 0,
    nonFourOptionItems.length === 0
      ? `${activeItems.length} ítems activos con 4 opciones`
      : `fallan: ${nonFourOptionItems.map((item) => `${item.contentId} (${item.optionCount})`).join(", ")}`,
  );

  const result = {
    summary: {
      expectedActiveCorpusCount: EXPECTED_ACTIVE_CORPUS_COUNT,
      activeCorpusCount: activeItems.length,
      warningCount: warnings.length,
      errorCount: errors.length,
    },
    checks,
    warnings,
    activeItems,
    errors,
  };

  console.log(JSON.stringify(result, null, 2));

  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
