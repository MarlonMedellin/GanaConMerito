export const KNOWLEDGE_LEVELS = ["A", "B", "C", "D", "E", "F"] as const;

export type KnowledgeLevel = (typeof KNOWLEDGE_LEVELS)[number];

export interface V4SourceGuardItem {
  id: string;
  domain: string;
  topic: string;
  competency: string;
  source: {
    reference: string;
    sourceId?: string;
  };
}

export interface KnowledgeSourceGuardRecord {
  sourceId: string;
  reference: string;
  verificationStatus: string;
  knowledgeLevel?: KnowledgeLevel;
  compatibleDomains?: string[];
  compatibleTopics?: string[];
  compatibleCompetencies?: string[];
}

export interface V4SourceGuardOptions {
  requireSourceId?: boolean;
}

function normalizeReference(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function referenceMatches(itemReference: string, sourceReference: string): boolean {
  const item = normalizeReference(itemReference);
  const source = normalizeReference(sourceReference);
  return item === source || item.includes(source) || source.includes(item);
}

function includesIfDeclared(values: string[] | undefined, value: string): boolean {
  return !values || values.length === 0 || values.includes(value);
}

export function validateV4SourceGuard(
  item: V4SourceGuardItem,
  sourcesById: Map<string, KnowledgeSourceGuardRecord>,
  options: V4SourceGuardOptions = {},
): string[] {
  const issues: string[] = [];
  const sourceId = item.source.sourceId?.trim();

  if (!sourceId) {
    if (options.requireSourceId) issues.push("source.sourceId es obligatorio para freeze V4.1");
    return issues;
  }

  const source = sourcesById.get(sourceId);
  if (!source) {
    issues.push(`sourceId inexistente en Knowledge Base: ${sourceId}`);
    return issues;
  }

  if (source.verificationStatus !== "verified") {
    issues.push(`${sourceId}: verificationStatus debe ser verified para uso productivo V4.1`);
  }

  if (source.knowledgeLevel === "F") {
    issues.push(`${sourceId}: una fuente histórica de nivel F no puede ser fuente principal decisiva V4.1`);
  }

  if (!referenceMatches(item.source.reference, source.reference)) {
    issues.push(`${sourceId}: source.reference no corresponde con la referencia canónica (${source.reference})`);
  }

  if (!includesIfDeclared(source.compatibleDomains, item.domain)) {
    issues.push(`${sourceId}: domain incompatible con la fuente: ${item.domain}`);
  }

  if (!includesIfDeclared(source.compatibleTopics, item.topic)) {
    issues.push(`${sourceId}: topic incompatible con la fuente: ${item.topic}`);
  }

  if (!includesIfDeclared(source.compatibleCompetencies, item.competency)) {
    issues.push(`${sourceId}: competency incompatible con la fuente: ${item.competency}`);
  }

  return issues;
}
