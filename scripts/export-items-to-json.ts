/**
 * export-items-to-json.ts
 *
 * Conversor canónico: Markdown (content/items/*.md) → JSON derivado estructurado.
 *
 * POLÍTICA DE GOBERNANZA:
 *   - La fuente canónica SIEMPRE es Markdown en `content/items/`.
 *   - El JSON producido es un ARTEFACTO DERIVADO para procesos específicos
 *     (auditoría, analítica, integraciones externas, QA, etc.).
 *   - Este script NO modifica ni sustituye el canon Markdown.
 *   - Schema derivado: derived-json-schema-v1 (ver docs/database/derived-json-schema-v1.md)
 *
 * Uso:
 *   npx tsx scripts/export-items-to-json.ts [opciones]
 *
 * Opciones:
 *   --all                  Exportar todos los ítems de content/items/
 *   --current-corpus       Exportar solo el corpus activo (default)
 *   --out-dir <ruta>       Directorio de salida (default: content/exports/json)
 *   --pretty               JSON formateado con indentación (default: true)
 *   --fail-on-warning      Salir con código 1 si hay warnings (default: false)
 *   --check                Solo verificar consistencia, no escribir archivos
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { parseMarkdownItem } from "../src/domain/content/parse-md";
import { CURRENT_QUESTION_BANK_FILES } from "./question-bank-current-corpus";

// ─── Constantes ───────────────────────────────────────────────────────────────

const EXPORTER_VERSION = "1.0.0";
const DERIVED_SCHEMA_VERSION = "derived-json-schema-v1";
const DEFAULT_OUT_DIR = "content/exports/json";

// ─── Tipos del schema derivado ────────────────────────────────────────────────

interface DerivedJsonOption {
  key: string;
  text: string;
}

interface DerivedJsonItem {
  /** Schema derivado — no es fuente canónica */
  _schema: string;
  _exported_at: string;
  _exporter_version: string;
  _source_file: string;
  _source_hash: string;

  // Identidad
  id: string;
  slug: string;
  title: string;
  version: number;
  published: boolean;

  // Taxonomía canónica
  area: string;
  subarea: string | null;
  examType: string;
  competency: string;
  difficulty: number;
  targetLevel: string | null;
  targetRole: string | null;
  targetPosition: string | null;
  applicantProfile: string | null;
  itemType: string;
  normativeRefs: string[];
  tags: string[];

  // Contenido
  stem: string;
  options: DerivedJsonOption[];
  correctOption: string;
  explanation: string;
}

interface ExportResult {
  file: string;
  outFile: string;
  status: "ok" | "error" | "warning";
  messages: string[];
}

