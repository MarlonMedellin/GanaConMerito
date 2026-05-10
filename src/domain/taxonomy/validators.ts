import {
  CANONICAL_TAXONOMY,
  TAG_ALIASES,
  TAG_DEPRECATED,
  TAG_FORBIDDEN,
  TAG_REGISTRY,
  TAXONOMY_ALIASES,
  TAXONOMY_DEPRECATED,
  TAXONOMY_FORBIDDEN,
  type TagCategory,
  type TaxonomyKey,
} from "./catalogs";

export type EditorialIssueType =
  | "missing_field"
  | "non_canonical_taxonomy"
  | "non_allowed_tag"
  | "deprecated_tag_normalized"
  | "nonexistent_subarea"
  | "non_canonical_competency"
  | "invalid_target_position_or_role"
  | "malformed_technical_risk"
  | "distractor_without_rationale";

export interface EditorialIssue {
  type: EditorialIssueType;
  field: string;
  message: string;
  severity: "warning" | "error";
}

export interface RichItemValidationInput {
  id: string;
  taxonomy?: Partial<Record<TaxonomyKey, string | null | undefined>>;
  tags?: Partial<Record<TagCategory, string[]>>;
  looseTags?: string[];
  targetPosition?: string | null;
  targetRole?: string | null;
  technicalRisks?: unknown;
  distractorRationales?: Record<string, string> | null;
}

export interface LooseTagNormalizationResult {
  registry: Partial<Record<TagCategory, string[]>>;
  unknownTags: string[];
  deprecatedTags: string[];
}

