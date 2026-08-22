import { z } from "zod";

export const startSessionSchema = z.object({
  mode: z.enum(["practice", "exam", "review"]),
  area: z.string().min(1).optional(),
  competency: z.string().min(1).optional(),
});

export const advanceSessionSchema = z.object({
  sessionId: z.string().uuid(),
  itemId: z.string().uuid(),
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
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type AdvanceSessionInput = z.infer<typeof advanceSessionSchema>;