interface ExportSummary {
  schema: string;
  scope: string;
  exportedAt: string;
  exporterVersion: string;
  totalFiles: number;
  exported: number;
  errors: number;
  warnings: number;
  outDir: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sha256(content: string): string {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

async function listAllItemFiles(itemsDir: string): Promise<string[]> {
  const entries = await fs.readdir(itemsDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const subdir = path.join(itemsDir, entry.name);
    const subfiles = await fs.readdir(subdir, { withFileTypes: true });
    for (const sub of subfiles) {
      if (sub.isFile() && sub.name.endsWith(".md")) {
        files.push(path.join(subdir, sub.name));
      }
    }
  }

  return files.sort();
}

function buildDerivedItem(
  item: NonNullable<ReturnType<typeof parseMarkdownItem>["item"]>,
  sourceFile: string,
  sourceContent: string,
  repoRoot: string,
): DerivedJsonItem {
  const relSource = path.relative(repoRoot, sourceFile);
  return {
    _schema: DERIVED_SCHEMA_VERSION,
    _exported_at: new Date().toISOString(),
    _exporter_version: EXPORTER_VERSION,
    _source_file: relSource,
    _source_hash: sha256(sourceContent),

    id: item.id,
    slug: item.slug,
    title: item.title,
    version: item.version,
    published: item.published,

    area: item.area,
    subarea: item.subarea ?? null,
    examType: item.examType,
    competency: item.competency,
    difficulty: item.difficulty,
    targetLevel: item.targetLevel ?? null,
    targetRole: item.targetRole ?? null,
    targetPosition: item.targetPosition ?? null,
    applicantProfile: item.applicantProfile ?? null,
    itemType: item.itemType,
    normativeRefs: item.normativeRefs ?? [],
    tags: item.tags ?? [],

    stem: item.stem,
    options: item.options.map((o) => ({ key: o.key, text: o.text })),
    correctOption: item.correctOption,
    explanation: item.explanation,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const includeAll = args.includes("--all");
  const checkOnly = args.includes("--check");
  const failOnWarning = args.includes("--fail-on-warning");
  const pretty = !args.includes("--no-pretty");

  const outDirArgIndex = args.indexOf("--out-dir");
  const outDirArg =
    outDirArgIndex !== -1 && args[outDirArgIndex + 1] && !args[outDirArgIndex + 1].startsWith("--")
      ? args[outDirArgIndex + 1]
      : undefined;
  const repoRoot = process.cwd();
  const itemsDir = path.join(repoRoot, "content/items");
  const outDir = path.join(repoRoot, outDirArg ?? DEFAULT_OUT_DIR);
  const scope = includeAll ? "all" : "current-corpus";

  // Selección de archivos fuente
  const selectedFiles: string[] = includeAll
    ? await listAllItemFiles(itemsDir)
    : CURRENT_QUESTION_BANK_FILES.map((f) => path.join(repoRoot, f));

  if (!checkOnly) {
    await fs.mkdir(outDir, { recursive: true });
  }

  const results: ExportResult[] = [];
  const exportedAt = new Date().toISOString();

  for (const filePath of selectedFiles) {
    const relFile = path.relative(repoRoot, filePath);
    const rawMarkdown = await fs.readFile(filePath, "utf8");
    const parsed = parseMarkdownItem(rawMarkdown);
    const outFile = path.join(outDir, path.basename(filePath, ".md") + ".json");

    if (!parsed.ok || !parsed.item) {
      results.push({
        file: relFile,
        outFile: path.relative(repoRoot, outFile),
        status: "error",
        messages: parsed.errors,
      });
      continue;
    }

    const derived = buildDerivedItem(parsed.item, filePath, rawMarkdown, repoRoot);
    const jsonContent = pretty
      ? JSON.stringify(derived, null, 2)
      : JSON.stringify(derived);

    if (checkOnly) {
      // Verificar si el JSON existente es consistente con la fuente MD
      try {
        const existing = await fs.readFile(outFile, "utf8");
        const existingParsed = JSON.parse(existing) as DerivedJsonItem;
        const messages: string[] = [];
        if (existingParsed._source_hash !== derived._source_hash) {
          messages.push(`MD modificado desde última exportación (hash differ)`);
        }
        results.push({
          file: relFile,
          outFile: path.relative(repoRoot, outFile),
          status: messages.length > 0 ? "warning" : "ok",
          messages,
        });
      } catch {
        results.push({
          file: relFile,
          outFile: path.relative(repoRoot, outFile),
          status: "warning",
          messages: ["JSON derivado no existe — ejecutar content:export:json"],
        });
      }
    } else {
      await fs.writeFile(outFile, jsonContent + "\n", "utf8");
      results.push({
        file: relFile,
        outFile: path.relative(repoRoot, outFile),
        status: parsed.warnings.length > 0 ? "warning" : "ok",
        messages: parsed.warnings,
      });
    }
  }

  const summary: ExportSummary = {
    schema: DERIVED_SCHEMA_VERSION,
    scope,
    exportedAt,
    exporterVersion: EXPORTER_VERSION,
    totalFiles: selectedFiles.length,
    exported: results.filter((r) => r.status === "ok" || r.status === "warning").length,
    errors: results.filter((r) => r.status === "error").length,
    warnings: results.filter((r) => r.status === "warning").length,
    outDir: path.relative(repoRoot, outDir),
  };

  console.log(JSON.stringify({ summary, results }, null, 2));

  const hasErrors = summary.errors > 0;
  const hasWarnings = summary.warnings > 0;

  if (hasErrors) {
    console.error(`\n❌ Export falló: ${summary.errors} error(es).`);
    process.exit(1);
  }

  if (hasWarnings && failOnWarning) {
    console.error(`\n⚠️  Export con warnings (--fail-on-warning activo): ${summary.warnings} warning(s).`);
    process.exit(1);
  }

  const action = checkOnly ? "Verificación" : "Exportación";
  console.error(
    `\n✅ ${action} completa — ${summary.exported}/${summary.totalFiles} ítems` +
    (summary.warnings > 0 ? ` (${summary.warnings} warnings)` : ""),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
