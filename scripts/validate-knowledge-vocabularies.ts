import fs from "node:fs/promises";
import path from "node:path";

const ALLOWED_SOURCE_VERIFICATION_STATUS = new Set([
  "needs_review",
  "verified",
  "superseded",
  "rejected",
]);

const ALLOWED_KNOWLEDGE_LEVELS = new Set(["A", "B", "C", "D", "E", "F"]);

type KnowledgeSource = {
  sourceId?: unknown;
  verificationStatus?: unknown;
  knowledgeLevel?: unknown;
  compatibleDomains?: unknown;
  compatibleTopics?: unknown;
  compatibleCompetencies?: unknown;
};

type SourceInventory = {
  sources?: unknown;
};

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

function validateOptionalStringArray(params: {
  sourceId: string;
  field: string;
  value: unknown;
  allowedValues: Set<string>;
  errors: string[];
}) {
  const { sourceId, field, value, allowedValues, errors } = params;
  if (value === undefined) return;
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || entry.trim().length === 0)) {
    errors.push(`${sourceId}: ${field} debe ser un arreglo de strings no vacíos si se declara`);
    return;
  }
  for (const entry of value) {
    if (!allowedValues.has(entry)) {
      errors.push(`${sourceId}: ${field} contiene valor fuera de catálogo: ${entry}`);
    }
  }
}

async function main() {
  const root = process.cwd();
  const file = path.join(
    process.cwd(),
    "content/knowledge-base/catalog/source-inventory.json",
  );
  const [inventory, domains, topics, competencies] = await Promise.all([
    readJson(file) as Promise<SourceInventory>,
    readJson(path.join(root, "content/question-bank-v4/taxonomy/domains.json")) as Promise<string[]>,
    readJson(path.join(root, "content/question-bank-v4/taxonomy/topics.json")) as Promise<string[]>,
    readJson(path.join(root, "content/question-bank-v4/taxonomy/competencies.json")) as Promise<string[]>,
  ]);

  if (!Array.isArray(inventory.sources)) {
    throw new Error("source-inventory.json: sources debe ser un arreglo");
  }

  const errors: string[] = [];
  const domainSet = new Set(domains);
  const topicSet = new Set(topics);
  const competencySet = new Set(competencies);
  for (const rawSource of inventory.sources) {
    const source = rawSource as KnowledgeSource;
    const sourceId = typeof source.sourceId === "string" ? source.sourceId : "<sourceId inválido>";
    const status = source.verificationStatus;

    if (typeof status !== "string" || !ALLOWED_SOURCE_VERIFICATION_STATUS.has(status)) {
      errors.push(
        `${sourceId}: verificationStatus debe ser needs_review|verified|superseded|rejected; recibido ${JSON.stringify(status)}`,
      );
    }

    if (source.knowledgeLevel !== undefined
      && (typeof source.knowledgeLevel !== "string" || !ALLOWED_KNOWLEDGE_LEVELS.has(source.knowledgeLevel))) {
      errors.push(`${sourceId}: knowledgeLevel debe ser A|B|C|D|E|F si se declara; recibido ${JSON.stringify(source.knowledgeLevel)}`);
    }

    validateOptionalStringArray({ sourceId, field: "compatibleDomains", value: source.compatibleDomains, allowedValues: domainSet, errors });
    validateOptionalStringArray({ sourceId, field: "compatibleTopics", value: source.compatibleTopics, allowedValues: topicSet, errors });
    validateOptionalStringArray({ sourceId, field: "compatibleCompetencies", value: source.compatibleCompetencies, allowedValues: competencySet, errors });
  }

  console.log(JSON.stringify({
    checkedSources: inventory.sources.length,
    allowedVerificationStatus: [...ALLOWED_SOURCE_VERIFICATION_STATUS],
    allowedKnowledgeLevels: [...ALLOWED_KNOWLEDGE_LEVELS],
    errors,
  }, null, 2));

  if (errors.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
