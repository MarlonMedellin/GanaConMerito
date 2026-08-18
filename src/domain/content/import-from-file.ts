import fs from "node:fs/promises";
import path from "node:path";
import { parseMarkdownItem } from "./parse-md";
import { parseBetaJsonItem } from "./parse-beta-json";
import { getSupabaseAdminClient } from "../../lib/supabase/admin";

export async function importMarkdownFile(filePath: string) {
  const rawContent = await fs.readFile(filePath, "utf8");
  const result = path.extname(filePath) === ".json" ? parseBetaJsonItem(rawContent) : parseMarkdownItem(rawContent);

  if (!result.ok || !result.item) {
    return {
      ok: false,
      filePath,
      errors: result.errors,
      warnings: result.warnings,
    };
  }

  const admin = getSupabaseAdminClient();
  const item = result.item;

  const { data, error } = await admin.rpc("upsert_content_item", {
    p_content_id: item.id,
    p_slug: item.slug,
    p_title: item.title,
    p_area: item.area,
    p_subarea: item.subarea ?? null,
    p_exam_type: item.examType,
    p_competency: item.competency,
    p_difficulty: item.difficulty,
    p_target_level: item.targetLevel ?? null,
    p_item_type: item.itemType,
    p_stem: item.stem,
    p_correct_option: item.correctOption,
    p_explanation: item.explanation,
    p_normative_refs: item.normativeRefs,
    p_is_published: item.published,
    p_version: item.version,
    p_options: item.options,
  });

  if (error || !data || data.length === 0) {
    return {
      ok: false,
      filePath,
      errors: [error?.message ?? "No se pudo persistir el contenido de forma atómica."],
      warnings: result.warnings,
    };
  }

  return {
    ok: true,
    filePath,
    errors: [],
    warnings: result.warnings,
  };
}
