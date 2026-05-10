import { z } from "zod";
import { CANONICAL_TAXONOMY, TAG_REGISTRY } from "./catalogs";

const enumField = <T extends readonly string[]>(values: T) => z.enum([...values] as unknown as [T[number], ...T[number][]]);

export const taxonomySchema = z.object({
  area: enumField(CANONICAL_TAXONOMY.area),
  subarea: enumField(CANONICAL_TAXONOMY.subarea),
  competency: enumField(CANONICAL_TAXONOMY.competency),
  nivel_educativo: enumField(CANONICAL_TAXONOMY.nivel_educativo),
  tipo_item: enumField(CANONICAL_TAXONOMY.tipo_item),
  nivel_cognitivo: enumField(CANONICAL_TAXONOMY.nivel_cognitivo),
  dificultad: enumField(CANONICAL_TAXONOMY.dificultad),
  targetPosition: enumField(CANONICAL_TAXONOMY.targetPosition),
  targetRole: enumField(CANONICAL_TAXONOMY.targetRole),
  applicantProfile: enumField(CANONICAL_TAXONOMY.applicantProfile),
});

export const tagCategorySchema = z.enum([
  "pedagogical_strategy",
  "misconception",
  "cognitive_process",
  "content_topic",
  "risk_flag",
  "profile_context",
]);

export const tagRegistrySchema = z.object({
  pedagogical_strategy: z.array(enumField(TAG_REGISTRY.pedagogical_strategy)),
  misconception: z.array(enumField(TAG_REGISTRY.misconception)),
  cognitive_process: z.array(enumField(TAG_REGISTRY.cognitive_process)),
  content_topic: z.array(enumField(TAG_REGISTRY.content_topic)),
  risk_flag: z.array(enumField(TAG_REGISTRY.risk_flag)),
  profile_context: z.array(enumField(TAG_REGISTRY.profile_context)),
});

export type CanonicalTaxonomy = z.infer<typeof taxonomySchema>;
