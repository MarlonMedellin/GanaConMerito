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
  source: z.object({
    reference: z.string().trim().min(1),
    locator: z.string().trim().min(1).optional(),
    url: z.string().url().optional(),
  }).strict(),
  estimatedDifficulty: z.enum(["low", "medium", "high"]),
}).strict().superRefine((item, ctx) => {
  if (item.scope === "opec_specific" && !item.opecId) {
    ctx.addIssue({ code: "custom", path: ["opecId"], message: "opecId es obligatorio para scope opec_specific" });
  }
  if (item.scope === "general" && item.opecId) {
    ctx.addIssue({ code: "custom", path: ["opecId"], message: "opecId debe omitirse o ser null para scope general" });
  }
  const optionTexts = Object.values(item.options).map((value) => value.trim().toLowerCase());
  if (new Set(optionTexts).size !== optionTexts.length) {
    ctx.addIssue({ code: "custom", path: ["options"], message: "Las opciones deben ser únicas" });
  }
  if (!item.source.locator && !item.source.url && /decreto|ley|resolución|resolucion|artículo|articulo/i.test(item.source.reference)) {
    ctx.addIssue({ code: "custom", path: ["source"], message: "Una fuente normativa requiere locator o url" });
  }
});

export type V4Item = z.infer<typeof v4ItemSchema>;
