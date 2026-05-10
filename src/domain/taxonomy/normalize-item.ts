import type { SourceTruthStatus } from "../../types/tutor-turn";
import { type TagCategory, type TaxonomyKey } from "./catalogs";
import { normalizeLooseTags, normalizeTaxonomyValue, validateTagRegistry } from "./validators";

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

function normalizeLooseValue(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

export interface LegacyItemInput {
  id: string;
  slug?: string | null;
  version?: string | number | null;
  estado?: string | null;
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
  tags?: string[] | Partial<Record<TagCategory, string[]>>;
  evidenceStatement?: string | null;
  affirmation?: string | null;
  technicalRisks?: string[] | null;
  distractorRationales?: Record<string, string> | null;
}

export interface NormalizedRichItem {
  id: string;
  slug?: string;
  version?: string;
  estado?: string;
  itemId: string;
  taxonomy: Partial<Record<TaxonomyKey, string>>;
  sourceTaxonomy: Partial<Record<TaxonomyKey, string>>;
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
  const sourceTaxonomy: Partial<Record<TaxonomyKey, string>> = {};
  const missingTaxonomy: TaxonomyKey[] = [];
  const governanceWarnings: string[] = [];

  for (const key of GOVERNED_TAXONOMY_FIELDS) {
    const rawValue = item[key];
    if (!rawValue || !rawValue.trim()) {
      missingTaxonomy.push(key);
      continue;
    }

    sourceTaxonomy[key] = normalizeLooseValue(rawValue);

    try {
      taxonomy[key] = normalizeTaxonomyValue(key, rawValue);
    } catch (error) {
      governanceWarnings.push(error instanceof Error ? error.message : `Invalid taxonomy value for ${key}`);
    }
  }

  const normalizedTags = Array.isArray(item.tags)
    ? normalizeLooseTags(item.tags)
    : { registry: item.tags ?? {}, unknownTags: [], deprecatedTags: [] };

  for (const unknownTag of normalizedTags.unknownTags) {
    governanceWarnings.push(`Unknown loose tag: ${unknownTag}`);
  }

  return {
    id: item.id,
    slug: item.slug ? String(item.slug) : undefined,
    version: item.version !== undefined && item.version !== null ? String(item.version) : undefined,
    estado: item.estado ? String(item.estado) : undefined,
    itemId: item.id,
    taxonomy,
    sourceTaxonomy,
    missingTaxonomy,
    governanceWarnings,
    stem: item.stem ?? "",
    sourceType: item.source_type ?? "runtime_item_bank",
    sourceRefs: item.source_path ? [item.source_path] : [`item_bank:${item.id}`],
    sourceTruthStatus: "synthesized_governed_unverified",
    tags: validateTagRegistry(normalizedTags.registry),
    evidenceStatement: item.evidenceStatement ?? undefined,
    affirmation: item.affirmation ?? undefined,
    technicalRisks: item.technicalRisks ?? undefined,
    distractorRationales: item.distractorRationales ?? undefined,
  };
}
