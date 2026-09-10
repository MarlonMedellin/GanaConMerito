import fs from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdminClient } from "../src/lib/supabase/admin";
import { v4ItemSchema, type V4Item } from "../src/domain/content/v4-contract";

async function files(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await files(target));
    else if (entry.name.endsWith(".json")) result.push(target);
  }
  return result.sort();
}

function difficulty(value: V4Item["estimatedDifficulty"]) { return value === "low" ? 0.25 : value === "high" ? 0.75 : 0.5; }

async function main() {
  const dryRun = !process.argv.includes("--apply");
  const root = process.cwd();
  const base = path.join(root, "content/question-bank-v4");
  const imported: string[] = [], rejected: Array<{ file: string; reason: string }> = [], existing: string[] = [];
  const client = dryRun ? null : getSupabaseAdminClient();
  for (const file of await files(path.join(base, "items"))) {
    const relative = path.relative(root, file);
    let item: V4Item;
    try { item = v4ItemSchema.parse(JSON.parse(await fs.readFile(file, "utf8"))); }
    catch (error) { rejected.push({ file: relative, reason: error instanceof Error ? error.message : String(error) }); continue; }
    if (!file.startsWith(base + path.sep)) { rejected.push({ file: relative, reason: "source_path fuera de content/question-bank-v4" }); continue; }
    if (dryRun) { imported.push(item.id); continue; }
    const options = (["A", "B", "C", "D"] as const).map((key) => ({ key, text: item.options[key] }));
    const editorialMetadata = {
      context: item.context,
      explanations: item.explanations,
      hint: item.hint,
      learningNote: item.learningNote,
      importedFrom: relative,
      importedAt: new Date().toISOString(),
    };
    const { data: upserted, error: upsertError } = await client!.rpc("upsert_content_item_v4", {
      p_content_id: item.id,
      p_slug: item.id.toLowerCase(),
      p_title: item.id,
      p_area: item.domain,
      p_subarea: item.topic,
      p_exam_type: "docentes",
      p_competency: item.competency,
      p_difficulty: difficulty(item.estimatedDifficulty),
      p_target_level: item.cognitiveLevel,
      p_stem: `${item.context}\n\n${item.stem}`,
      p_correct_option: item.correctAnswer,
      p_explanation: item.explanations[item.correctAnswer],
      p_normative_refs: [item.source.reference],
      p_options: options,
      p_source_path: relative,
      p_editorial_scope: item.scope,
      p_topic_code: item.topic,
      p_question_type: item.questionType,
      p_cognitive_level: item.cognitiveLevel,
      p_source_reference: item.source.reference,
      p_source_locator: item.source.locator ?? null,
      p_source_url: item.source.url ?? null,
      p_opec_id: item.opecId ?? null,
      p_editorial_metadata: editorialMetadata,
    });
    if (upsertError) { rejected.push({ file: relative, reason: upsertError.message }); continue; }
    const row = Array.isArray(upserted) ? upserted[0] : upserted;
    if (row?.item_version && row.item_version > 1) existing.push(item.id);
    else imported.push(item.id);
  }
  console.log(JSON.stringify({ mode: dryRun ? "dry-run" : "apply", imported, existing, rejected, note: dryRun ? "No se modificó Supabase." : undefined }, null, 2));
  if (rejected.length) process.exit(1);
}
main().catch((error) => { console.error(error); process.exit(1); });
