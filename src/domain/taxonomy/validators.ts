import {
  CANONICAL_TAXONOMY,
  TAG_ALIASES,
  TAG_FORBIDDEN,
  TAG_REGISTRY,
  TAXONOMY_ALIASES,
  TAXONOMY_DEPRECATED,
  TAXONOMY_FORBIDDEN,
  type TagCategory,
  type TaxonomyKey,
} from "./catalogs";

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
  const aliased = TAG_ALIASES[normalized] ?? normalized;
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
