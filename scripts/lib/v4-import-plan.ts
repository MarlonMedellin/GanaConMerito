import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { v4ItemSchema, type V4Item } from "../../src/domain/content/v4-contract";

export interface V4ApprovalEvidence {
  kind: "legacy-register" | "expansion-batch" | "canonical-manifest";
  reference: string;
  expectedPath?: string;
}

export interface V4ImportCandidate {
  item: V4Item;
  itemId: string;
  sourcePath: string;
  contentHash: string;
  approvalEvidence: V4ApprovalEvidence;
}

export interface V4ImportPlan {
  candidates: V4ImportCandidate[];
  planHash: string;
  sourceSha: string;
  expectedCount: number;
  corpusHash: string;
  idsHash: string;
}

interface V4CanonicalManifest {
  repository: { sourceCommit: string };
  expectedItemCount: number;
  corpus: { sha256: string; idsSha256: string; ids: string[] };
  editorialState: {
    status: string;
    approval: string;
    runtimeActivationAuthorized: boolean;
    supabaseMigrationAuthorized: boolean;
  };
}

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) throw new Error("Unsupported value in canonical JSON");
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;
}

export function calculateV4PlanHash(candidates: V4ImportCandidate[]): string {
  const payload = [...candidates]
    .sort((left, right) => left.itemId.localeCompare(right.itemId))
    .map((candidate) => [
      candidate.itemId,
      candidate.contentHash,
      candidate.sourcePath,
      candidate.approvalEvidence.reference,
    ].join(":"))
    .map((line) => `${line}\n`)
    .join("");
  return createHash("sha256").update(payload).digest("hex");
}

function expandItemRange(startId: string, endId: string, expectedCount: number): string[] | null {
  const start = startId.match(/^((?:DOC|GEN)-)(\d{6})$/);
  const end = endId.match(/^((?:DOC|GEN)-)(\d{6})$/);
  if (!start || !end || start[1] !== end[1]) return null;
  const startNumber = Number(start[2]);
  const endNumber = Number(end[2]);
  if (endNumber < startNumber || endNumber - startNumber + 1 !== expectedCount) return null;
  return Array.from(
    { length: expectedCount },
    (_, offset) => `${start[1]}${String(startNumber + offset).padStart(6, "0")}`,
  );
}

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (quoted && input[index + 1] === '"') { cell += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell); cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = []; cell = "";
    } else cell += character;
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
}

