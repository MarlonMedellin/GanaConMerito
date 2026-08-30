export const KNOWLEDGE_LEVELS = ["A", "B", "C", "D", "E", "F"] as const;
export type KnowledgeLevel = (typeof KNOWLEDGE_LEVELS)[number];

export interface V4SourceGuardItem {
  id: string;
  domain: string;
  topic: string;
  competency: string;
  source: { reference: string; sourceId?: string };
}

export interface KnowledgeSourceGuardRecord {
  sourceId: string;
  reference: string;
  referenceAliases?: string[];
  verificationStatus: string;
  knowledgeLevel?: KnowledgeLevel;
  compatibleDomains?: string[];
  compatibleTopics?: string[];
  compatibleCompetencies?: string[];
}

export interface V4SourceGuardOptions { requireSourceId?: boolean }

function normalizeReference(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bmen\b/g, "ministerio educacion nacional")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenSet(value: string) {
  return new Set(normalizeReference(value).split(" ").filter((token) => token.length > 2 || /^\d+$/.test(token)));
}

function overlap(left: string, right: string) {
  const a = tokenSet(left); const b = tokenSet(right);
  if (!a.size || !b.size) return 0;
  let shared = 0; for (const token of a) if (b.has(token)) shared += 1;
  return shared / Math.min(a.size, b.size);
}

function sameWork(left: string, right: string): boolean {
  const a = normalizeReference(left); const b = normalizeReference(right);
  if (a === b) return true;
  if ((a.includes(b) || b.includes(a)) && Math.min(a.length, b.length) >= 18) return true;
  const yearsA = [...a.matchAll(/\b(19|20)\d{2}\b/g)].map((m) => m[0]);
  const yearsB = [...b.matchAll(/\b(19|20)\d{2}\b/g)].map((m) => m[0]);
  if (yearsA.length && yearsB.length && !yearsA.some((year) => yearsB.includes(year))) return false;
  return overlap(left, right) >= 0.72;
}

function safeAliases(source: KnowledgeSourceGuardRecord): string[] {
  return (source.referenceAliases ?? []).filter((alias) => {
    const segments = alias.split(";").map((part) => part.trim()).filter(Boolean);
    return segments.length === 1 && sameWork(source.reference, segments[0]);
  });
}

function referenceMatches(itemReference: string, source: KnowledgeSourceGuardRecord): boolean {
  const segments = itemReference.split(";").map((part) => part.trim()).filter(Boolean);
  if (segments.length === 0) return false;
  const candidates = [source.reference, ...safeAliases(source)];
  return segments.some((segment) => candidates.some((candidate) => sameWork(segment, candidate)));
}

function includesIfDeclared(values: string[] | undefined, value: string): boolean {
  return !values || values.length === 0 || values.includes(value);
}

export function buildKnowledgeSourceMap(sources: KnowledgeSourceGuardRecord[]) {
  const issues: string[] = [];
  const map = new Map<string, KnowledgeSourceGuardRecord>();
  for (const source of sources) {
    if (!source.sourceId?.trim()) { issues.push("Knowledge Base source without sourceId"); continue; }
    if (map.has(source.sourceId)) { issues.push(`sourceId duplicado en Knowledge Base: ${source.sourceId}`); continue; }
    map.set(source.sourceId, source);
  }
  return { map, issues };
}

export function validateV4SourceGuard(item: V4SourceGuardItem, sourcesById: Map<string, KnowledgeSourceGuardRecord>, options: V4SourceGuardOptions = {}): string[] {
  const issues: string[] = [];
  const sourceId = item.source.sourceId?.trim();
  if (!sourceId) {
    if (options.requireSourceId) issues.push("source.sourceId es obligatorio para freeze V4.1");
    return issues;
  }
  const source = sourcesById.get(sourceId);
  if (!source) return [`sourceId inexistente en Knowledge Base: ${sourceId}`];
  if (source.verificationStatus !== "verified") issues.push(`${sourceId}: verificationStatus debe ser verified para uso productivo V4.1`);
  if (source.knowledgeLevel === "F") issues.push(`${sourceId}: una fuente histórica de nivel F no puede ser fuente principal decisiva V4.1`);
  if (!referenceMatches(item.source.reference, source)) issues.push(`${sourceId}: source.reference no corresponde con una única identidad documental canónica (${source.reference})`);
  if (!includesIfDeclared(source.compatibleDomains, item.domain)) issues.push(`${sourceId}: domain incompatible con la fuente: ${item.domain}`);
  if (!includesIfDeclared(source.compatibleTopics, item.topic)) issues.push(`${sourceId}: topic incompatible con la fuente: ${item.topic}`);
  if (!includesIfDeclared(source.compatibleCompetencies, item.competency)) issues.push(`${sourceId}: competency incompatible con la fuente: ${item.competency}`);
  return issues;
}
