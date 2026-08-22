import { z } from "zod";

export const v4OptionSchema = z.object({
  A: z.string().trim().min(1),
  B: z.string().trim().min(1),
  C: z.string().trim().min(1),
  D: z.string().trim().min(1),
}).strict();

export const v4ItemSchema = z.object({
  id: z.string().regex(/^(DOC|GEN)-\d{6}$/),
  scope: z.enum(["general", "opec_specific"]),
  opecId: z.string().trim().min(1).nullable().optional(),
  // domain / topic / competency / questionType / cognitiveLevel son vocabulario
  // controlado: deben pertenecer a content/question-bank-v4/taxonomy/*.json.
  // La verificación autoritativa la ejecuta scripts/validate-question-bank-v4.ts,
  // que lee esos catálogos y falla ante valores fuera de vocabulario.
  domain: z.string().trim().min(1),
  topic: z.string().trim().min(1),
  competency: z.string().trim().min(1),
  questionType: z.string().trim().min(1),
  cognitiveLevel: z.string().trim().min(1),
  context: z.string().trim().min(1),
  stem: z.string().trim().min(1),
  options: v4OptionSchema,
  correctAnswer: z.enum(["A", "B", "C", "D"]),
  explanations: v4OptionSchema,
  hint: z.string().trim().min(1),
  learningNote: z.string().trim().min(1),
  // El ítem persiste solo `reference`. El locator/url de verificación vive en
  // `editorialRunContext` durante fábrica/auditoría (ver skills y CONTRATO-EDITORIAL-V4.md).
  source: z.object({
    reference: z.string().trim().min(1),
  }).strict(),
  estimatedDifficulty: z.enum(["low", "medium", "high"]),
}).strict().superRefine((item, ctx) => {
  if (item.scope === "opec_specific" && !item.opecId) {
    ctx.addIssue({ code: "custom", path: ["opecId"], message: "opecId es obligatorio para scope opec_specific" });
  }
  if (item.scope === "general" && item.opecId !== undefined) {
    ctx.addIssue({ code: "custom", path: ["opecId"], message: "opecId debe omitirse para scope general (no usar null)" });
  }
  const optionTexts = Object.values(item.options).map((value) => value.trim().toLowerCase());
  if (new Set(optionTexts).size !== optionTexts.length) {
    ctx.addIssue({ code: "custom", path: ["options"], message: "Las opciones deben ser únicas" });
  }
});

export type V4Item = z.infer<typeof v4ItemSchema>;
