import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const familySchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  status: z.string().min(1),
  profileCatalogPath: z.string().min(1),
});

const profileSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  legacyApplicantProfile: z.string().nullable().optional(),
  status: z.string().min(1),
});

const profileCatalogSchema = z.object({
  familyCode: z.string().min(1),
  profiles: z.array(profileSchema),
});

const opecSourceSchema = z.object({
  reference: z.string().min(1),
  url: z.string().nullable().optional(),
  retrievedAt: z.string().nullable().optional(),
});

const opecSchema = z.object({
  sourceSystem: z.string().min(1),
  externalOpecId: z.string().min(1),
  familyCode: z.string().min(1),
  profileCode: z.string().min(1),
  convocationCode: z.string().nullable().optional(),
  entityName: z.string().nullable().optional(),
  positionName: z.string().min(1),
  status: z.enum(["draft", "active", "inactive"]),
  verificationStatus: z.enum(["needs_review", "verified", "rejected"]),
  source: opecSourceSchema,
  metadata: z.record(z.string(), z.unknown()),
});

const opecCatalogSchema = z.object({
  schemaVersion: z.literal(1),
  opecs: z.array(opecSchema),
});

const knowledgeSourceSchema = z.object({
  sourceId: z.string().min(1),
  sourceType: z.enum(["normative", "academic", "technical", "guide", "theme_map"]),
  title: z.string().min(1),
  reference: z.string().min(1),
  verificationStatus: z.string().min(1),
}).passthrough();

const sourceInventorySchema = z.object({
  schemaVersion: z.literal(1),
  status: z.string().min(1),
  notes: z.array(z.string()),
  sources: z.array(knowledgeSourceSchema),
});

const familyTargetSchema = z.object({
  type: z.literal("family"),
  familyCode: z.string().min(1),
});

const profileTargetSchema = z.object({
  type: z.literal("profile"),
  familyCode: z.string().min(1),
  profileCode: z.string().min(1),
});

const opecTargetSchema = z.object({
  type: z.literal("opec"),
  sourceSystem: z.string().min(1),
  externalOpecId: z.string().min(1),
});

const itemTargetSchema = z.discriminatedUnion("type", [
  familyTargetSchema,
  profileTargetSchema,
  opecTargetSchema,
]);

const itemMappingSchema = z.object({
  itemId: z.string().min(1),
  targets: z.array(itemTargetSchema).min(1),
  reviewStatus: z.enum(["candidate", "reviewed", "approved", "rejected"]),
  evidence: z.array(z.string().min(1)),
  reviewedBy: z.string().nullable().optional(),
  reviewedAt: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const itemTargetMapSchema = z.object({
  schemaVersion: z.literal(1),
  bank: z.string().min(1),
  mappings: z.array(itemMappingSchema),
});

const v4ManifestSchema = z.object({
  bank: z.string().min(1),
  corpus: z.object({
    ids: z.array(z.string().min(1)),
  }),
});

type ValidationError = { file: string; issue: string };

async function jsonFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json") && !entry.name.endsWith(".schema.json"))
    .map((entry) => path.join(directory, entry.name))
    .sort();
}

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join("; ");
}

function opecIdentity(sourceSystem: string, externalOpecId: string): string {
  return `${sourceSystem}::${externalOpecId}`;
}

function targetIdentity(target: z.infer<typeof itemTargetSchema>): string {
  if (target.type === "family") return `family:${target.familyCode}`;
  if (target.type === "profile") return `profile:${target.familyCode}:${target.profileCode}`;
  return `opec:${target.sourceSystem}:${target.externalOpecId}`;
}

