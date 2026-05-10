import type { SourceTruthStatus } from "../../types/tutor-turn";
import { validateTagRegistry, validateTaxonomyRecord } from "./validators";

export interface LegacyItemInput {
  id: string;
  area?: string | null;
  subarea?: string | null;
  competency?: string | null;
  nivel_educativo?: string | null;
  tipo_item?: string | null;
  nivel_cognitivo?: string | null;
  dificultad?: string | null;
  targetPosition?: string | null;
  targetRole?: string | null;
  applicantProfile?: string | null;
  stem?: string | null;
  source_type?: string | null;
  source_path?: string | null;
  tags?: Partial<Record<"pedagogical_strategy" | "misconception" | "cognitive_process" | "content_topic" | "risk_flag" | "profile_context", string[]>>;
}

export interface NormalizedRichItem {
  itemId: string;
  taxonomy: ReturnType<typeof validateTaxonomyRecord>;
  stem: string;
  sourceType: string;
  sourceRefs: string[];
  sourceTruthStatus: SourceTruthStatus;
  tags: ReturnType<typeof validateTagRegistry>;
}

export function normalizeLegacyItemToRichItem(item: LegacyItemInput): NormalizedRichItem {
  const taxonomy = validateTaxonomyRecord({
    area: item.area ?? "pedagogia",
    subarea: item.subarea ?? "didactica",
    competency: item.competency ?? "analisis_pedagogico",
    nivel_educativo: item.nivel_educativo ?? "media",
    tipo_item: item.tipo_item ?? "caso",
    nivel_cognitivo: item.nivel_cognitivo ?? "analizar",
    dificultad: item.dificultad ?? "media",
    targetPosition: item.targetPosition ?? "docente",
    targetRole: item.targetRole ?? "aula",
    applicantProfile: item.applicantProfile ?? "intermedio",
  });

  return {
    itemId: item.id,
    taxonomy,
    stem: item.stem ?? "",
    sourceType: item.source_type ?? "runtime_item_bank",
    sourceRefs: item.source_path ? [item.source_path] : [`item_bank:${item.id}`],
    sourceTruthStatus: "synthesized_governed_unverified",
    tags: validateTagRegistry(item.tags ?? {}),
  };
}
