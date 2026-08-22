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
    const { data: found, error: lookupError } = await client!.from("item_bank").select("id").eq("slug", item.id.toLowerCase()).maybeSingle();
    if (lookupError) throw lookupError;
    if (found) { existing.push(item.id); continue; }
    rejected.push({ file: relative, reason: "sin evidencia de auditoría APPROVED; la importación V4 exige aprobación" });
  }
  console.log(JSON.stringify({ mode: dryRun ? "dry-run" : "apply", imported, existing, rejected, note: dryRun ? "No se modificó Supabase." : undefined }, null, 2));
  if (rejected.length) process.exit(1);
}
main().catch((error) => { console.error(error); process.exit(1); });
