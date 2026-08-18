import fs from "node:fs/promises";
import path from "node:path";
import { parseMarkdownItem } from "../src/domain/content/parse-md";
import { parseBetaJsonItem } from "../src/domain/content/parse-beta-json";
import { CURRENT_QUESTION_BANK_FILES } from "./question-bank-current-corpus";
import { normalizeLegacyItemToRichItem } from "../src/domain/taxonomy/normalize-item";
import { validateRichItemEditorial } from "../src/domain/taxonomy/validators";

async function listAllItemFiles(itemsDir: string) {
  const corpusDir = path.join(itemsDir, "beta-v1");
  const areaDirs = await fs.readdir(corpusDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of areaDirs) {
    if (!entry.isDirectory()) {
      continue;
    }

    const subdir = path.join(corpusDir, entry.name);
    const subfiles = await fs.readdir(subdir, { withFileTypes: true });

    for (const subfile of subfiles) {
      if (subfile.isFile() && subfile.name.endsWith(".json")) {
        files.push(path.join(subdir, subfile.name));
      }
    }
  }

  return files.sort();
}

async function main() {
  const includeAll = process.argv.includes("--all");
  const repoRoot = process.cwd();
  const itemsDir = path.join(repoRoot, "content/items");

  const selectedFiles = includeAll
    ? await listAllItemFiles(itemsDir)
    : CURRENT_QUESTION_BANK_FILES.map((file) => path.join(repoRoot, file));

  const idToFiles = new Map<string, string[]>();
  const slugToFiles = new Map<string, string[]>();
  const warnings: Array<{ file: string; warnings: string[] }> = [];
  const errors: Array<{ file: string; errors: string[] }> = [];
  const editorial: Array<{ file: string; status: "apt" | "apt_with_warnings" | "rejected"; issues: string[] }> = [];
  const missingByField = new Map<string, number>();
  const coverageTaxonomy = new Map<string, number>();
  const coverageTargetPosition = new Map<string, number>();
  const coverageTagCategory = new Map<string, number>();

  for (const filePath of selectedFiles) {
    const rawContent = await fs.readFile(filePath, "utf8");
    const result = path.extname(filePath) === ".json" ? parseBetaJsonItem(rawContent) : parseMarkdownItem(rawContent);
    const relativePath = path.relative(repoRoot, filePath);

    if (result.warnings.length > 0) {
      warnings.push({ file: relativePath, warnings: result.warnings });
    }

    if (!result.ok || !result.item) {
      errors.push({ file: relativePath, errors: result.errors });
      continue;
    }

    idToFiles.set(result.item.id, [...(idToFiles.get(result.item.id) ?? []), relativePath]);
    slugToFiles.set(result.item.slug, [...(slugToFiles.get(result.item.slug) ?? []), relativePath]);

    const normalized = normalizeLegacyItemToRichItem({
      id: result.item.id,
      slug: result.item.slug,
      version: result.item.version,
      area: result.item.area,
      subarea: result.item.subarea,
      competency: result.item.competency,
      tipo_item: result.item.itemType,
      targetRole: result.item.targetRole,
      targetPosition: result.item.targetPosition,
      applicantProfile: result.item.applicantProfile,
      stem: result.item.stem,
      tags: result.item.tags,
    });

    for (const miss of normalized.missingTaxonomy) {
      missingByField.set(miss, (missingByField.get(miss) ?? 0) + 1);
    }

    const issues = validateRichItemEditorial({
      id: normalized.id,
      taxonomy: normalized.sourceTaxonomy,
      tags: normalized.tags,
      looseTags: result.item.tags,
      targetPosition: result.item.targetPosition,
      targetRole: result.item.targetRole,
      technicalRisks: normalized.technicalRisks,
      distractorRationales: normalized.distractorRationales,
    });

    const hasErrors = issues.some((issue) => issue.severity === "error");
    const hasWarnings = normalized.governanceWarnings.length > 0 || issues.some((issue) => issue.severity === "warning");

    editorial.push({
      file: relativePath,
      status: hasErrors ? "rejected" : hasWarnings ? "apt_with_warnings" : "apt",
      issues: [
        ...issues.map((issue) => `${issue.type}:${issue.field}`),
        ...normalized.governanceWarnings.map((warning) => `governance_warning:${warning}`),
      ],
    });

    const area = normalized.sourceTaxonomy.area ?? normalized.taxonomy.area ?? "missing";
    const subarea = normalized.sourceTaxonomy.subarea ?? normalized.taxonomy.subarea ?? "missing";
    const competency = normalized.sourceTaxonomy.competency ?? normalized.taxonomy.competency ?? "missing";
    const coverageKey = `${area}/${subarea}/${competency}`;
    coverageTaxonomy.set(coverageKey, (coverageTaxonomy.get(coverageKey) ?? 0) + 1);

    const targetPosition = normalized.sourceTaxonomy.targetPosition ?? normalized.taxonomy.targetPosition ?? "missing";
    coverageTargetPosition.set(targetPosition, (coverageTargetPosition.get(targetPosition) ?? 0) + 1);

    for (const category of Object.keys(normalized.tags)) {
      const count = normalized.tags[category as keyof typeof normalized.tags].length;
      if (count > 0) {
        coverageTagCategory.set(category, (coverageTagCategory.get(category) ?? 0) + count);
      }
    }
  }

  for (const [id, files] of idToFiles.entries()) {
    if (files.length > 1) {
      errors.push({ file: files.join(", "), errors: [`id duplicado detectado: ${id}`] });
    }
  }

  for (const [slug, files] of slugToFiles.entries()) {
    if (files.length > 1) {
      errors.push({ file: files.join(", "), errors: [`slug duplicado detectado: ${slug}`] });
    }
  }

  const summary = {
    scope: includeAll ? "all" : "current-corpus",
    validatedFiles: selectedFiles.length,
    warningCount: warnings.length,
    errorCount: errors.length,
    editorial: {
      apt: editorial.filter((entry) => entry.status === "apt").length,
      aptWithWarnings: editorial.filter((entry) => entry.status === "apt_with_warnings").length,
      rejected: editorial.filter((entry) => entry.status === "rejected").length,
      missingByField: Object.fromEntries(missingByField.entries()),
      coverageByAreaSubareaCompetency: Object.fromEntries(coverageTaxonomy.entries()),
      coverageByTargetPosition: Object.fromEntries(coverageTargetPosition.entries()),
      coverageByTagCategory: Object.fromEntries(coverageTagCategory.entries()),
    },
  };

  console.log(JSON.stringify({ summary, warnings, errors, editorial }, null, 2));

  if (errors.length > 0 || summary.editorial.rejected > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
