import fs from "node:fs/promises";
import path from "node:path";

const ALLOWED_SOURCE_VERIFICATION_STATUS = new Set([
  "needs_review",
  "verified",
  "rejected",
]);

type KnowledgeSource = {
  sourceId?: unknown;
  verificationStatus?: unknown;
};

type SourceInventory = {
  sources?: unknown;
};

async function main() {
  const file = path.join(
    process.cwd(),
    "content/knowledge-base/catalog/source-inventory.json",
  );
  const inventory = JSON.parse(await fs.readFile(file, "utf8")) as SourceInventory;

  if (!Array.isArray(inventory.sources)) {
    throw new Error("source-inventory.json: sources debe ser un arreglo");
  }

  const errors: string[] = [];
  for (const rawSource of inventory.sources) {
    const source = rawSource as KnowledgeSource;
    const sourceId = typeof source.sourceId === "string" ? source.sourceId : "<sourceId inválido>";
    const status = source.verificationStatus;

    if (typeof status !== "string" || !ALLOWED_SOURCE_VERIFICATION_STATUS.has(status)) {
      errors.push(
        `${sourceId}: verificationStatus debe ser needs_review|verified|rejected; recibido ${JSON.stringify(status)}`,
      );
    }
  }

  console.log(JSON.stringify({
    checkedSources: inventory.sources.length,
    allowedVerificationStatus: [...ALLOWED_SOURCE_VERIFICATION_STATUS],
    errors,
  }, null, 2));

  if (errors.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
