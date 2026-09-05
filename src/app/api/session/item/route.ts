import { z } from "zod";
import { NextResponse } from "next/server";
import { defaultAttemptStore } from "../../../../domain/session/attempt-service";
import { V4QuestionRepository } from "../../../../lib/question-bank/v4-question-repository";
import { buildPracticeQuestionViewModel } from "../../../../lib/session/practice-question";
import { requireOwnedSession } from "../../../../lib/supabase/guards";
import type { PracticeMode, TutorProfile } from "../../../../types/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = z.object({sessionId: z.string().uuid(), attemptId: z.string().uuid().optional()}).safeParse({
    sessionId: searchParams.get("sessionId"), attemptId: searchParams.get("attemptId") ?? undefined,
  });
  if (!parsed.success) return NextResponse.json({error: "Invalid attempt request"}, {status:400});
  const {sessionId, attemptId} = parsed.data;
  const auth = await requireOwnedSession({ sessionId });
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { profile } = auth;
  const attemptRecord = attemptId ? await defaultAttemptStore.getAttempt(attemptId) : await defaultAttemptStore.getActiveAttempt(sessionId);
  if (!attemptRecord || attemptRecord.sessionId !== sessionId || attemptRecord.profileId !== profile.id) {
    return NextResponse.json({error: "Attempt not found"}, {status:404});
  }
  if (attemptRecord.phase === "expired" || (attemptRecord.phase === "evaluating" && Date.parse(attemptRecord.expiresAt) <= Date.now())) return NextResponse.json({error:"Attempt expired"}, {status:409});
  const repository = new V4QuestionRepository();
  const item = await repository.getPracticeQuestion(attemptRecord.itemId);
  if (!item) return NextResponse.json({error:"Item not found"}, {status:404});
  const selectedProfile = "socratic";
  const viewModel = buildPracticeQuestionViewModel(item, item.options);
  if (attemptRecord.mode === "simulation") {
    delete viewModel.hint;
    delete viewModel.misconceptionHints;
  }
  const publicContract = {
    schemaVersion: "vNext-1.0",
    item: {
      id: item.id,
      domain: item.area ?? "general",
      competency: item.competency ?? "competencia_no_especificada",
      context: item.context ?? "",
      stem: item.stem ?? "",
      options: item.options.map((opt) => ({ id: opt.key, text: opt.text })),
    },
    attempt: {
      id: attemptRecord.attemptId,
      phase: attemptRecord.phase,
      mode: attemptRecord.mode,
      assistanceUsed: attemptRecord.assistanceUsed,
    },
    tutor: {
      preAnswerEnabled: attemptRecord.mode === "guided" && attemptRecord.phase === "evaluating",
      allowedProfiles: ["socratic", "direct", "brief"] as const,
      selectedProfile,
    },
  };

  const payload = {
    ...viewModel,
    ...publicContract,
  };

  return NextResponse.json(payload, { status: 200 });
}
