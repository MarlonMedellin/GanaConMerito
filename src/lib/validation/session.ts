import { z } from "zod";
import { v4ItemIdSchema } from "../../domain/content/v4-contract";

export const startSessionSchema = z.object({
  mode: z.enum(["practice", "exam", "review"]),
  area: z.string().min(1).optional(),
  competency: z.string().min(1).optional(),
});

export const advanceSessionSchema = z.object({
  attemptId: z.string().uuid(),
  clientRequestId: z.string().uuid(),
  sessionId: z.string().uuid(),
  itemId: v4ItemIdSchema,
  selectedOption: z.enum(["A", "B", "C", "D"]),
  userRationale: z.string().min(1).optional(),
  responseTimeMs: z.number().int().nonnegative().optional(),
  confidenceSelfReport: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]).optional(),
}).strict();

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type AdvanceSessionInput = z.infer<typeof advanceSessionSchema>;
