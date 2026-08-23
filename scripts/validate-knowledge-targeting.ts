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

type ValidationError = { file: string; issue: string };

async function jsonFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
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
  const profileFamilyByCode = new Map<string, Set<string>>();

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
        const families = profileFamilyByCode.get(profile.code) ?? new Set<string>();
        families.add(catalog.familyCode);
        profileFamilyByCode.set(profile.code, families);
      }
    } catch (error) {
      errors.push({
        file: relative,
        issue: error instanceof z.ZodError ? formatZodError(error) : String(error),
      });
    }
  }

  const opecFile = path.join(targeting, "opecs/catalog.json");
  try {
    const catalog = opecCatalogSchema.parse(await readJson(opecFile));
    const identities = new Set<string>();

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

      const identity = [opec.sourceSystem, opec.externalOpecId, opec.convocationCode ?? ""].join("::");
      if (identities.has(identity)) {
        errors.push({
          file: path.relative(root, opecFile),
          issue: `identidad OPEC duplicada: ${identity}`,
        });
      }
      identities.add(identity);
    }
  } catch (error) {
    errors.push({
      file: path.relative(root, opecFile),
      issue: error instanceof z.ZodError ? formatZodError(error) : String(error),
    });
  }

  const inventoryFile = path.join(knowledge, "catalog/source-inventory.json");
  try {
    const inventory = sourceInventorySchema.parse(await readJson(inventoryFile));
    const sourceIds = new Set<string>();
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

  console.log(JSON.stringify({
    validation: "knowledge-targeting",
    families: familyCodes.size,
    profiles: profileKeys.size,
    valid: errors.length === 0,
    errors,
  }, null, 2));

  if (errors.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