async function main() {
  const root = process.cwd();
  const targeting = path.join(root, "content/targeting");
  const knowledge = path.join(root, "content/knowledge-base");
  const errors: ValidationError[] = [];

  const familyFiles = await jsonFiles(path.join(targeting, "families"));
  const familyCodes = new Set<string>();

  for (const file of familyFiles) {
    const relative = path.relative(root, file);
    try {
      const family = familySchema.parse(await readJson(file));
      if (familyCodes.has(family.code)) {
        errors.push({ file: relative, issue: `familyCode duplicado: ${family.code}` });
      }
      familyCodes.add(family.code);
    } catch (error) {
      errors.push({
        file: relative,
        issue: error instanceof z.ZodError ? formatZodError(error) : String(error),
      });
    }
  }

  const profileFiles = await jsonFiles(path.join(targeting, "profiles"));
  const profileKeys = new Set<string>();

  for (const file of profileFiles) {
    const relative = path.relative(root, file);
    try {
      const catalog = profileCatalogSchema.parse(await readJson(file));
      if (!familyCodes.has(catalog.familyCode)) {
        errors.push({ file: relative, issue: `familyCode inexistente: ${catalog.familyCode}` });
      }

      for (const profile of catalog.profiles) {
        const key = `${catalog.familyCode}:${profile.code}`;
        if (profileKeys.has(key)) {
          errors.push({ file: relative, issue: `profileCode duplicado en familia: ${key}` });
        }
        profileKeys.add(key);
      }
    } catch (error) {
      errors.push({
        file: relative,
        issue: error instanceof z.ZodError ? formatZodError(error) : String(error),
      });
    }
  }

  const opecFile = path.join(targeting, "opecs/catalog.json");
  const opecIdentities = new Set<string>();
  let opecCount = 0;

  try {
    const catalog = opecCatalogSchema.parse(await readJson(opecFile));
    const fullIdentities = new Set<string>();
    opecCount = catalog.opecs.length;

    for (const opec of catalog.opecs) {
      if (!familyCodes.has(opec.familyCode)) {
        errors.push({
          file: path.relative(root, opecFile),
          issue: `OPEC ${opec.externalOpecId}: familyCode inexistente ${opec.familyCode}`,
        });
      }

      if (!profileKeys.has(`${opec.familyCode}:${opec.profileCode}`)) {
        errors.push({
          file: path.relative(root, opecFile),
          issue: `OPEC ${opec.externalOpecId}: profileCode ${opec.profileCode} no pertenece a ${opec.familyCode}`,
        });
      }

      if (opec.status === "active" && opec.verificationStatus !== "verified") {
        errors.push({
          file: path.relative(root, opecFile),
          issue: `OPEC ${opec.externalOpecId}: active requiere verificationStatus=verified`,
        });
      }

      const canonicalIdentity = opecIdentity(opec.sourceSystem, opec.externalOpecId);
      if (opecIdentities.has(canonicalIdentity)) {
        errors.push({
          file: path.relative(root, opecFile),
          issue: `identidad OPEC externa duplicada: ${canonicalIdentity}`,
        });
      }
      opecIdentities.add(canonicalIdentity);

      const fullIdentity = [opec.sourceSystem, opec.externalOpecId, opec.convocationCode ?? ""].join("::");
      if (fullIdentities.has(fullIdentity)) {
        errors.push({
          file: path.relative(root, opecFile),
          issue: `identidad OPEC duplicada: ${fullIdentity}`,
        });
      }
      fullIdentities.add(fullIdentity);
    }
  } catch (error) {
    errors.push({
      file: path.relative(root, opecFile),
      issue: error instanceof z.ZodError ? formatZodError(error) : String(error),
    });
  }

  const inventoryFile = path.join(knowledge, "catalog/source-inventory.json");
  let sourceCount = 0;
  try {
    const inventory = sourceInventorySchema.parse(await readJson(inventoryFile));
    const sourceIds = new Set<string>();
    sourceCount = inventory.sources.length;
    for (const source of inventory.sources) {
      if (sourceIds.has(source.sourceId)) {
        errors.push({
          file: path.relative(root, inventoryFile),
          issue: `sourceId duplicado: ${source.sourceId}`,
        });
      }
      sourceIds.add(source.sourceId);
    }
  } catch (error) {
    errors.push({
      file: path.relative(root, inventoryFile),
      issue: error instanceof z.ZodError ? formatZodError(error) : String(error),
    });
  }

  const manifestFile = path.join(root, "content/question-bank-v4/MANIFEST.json");
  let v4Bank = "question-bank-v4";
  const v4ItemIds = new Set<string>();
  try {
    const manifest = v4ManifestSchema.parse(await readJson(manifestFile));
    v4Bank = manifest.bank;
    for (const id of manifest.corpus.ids) v4ItemIds.add(id);
  } catch (error) {
    errors.push({
      file: path.relative(root, manifestFile),
      issue: error instanceof z.ZodError ? formatZodError(error) : String(error),
    });
  }

  const itemMapFiles = await jsonFiles(path.join(targeting, "item-maps"));
  let itemMappingCount = 0;

  for (const file of itemMapFiles) {
    const relative = path.relative(root, file);
    try {
      const map = itemTargetMapSchema.parse(await readJson(file));
      const seenItems = new Set<string>();
      itemMappingCount += map.mappings.length;

      if (map.bank !== v4Bank) {
        errors.push({ file: relative, issue: `bank no soportado por este gate: ${map.bank}` });
      }

      for (const mapping of map.mappings) {
        if (seenItems.has(mapping.itemId)) {
          errors.push({ file: relative, issue: `itemId duplicado en mapa: ${mapping.itemId}` });
        }
        seenItems.add(mapping.itemId);

        if (map.bank === v4Bank && !v4ItemIds.has(mapping.itemId)) {
          errors.push({ file: relative, issue: `itemId no existe en MANIFEST V4: ${mapping.itemId}` });
        }

        if (mapping.reviewStatus === "approved" && mapping.evidence.length === 0) {
          errors.push({ file: relative, issue: `${mapping.itemId}: approved requiere evidence` });
        }

        const seenTargets = new Set<string>();
        for (const target of mapping.targets) {
          const identity = targetIdentity(target);
          if (seenTargets.has(identity)) {
            errors.push({ file: relative, issue: `${mapping.itemId}: target duplicado ${identity}` });
          }
          seenTargets.add(identity);

          if (target.type === "family" && !familyCodes.has(target.familyCode)) {
            errors.push({
              file: relative,
              issue: `${mapping.itemId}: family target inexistente ${target.familyCode}`,
            });
          }

          if (target.type === "profile" && !profileKeys.has(`${target.familyCode}:${target.profileCode}`)) {
            errors.push({
              file: relative,
              issue: `${mapping.itemId}: profile target ${target.profileCode} no pertenece a ${target.familyCode}`,
            });
          }

          if (target.type === "opec" && !opecIdentities.has(opecIdentity(target.sourceSystem, target.externalOpecId))) {
            errors.push({
              file: relative,
              issue: `${mapping.itemId}: OPEC target inexistente ${target.sourceSystem}::${target.externalOpecId}`,
            });
          }
        }
      }
    } catch (error) {
      errors.push({
        file: relative,
        issue: error instanceof z.ZodError ? formatZodError(error) : String(error),
      });
    }
  }

  console.log(JSON.stringify({
    validation: "knowledge-targeting",
    families: familyCodes.size,
    profiles: profileKeys.size,
    opecs: opecCount,
    knowledgeSources: sourceCount,
    itemMappings: itemMappingCount,
    v4ManifestItems: v4ItemIds.size,
    valid: errors.length === 0,
    errors,
  }, null, 2));

  if (errors.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
