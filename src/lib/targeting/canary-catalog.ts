import { z } from "zod";

export const CANARY_REUSABLE_PROFILE_CODES = [
  "rector_director_rural",
  "coordinador",
  "docente_aula_preescolar",
  "docente_aula_basica_primaria",
  "docente_aula_secundaria_media",
  "docente_orientador",
] as const;

const canaryOpecEntrySchema = z.object({
  sourceSystem: z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{2,64}$/),
  externalOpecId: z.string().trim().regex(/^[A-Za-z0-9._-]{1,128}$/),
  convocationCode: z.string().trim().min(1).max(128).optional(),
  professionalProfileCode: z.enum(CANARY_REUSABLE_PROFILE_CODES),
  positionName: z.string().trim().min(2).max(240),
  verificationStatus: z.literal("verified"),
}).strict();

const canaryOpecCatalogSchema = z.array(canaryOpecEntrySchema).max(500);

export type CanaryOpecEntry = z.infer<typeof canaryOpecEntrySchema>;

export interface CanaryOpecOption extends CanaryOpecEntry {
  opecKey: string;
}

export function buildCanaryOpecKey(entry: Pick<CanaryOpecEntry, "sourceSystem" | "externalOpecId">) {
  return `${entry.sourceSystem.toLowerCase()}:${entry.externalOpecId}`;
}

export function parseCanaryOpecCatalog(raw: string | undefined): CanaryOpecOption[] {
  if (!raw?.trim()) return [];

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error("GCM_CANARY_OPEC_CATALOG_JSON must be valid JSON.");
  }

  const parsed = canaryOpecCatalogSchema.safeParse(json);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(" | ");
    throw new Error(`Invalid GCM_CANARY_OPEC_CATALOG_JSON: ${detail}`);
  }

  const seenKeys = new Set<string>();
  const options = parsed.data.map((entry) => {
    const opecKey = buildCanaryOpecKey(entry);
    if (seenKeys.has(opecKey)) {
      throw new Error(`Duplicate canary OPEC identity: ${opecKey}`);
    }
    seenKeys.add(opecKey);
    return { ...entry, opecKey };
  });

  return options.sort((left, right) =>
    left.positionName.localeCompare(right.positionName, "es") || left.opecKey.localeCompare(right.opecKey),
  );
}

export function resolveCanaryOpecOption(catalog: CanaryOpecOption[], opecKey: string | null | undefined) {
  if (!opecKey) return null;
  return catalog.find((entry) => entry.opecKey === opecKey) ?? null;
}
