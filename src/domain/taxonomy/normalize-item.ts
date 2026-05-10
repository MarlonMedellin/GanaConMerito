import type { SourceTruthStatus } from "../../types/tutor-turn";
import { type TagCategory, type TaxonomyKey } from "./catalogs";
import { normalizeTaxonomyValue, validateTagRegistry } from "./validators";

const GOVERNED_TAXONOMY_FIELDS = [
  "area",
  "subarea",
  "competency",
  "nivel_educativo",
  "tipo_item",
  "nivel_cognitivo",
  "dificultad",
  "targetPosition",
  "targetRole",
  "applicantProfile",
] as const satisfies readonly TaxonomyKey[];

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
  tags?: Partial<Record<TagCategory, string[]>>;
}

export interface NormalizedRichItem {
  id: string;
  slug?: string;
  version?: string;
  estado?: string;
  itemId: string;
  taxonomy: Partial<Record<TaxonomyKey, string>>;
  missingTaxonomy: TaxonomyKey[];
  governanceWarnings: string[];
  stem: string;
  sourceType: string;
  sourceRefs: string[];
  sourceTruthStatus: SourceTruthStatus;
  tags: ReturnType<typeof validateTagRegistry>;
  evidenceStatement?: string;
  affirmation?: string;
  technicalRisks?: string[];
  distractorRationales?: Record<string, string>;
}

export function normalizeLegacyItemToRichItem(item: LegacyItemInput): NormalizedRichItem {
  const taxonomy: Partial<Record<TaxonomyKey, string>> = {};
  const missingTaxonomy: TaxonomyKey[] = [];
  const governanceWarnings: string[] = [];

  for (const key of GOVERNED_TAXONOMY_FIELDS) {
    const rawValue = item[key];
    if (!rawValue || !rawValue.trim()) {
      missingTaxonomy.push(key);
      continue;
    }

    try {
      taxonomy[key] = normalizeTaxonomyValue(key, rawValue);
    } catch (error) {
      missingTaxonomy.push(key);
      governanceWarnings.push(error instanceof Error ? error.message : `Invalid taxonomy value for ${key}`);
    }
  }

  return {
    id: item.id,
    itemId: item.id,
    taxonomy,
    missingTaxonomy,
    governanceWarnings,
    stem: item.stem ?? "",
    sourceType: item.source_type ?? "runtime_item_bank",
    sourceRefs: item.source_path ? [item.source_path] : [`item_bank:${item.id}`],
    sourceTruthStatus: "synthesized_governed_unverified",
    tags: validateTagRegistry(item.tags ?? {}),
  };
}
