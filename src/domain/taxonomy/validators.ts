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
  targetPosition?: string | null;
  targetRole?: string | null;
  technicalRisks?: unknown;
  distractorRationales?: Record<string, string> | null;
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

export function validateRichItemEditorial(input: RichItemValidationInput): EditorialIssue[] {
  const issues: EditorialIssue[] = [];
  const tx = input.taxonomy ?? {};
  const requiredTaxonomy: TaxonomyKey[] = ["area", "subarea", "competency", "nivel_educativo", "tipo_item", "nivel_cognitivo", "dificultad"];
  for (const field of requiredTaxonomy) {
    if (!tx[field]) {
      issues.push({ type: "missing_field", field, message: `Missing required field: ${field}`, severity: "error" });
      continue;
    }
    try {
      normalizeTaxonomyValue(field, String(tx[field]));
    } catch {
      issues.push({
        type: field === "subarea" ? "nonexistent_subarea" : field === "competency" ? "non_canonical_competency" : "non_canonical_taxonomy",
        field,
        message: `Non canonical taxonomy value in ${field}`,
        severity: "error",
      });
    }
  }
  for (const field of ["targetPosition", "targetRole"] as const) {
    const raw = (input[field] ?? tx[field]) as string | null | undefined;
    if (!raw) continue;
    try { normalizeTaxonomyValue(field, raw); } catch {
      issues.push({ type: "invalid_target_position_or_role", field, message: `Invalid ${field}`, severity: "error" });
    }
  }
  for (const category of Object.keys(input.tags ?? {}) as TagCategory[]) {
    for (const tag of input.tags?.[category] ?? []) {
      const normalized = tag.trim().toLowerCase().replace(/\s+/g, "_");
      if (TAG_DEPRECATED[normalized]) {
        issues.push({ type: "deprecated_tag_normalized", field: `tags.${category}`, message: `Deprecated tag ${tag}`, severity: "warning" });
      }
      try { normalizeTag(category, tag); } catch {
        issues.push({ type: "non_allowed_tag", field: `tags.${category}`, message: `Tag not allowed: ${tag}`, severity: "error" });
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
