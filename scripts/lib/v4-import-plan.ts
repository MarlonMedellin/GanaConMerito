import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { v4ItemSchema, type V4Item } from "../../src/domain/content/v4-contract";

export interface V4ApprovalEvidence {
  kind: "legacy-register" | "expansion-batch";
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
    const hasNarrativeClosure = Boolean(approvedCountMatch);
    if (!hasExplicitClosure && !hasNarrativeClosure) continue;
    let ids = [...new Set(document.content
      .split(/\r?\n/)
      .map((line) => line.match(/^\|\s*((?:DOC|GEN)-\d{6})\s*\|/)?.[1])
      .filter((itemId): itemId is string => Boolean(itemId)))];
    if (ids.length === 0 && approvedCountMatch) {
      const range = document.content.match(/Rango:\s*`?((?:DOC|GEN)-(\d{6}))`?\s*[–-]\s*`?((?:DOC|GEN)-(\d{6}))`?/i);
      if (!range || range[1].slice(0, 3) !== range[3].slice(0, 3)) continue;
      const prefix = range[1].slice(0, 3);
      const start = Number(range[2]);
      const end = Number(range[4]);
      const expectedCount = Number(approvedCountMatch[1]);
      if (end < start || end - start + 1 !== expectedCount) continue;
      ids = Array.from(
        { length: expectedCount },
        (_, offset) => `${prefix}-${String(start + offset).padStart(6, "0")}`,
      );
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
  const rootEntries = await fs.readdir(bankRoot);
  const expansionPaths = rootEntries.filter((name) => /^EXPANSION-BATCH-.*\.md$/.test(name)).sort().map((name) => path.join(bankRoot, name));
  const [itemPaths, legacyRegister, expansionDocuments, domains, topics, competencies, questionTypes] = await Promise.all([
    jsonFiles(path.join(bankRoot, "items")),
    fs.readFile(path.join(bankRoot, "legacy-processing-register.csv"), "utf8"),
    Promise.all(expansionPaths.map(async (file) => ({ sourcePath: path.relative(repoRoot, file).replaceAll("\\", "/"), content: await fs.readFile(file, "utf8") }))),
    fs.readFile(path.join(bankRoot, "taxonomy/domains.json"), "utf8").then(JSON.parse) as Promise<string[]>,
    fs.readFile(path.join(bankRoot, "taxonomy/topics.json"), "utf8").then(JSON.parse) as Promise<string[]>,
    fs.readFile(path.join(bankRoot, "taxonomy/competencies.json"), "utf8").then(JSON.parse) as Promise<string[]>,
    fs.readFile(path.join(bankRoot, "taxonomy/question-types.json"), "utf8").then(JSON.parse) as Promise<{ questionTypes: string[]; cognitiveLevels: string[] }>,
  ]);
  const approvals = collectApprovalEvidence(legacyRegister, expansionDocuments);
  const ids = new Set<string>();
  const candidates: V4ImportCandidate[] = [];
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
    const approvalEvidence = approvals.get(item.id);
    if (!approvalEvidence) throw new Error(`${item.id}: missing APPROVED editorial evidence`);
    if (approvalEvidence.expectedPath && approvalEvidence.expectedPath !== sourcePath) throw new Error(`${item.id}: approval path does not match ${sourcePath}`);
    candidates.push({ item, itemId: item.id, sourcePath, contentHash: createHash("sha256").update(raw).digest("hex"), approvalEvidence });
  }
  const planHash = createHash("sha256").update(candidates.map((candidate) => `${candidate.itemId}:${candidate.contentHash}:${candidate.approvalEvidence.reference}`).join("\n")).digest("hex");
  return { candidates, planHash };
}