function normalizeValue(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

export function normalizeTaxonomyValue(key: TaxonomyKey, value: string): string {
  const normalized = normalizeValue(value);
  if (TAXONOMY_FORBIDDEN.has(normalized)) {
    throw new Error(`Forbidden taxonomy value for ${key}: ${value}`);
  }

  const aliased = TAXONOMY_ALIASES[normalized] ?? TAXONOMY_DEPRECATED[normalized] ?? normalized;
  if (!(CANONICAL_TAXONOMY[key] as readonly string[]).includes(aliased)) {
    throw new Error(`Unknown taxonomy value for ${key}: ${value}`);
  }

  return aliased;
}

export function validateTaxonomyRecord(record: Record<TaxonomyKey, string>) {
  const normalized = {} as Record<TaxonomyKey, string>;
  for (const key of Object.keys(CANONICAL_TAXONOMY) as TaxonomyKey[]) {
    normalized[key] = normalizeTaxonomyValue(key, record[key]);
  }
  return normalized;
}

export function normalizeTag(category: TagCategory, tag: string): string {
  const normalized = normalizeValue(tag);
  if (TAG_FORBIDDEN.has(normalized)) {
    throw new Error(`Forbidden tag: ${tag}`);
  }

  const aliased = TAG_ALIASES[normalized] ?? TAG_DEPRECATED[normalized] ?? normalized;
  if (!(TAG_REGISTRY[category] as readonly string[]).includes(aliased)) {
    throw new Error(`Unknown tag in ${category}: ${tag}`);
  }

  return aliased;
}

export function validateTagRegistry(input: Partial<Record<TagCategory, string[]>>) {
  const output = {} as Record<TagCategory, string[]>;
  for (const category of Object.keys(TAG_REGISTRY) as TagCategory[]) {
    output[category] = [...new Set((input[category] ?? []).map((tag) => normalizeTag(category, tag)))];
  }
  return output;
}

function inferLooseTagCategory(prefix: string): TagCategory | undefined {
  switch (prefix) {
    case "foco":
    case "tema":
    case "contenido":
      return "content_topic";
    case "estrategia":
      return "pedagogical_strategy";
    case "error":
    case "misconcepcion":
      return "misconception";
    case "proceso":
      return "cognitive_process";
    case "riesgo":
      return "risk_flag";
    case "perfil":
    case "contexto":
      return "profile_context";
    default:
      return undefined;
  }
}

export function normalizeLooseTags(tags: string[] = []): LooseTagNormalizationResult {
  const registry: Partial<Record<TagCategory, string[]>> = {};
  const unknownTags: string[] = [];
  const deprecatedTags: string[] = [];

  for (const rawTag of tags) {
    const trimmed = String(rawTag ?? "").trim();
    if (!trimmed) continue;

    const [prefix, suffix] = trimmed.includes(":") ? trimmed.split(/:(.+)/, 2) : [undefined, trimmed];
    const hintedCategory = prefix ? inferLooseTagCategory(normalizeValue(prefix)) : undefined;
    const candidate = suffix ?? trimmed;

    if (hintedCategory) {
      const normalizedCandidate = normalizeValue(candidate);
      if (TAG_DEPRECATED[normalizedCandidate]) {
        deprecatedTags.push(trimmed);
      }
      try {
        const normalizedTag = normalizeTag(hintedCategory, candidate);
        registry[hintedCategory] = [...new Set([...(registry[hintedCategory] ?? []), normalizedTag])];
        continue;
      } catch {
        unknownTags.push(trimmed);
        continue;
      }
    }

    let matched = false;
    for (const category of Object.keys(TAG_REGISTRY) as TagCategory[]) {
      const normalizedCandidate = normalizeValue(candidate);
      if (TAG_DEPRECATED[normalizedCandidate]) {
        deprecatedTags.push(trimmed);
      }
      try {
        const normalizedTag = normalizeTag(category, candidate);
        registry[category] = [...new Set([...(registry[category] ?? []), normalizedTag])];
        matched = true;
        break;
      } catch {
        // try next category
      }
    }

    if (!matched) {
      unknownTags.push(trimmed);
    }
  }

  return { registry, unknownTags, deprecatedTags };
}

export function validateRichItemEditorial(input: RichItemValidationInput): EditorialIssue[] {
  const issues: EditorialIssue[] = [];
  const tx = input.taxonomy ?? {};
  const requiredTaxonomy: TaxonomyKey[] = ["area", "subarea", "competency", "nivel_educativo", "tipo_item", "nivel_cognitivo", "dificultad"];

  for (const field of requiredTaxonomy) {
    if (!tx[field]) {
      issues.push({ type: "missing_field", field, message: `Missing governed field: ${field}`, severity: "warning" });
      continue;
    }

    try {
      normalizeTaxonomyValue(field, String(tx[field]));
    } catch {
      issues.push({
        type: field === "subarea" ? "nonexistent_subarea" : field === "competency" ? "non_canonical_competency" : "non_canonical_taxonomy",
        field,
        message: `Non canonical taxonomy value in ${field}`,
        severity: "warning",
      });
    }
  }

  for (const field of ["targetPosition", "targetRole"] as const) {
    const raw = (input[field] ?? tx[field]) as string | null | undefined;
    if (!raw) continue;
    try {
      normalizeTaxonomyValue(field, raw);
    } catch {
      issues.push({ type: "invalid_target_position_or_role", field, message: `Invalid ${field}`, severity: "warning" });
    }
  }

  const looseTagResult = normalizeLooseTags(input.looseTags ?? []);
  for (const tag of looseTagResult.deprecatedTags) {
    issues.push({ type: "deprecated_tag_normalized", field: "tags", message: `Deprecated tag ${tag}`, severity: "warning" });
  }
  for (const tag of looseTagResult.unknownTags) {
    issues.push({ type: "non_allowed_tag", field: "tags", message: `Tag not allowed: ${tag}`, severity: "warning" });
  }

  const structuredTags = {
    ...looseTagResult.registry,
    ...(input.tags ?? {}),
  } as Partial<Record<TagCategory, string[]>>;

  for (const category of Object.keys(structuredTags) as TagCategory[]) {
    for (const tag of structuredTags[category] ?? []) {
      const normalized = normalizeValue(tag);
      if (TAG_DEPRECATED[normalized]) {
        issues.push({ type: "deprecated_tag_normalized", field: `tags.${category}`, message: `Deprecated tag ${tag}`, severity: "warning" });
      }
      try {
        normalizeTag(category, tag);
      } catch {
        issues.push({ type: "non_allowed_tag", field: `tags.${category}`, message: `Tag not allowed: ${tag}`, severity: "warning" });
      }
    }
  }

  if (input.technicalRisks && !Array.isArray(input.technicalRisks)) {
    issues.push({ type: "malformed_technical_risk", field: "technicalRisks", message: "technicalRisks must be an array", severity: "error" });
  }

  for (const [key, value] of Object.entries(input.distractorRationales ?? {})) {
    if (!value || !value.trim()) {
      issues.push({ type: "distractor_without_rationale", field: `distractorRationales.${key}`, message: `Distractor ${key} lacks rationale`, severity: "error" });
    }
  }

  return issues;
}
