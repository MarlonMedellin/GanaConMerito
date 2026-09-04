import { NextResponse } from "next/server";
import { defaultAttemptStore } from "../../../../domain/session/attempt-service";
import { V4QuestionRepository } from "../../../../lib/question-bank/v4-question-repository";
import { buildPracticeQuestionViewModel } from "../../../../lib/session/practice-question";
import { requireOwnedSession } from "../../../../lib/supabase/guards";
import type { PracticeMode, TutorProfile } from "../../../../types/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");
  const sessionId = searchParams.get("sessionId");

  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const auth = await requireOwnedSession({ sessionId });
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { session, profile } = auth;
  const repository = new V4QuestionRepository();
  const item = await repository.getPracticeQuestion(itemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  // Server-authoritative mode resolution from session record (fallback to guided)
  const sessionMode: PracticeMode = session.mode === "exam" || session.mode === "simulation"
    ? "simulation"
    : session.mode === "review"
    ? "review"
    : "guided";

  const profileParam = searchParams.get("profile");
  const selectedProfile: TutorProfile = typeof profileParam === "string" && ["socratic", "direct", "brief"].includes(profileParam)
    ? (profileParam as TutorProfile)
    : "socratic";

  // Check existing or create new authoritative attempt
  let attemptRecord = await defaultAttemptStore.getLatestAttemptForSessionItem(sessionId, itemId);
  if (!attemptRecord || attemptRecord.phase === "expired") {
    attemptRecord = await defaultAttemptStore.createAttempt({
      sessionId,
      itemId,
      profileId: profile.id,
      mode: sessionMode,
    });
  }

  const viewModel = buildPracticeQuestionViewModel(item, item.options);
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