export function collectApprovalEvidence(
  legacyRegister: string,
  expansionDocuments: Array<{ sourcePath: string; content: string }>,
) {
  const evidence = new Map<string, V4ApprovalEvidence>();
  const rows = parseCsv(legacyRegister);
  const headers = rows.shift() ?? [];
  const column = (name: string) => headers.indexOf(name);
  for (const row of rows) {
    const itemId = row[column("v4_item_id")]?.trim();
    if (!itemId) continue;
    if (row[column("factory_decision")] === "PRODUCE"
      && row[column("audit_decision")] === "APPROVED"
      && row[column("status")] === "processed_serialized") {
      evidence.set(itemId, {
        kind: "legacy-register",
        reference: `${row[column("batch_id")]}:${itemId}`,
        expectedPath: row[column("v4_item_path")]?.replaceAll("\\", "/"),
      });
    }
  }
  for (const document of expansionDocuments) {
    const hasExplicitClosure = /\*\*Estado:\*\*\s*APPROVED\s*\/\s*CERRADO/i.test(document.content);
    const approvedCountMatch = document.content.match(/Se aprobaron y serializaron\s+(\d+)\s+reactivos/i);
    const phaseCountMatch = document.content.match(/\*\*Expansión:\*\*\s*\+(\d+)\s+reactivos aprobados/i);
    const hasCompletedPhase = /\*\*Estado:\*\*\s*COMPLETADO/i.test(document.content)
      && Boolean(phaseCountMatch);
    if (!hasExplicitClosure && !approvedCountMatch && !hasCompletedPhase) continue;
    let ids = [...new Set(document.content
      .split(/\r?\n/)
      .map((line) => line.match(/^\|\s*((?:DOC|GEN)-\d{6})\s*\|/)?.[1])
      .filter((itemId): itemId is string => Boolean(itemId)))];
    if (ids.length === 0 && approvedCountMatch) {
      const range = document.content.match(/Rango:\s*`?((?:DOC|GEN)-(\d{6}))`?\s*[–-]\s*`?((?:DOC|GEN)-(\d{6}))`?/i);
      const expanded = range
        ? expandItemRange(range[1], range[3], Number(approvedCountMatch[1]))
        : null;
      if (!expanded) continue;
      ids = expanded;
    }
    if (ids.length === 0 && hasCompletedPhase && phaseCountMatch) {
      const expandedRanges: string[] = [];
      const rangeRows = document.content.matchAll(
        /^\|\s*[A-Z]\d+\s*\|\s*`?((?:DOC|GEN)-\d{6})`?\s*[–-]\s*`?((?:DOC|GEN)-\d{6})`?\s*\|\s*(\d+)\s*\|/gim,
      );
      for (const rangeRow of rangeRows) {
        const expanded = expandItemRange(rangeRow[1], rangeRow[2], Number(rangeRow[3]));
        if (!expanded) { expandedRanges.length = 0; break; }
        expandedRanges.push(...expanded);
      }
      if (expandedRanges.length !== Number(phaseCountMatch[1])) continue;
      ids = [...new Set(expandedRanges)];
    }
    const batch = document.content.match(/(?:\*\*Batch:\*\*|^Lote:)\s*`([^`]+)`/im)?.[1]
      ?? document.sourcePath;
    for (const itemId of ids) evidence.set(itemId, { kind: "expansion-batch", reference: `${batch}:${itemId}` });
  }
  return evidence;
}

async function jsonFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await jsonFiles(target));
    else if (entry.isFile() && entry.name.endsWith(".json")) files.push(target);
  }
  return files.sort();
}

export async function buildV4ImportPlan(repoRoot: string): Promise<V4ImportPlan> {
  const bankRoot = path.join(repoRoot, "content/question-bank-v4");
  const [itemPaths, manifest, domains, topics, competencies, questionTypes] = await Promise.all([
    jsonFiles(path.join(bankRoot, "items")),
    fs.readFile(path.join(bankRoot, "MANIFEST.json"), "utf8").then(JSON.parse) as Promise<V4CanonicalManifest>,
    fs.readFile(path.join(bankRoot, "taxonomy/domains.json"), "utf8").then(JSON.parse) as Promise<string[]>,
    fs.readFile(path.join(bankRoot, "taxonomy/topics.json"), "utf8").then(JSON.parse) as Promise<string[]>,
    fs.readFile(path.join(bankRoot, "taxonomy/competencies.json"), "utf8").then(JSON.parse) as Promise<string[]>,
    fs.readFile(path.join(bankRoot, "taxonomy/question-types.json"), "utf8").then(JSON.parse) as Promise<{ questionTypes: string[]; cognitiveLevels: string[] }>,
  ]);
  if (manifest.editorialState.status !== "FROZEN" || manifest.editorialState.approval !== "APPROVED") {
    throw new Error("V4 canonical manifest is not FROZEN / APPROVED");
  }
  if (manifest.editorialState.runtimeActivationAuthorized || manifest.editorialState.supabaseMigrationAuthorized) {
    throw new Error("V4 canonical manifest must remain runtime and production-migration inactive");
  }
  if (!/^[a-f0-9]{40}$/.test(manifest.repository.sourceCommit)) {
    throw new Error("V4 canonical manifest sourceCommit is invalid");
  }
  const ids = new Set<string>();
  const candidates: V4ImportCandidate[] = [];
  const corpusDigest = createHash("sha256");
  for (const file of itemPaths) {
    const sourcePath = path.relative(repoRoot, file).replaceAll("\\", "/");
    const raw = await fs.readFile(file, "utf8");
    const item = v4ItemSchema.parse(JSON.parse(raw));
    if (ids.has(item.id)) throw new Error(`Duplicate V4 id: ${item.id}`);
    ids.add(item.id);
    if (!domains.includes(item.domain)) throw new Error(`${item.id}: domain outside catalog`);
    if (!topics.includes(item.topic)) throw new Error(`${item.id}: topic outside catalog`);
    if (!competencies.includes(item.competency)) throw new Error(`${item.id}: competency outside catalog`);
    if (!questionTypes.questionTypes.includes(item.questionType)) throw new Error(`${item.id}: questionType outside catalog`);
    if (!questionTypes.cognitiveLevels.includes(item.cognitiveLevel)) throw new Error(`${item.id}: cognitiveLevel outside catalog`);
    const fileHash = createHash("sha256").update(raw).digest("hex");
    corpusDigest.update(sourcePath).update("\0").update(fileHash).update("\n");
    const approvalEvidence: V4ApprovalEvidence = {
      kind: "canonical-manifest",
      reference: `manifest:${manifest.repository.sourceCommit}:${item.id}`,
      expectedPath: sourcePath,
    };
    candidates.push({
      item,
      itemId: item.id,
      sourcePath,
      contentHash: createHash("sha256").update(canonicalJson(item)).digest("hex"),
      approvalEvidence,
    });
  }
  const sortedIds = [...ids].sort();
  const idsHash = createHash("sha256").update(sortedIds.map((itemId) => `${itemId}\n`).join("")).digest("hex");
  const corpusHash = corpusDigest.digest("hex");
  if (candidates.length !== manifest.expectedItemCount) {
    throw new Error(`V4 manifest count mismatch: expected ${manifest.expectedItemCount}, found ${candidates.length}`);
  }
  if (JSON.stringify(sortedIds) !== JSON.stringify([...manifest.corpus.ids].sort())) {
    throw new Error("V4 manifest IDs do not match the physical corpus");
  }
  if (idsHash !== manifest.corpus.idsSha256) throw new Error("V4 manifest IDs hash mismatch");
  if (corpusHash !== manifest.corpus.sha256) throw new Error("V4 manifest corpus hash mismatch");
  return {
    candidates,
    planHash: calculateV4PlanHash(candidates),
    sourceSha: manifest.repository.sourceCommit,
    expectedCount: manifest.expectedItemCount,
    corpusHash,
    idsHash,
  };
}
