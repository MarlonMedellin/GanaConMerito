import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const OPEC_ID = "docente-aula-basica-secundaria";
const EXISTING_NUCLEUS_CODE = "legacy-general";
const RELEASE_PATH = path.join(
  "content",
  "question-bank-v3",
  "opecs",
  OPEC_ID,
  "releases",
  "v3-ready-for-pilot-0001",
  "release.json",
);
const BLUEPRINT_PATH = path.join("content", "question-bank-v3", "opecs", OPEC_ID, "blueprint", "blueprint.json");
const APPLY_FLAG = "--apply";

type BlueprintCell = {
  nucleusId: string;
  competencyId: string;
  nucleus: string;
  competency: string;
  employmentAnchor: string;
};

type QuestionV3 = {
  itemId: string;
  opecId: string;
  title: string;
  context: string;
  stem: string;
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
  correctAnswer: "A" | "B" | "C" | "D";
  keyJustification: string;
  estimatedDifficulty: "baja" | "media" | "alta";
  nucleusId: string;
  competencyId: string;
  sourceEvidence: { sourceId: string; url?: string; supports?: string }[];
  feedbackByOption: Record<string, unknown>;
  editorialMetadata?: Record<string, unknown>;
};

function difficultyToNumber(label: QuestionV3["estimatedDifficulty"]) {
  if (label === "baja") return 0.3;
  if (label === "alta") return 0.75;
  return 0.5;
}

function slugFromItemId(itemId: string) {
  return itemId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function readJson<T>(repoRoot: string, relativePath: string): Promise<T> {
  const raw = await fs.readFile(path.join(repoRoot, relativePath), "utf8");
  return JSON.parse(raw) as T;
}

async function readReleaseItems(repoRoot: string) {
  const release = await readJson<{ items: { path: string }[] }>(repoRoot, RELEASE_PATH);
  return Promise.all(
    release.items.map(async (entry) => {
      const itemPath = entry.path;
      const item = await readJson<QuestionV3>(repoRoot, itemPath);
      return { item, itemPath };
    }),
  );
}

async function main() {
  const apply = process.argv.includes(APPLY_FLAG);
  const repoRoot = process.cwd();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const blueprint = await readJson<{ cells: BlueprintCell[] }>(repoRoot, BLUEPRINT_PATH);
  const cellsById = new Map(blueprint.cells.map((cell) => [cell.nucleusId, cell]));
  const releaseItems = await readReleaseItems(repoRoot);

  if (releaseItems.length !== 20) {
    throw new Error(`Se esperaban 20 preguntas v3 y se encontraron ${releaseItems.length}.`);
  }

  const missingFields = releaseItems.flatMap(({ item, itemPath }) => {
    const errors: string[] = [];
    if (!item.itemId) errors.push("itemId");
    if (!item.opecId) errors.push("opecId");
    if (!item.context) errors.push("context");
    if (!item.stem) errors.push("stem");
    if (!item.correctAnswer) errors.push("correctAnswer");
    if (!item.keyJustification) errors.push("keyJustification");
    if (item.options.length !== 4) errors.push("options");
    if (!cellsById.has(item.nucleusId)) errors.push("blueprint nucleus");
    if (Object.keys(item.feedbackByOption ?? {}).length !== 4) errors.push("feedbackByOption");
    return errors.map((field) => `${itemPath}: ${field}`);
  });

  if (missingFields.length > 0) {
    throw new Error(`Campos v3 incompletos:\n${missingFields.join("\n")}`);
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        opecId: OPEC_ID,
        itemCount: releaseItems.length,
        status: "published",
        approvalStatus: "approved",
        pilotStatus: "pilot_loaded",
        thematicNucleus: EXISTING_NUCLEUS_CODE,
      },
      null,
      2,
    ),
  );

  if (!apply) {
    return;
  }

  if (!url || !serviceRoleKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY para cargar en Supabase.");
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existingNucleus, error: existingNucleusError } = await supabase
    .from("thematic_nuclei")
    .select("id, code")
    .eq("code", EXISTING_NUCLEUS_CODE)
    .single();

  if (existingNucleusError) throw existingNucleusError;

  const imported: string[] = [];
  for (const { item, itemPath } of releaseItems) {
    const cell = cellsById.get(item.nucleusId);
    if (!cell) throw new Error(`No existe blueprint cell para ${item.nucleusId}.`);

    const sourcePath = itemPath.replaceAll("\\", "/");
    const { data: upserted, error: upsertError } = await supabase.rpc("upsert_content_item", {
      p_content_id: item.itemId,
      p_slug: slugFromItemId(item.itemId),
      p_title: item.title,
      p_area: "pedagogia",
      p_subarea: cell.nucleus,
      p_exam_type: "cnsc_docente_aula_basica_secundaria_v3",
      p_competency: cell.competency,
      p_difficulty: difficultyToNumber(item.estimatedDifficulty),
      p_target_level: "basica_secundaria",
      p_item_type: "multiple_choice",
      p_stem: `${item.context}\n\n${item.stem}`,
      p_correct_option: item.correctAnswer,
      p_explanation: item.keyJustification,
      p_normative_refs: item.sourceEvidence.map((source) => source.sourceId),
      p_is_published: true,
      p_version: 3,
      p_options: item.options,
      p_source_path: sourcePath,
      p_editorial_metadata: {
        ...item,
        runtimeLoad: {
          loadedFor: "platform_pilot_tests",
          status: "published",
          approvalStatus: "approved",
          pilotStatus: "pilot_loaded",
          thematicNucleus: EXISTING_NUCLEUS_CODE,
          technicalDebt:
            "Carga aprobada solo para pruebas de plataforma. El usuario hara despues la validacion editorial/humana y los ajustes antes de tratar este lote como banco beta definitivo.",
        },
      },
    });

    if (upsertError) throw upsertError;

    const itemId = Array.isArray(upserted) ? upserted[0]?.item_id : upserted?.item_id;
    const { error: updateError } = await supabase
      .from("item_bank")
      .update({
        status: "published",
        is_published: true,
        is_active: true,
        opec_id: OPEC_ID,
        approval_status: "approved",
        pilot_status: "pilot_loaded",
        source_type: "import",
        thematic_nucleus_id: existingNucleus.id,
      })
      .eq("id", itemId);

    if (updateError) throw updateError;
    imported.push(item.itemId);
  }

  const { data: verification, error: verificationError } = await supabase
    .from("v_question_bank_v3_pilot")
    .select("content_id, read_state, approval_status, pilot_status")
    .eq("opec_id", OPEC_ID)
    .eq("read_state", "pilot")
    .order("content_id");

  if (verificationError) throw verificationError;
  if ((verification ?? []).length !== 20) {
    throw new Error(`Carga incompleta: la vista piloto reporta ${verification?.length ?? 0} de 20 preguntas.`);
  }

  console.log(JSON.stringify({ importedCount: imported.length, imported }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
