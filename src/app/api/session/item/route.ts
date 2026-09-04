import { NextResponse } from "next/server";
import { V4QuestionRepository } from "../../../../lib/question-bank/v4-question-repository";
import { buildPracticeQuestionViewModel } from "../../../../lib/session/practice-question";
import { requireOwnedSession } from "../../../../lib/supabase/guards";

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

  const repository = new V4QuestionRepository();
  const item = await repository.getPracticeQuestion(itemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  const modeParam = searchParams.get("mode") as "guided" | "simulation" | "review" | null;
  const mode = modeParam && ["guided", "simulation", "review"].includes(modeParam) ? modeParam : "guided";
  const profileParam = searchParams.get("profile") as "socratic" | "direct" | "brief" | null;
  const profile = profileParam && ["socratic", "direct", "brief"].includes(profileParam) ? profileParam : "socratic";

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
      id: `att-${sessionId}-${item.id}`,
      phase: "evaluating" as const,
      mode,
      assistanceUsed: false,
    },
    tutor: {
      preAnswerEnabled: mode === "guided",
      allowedProfiles: ["socratic", "direct", "brief"] as const,
      selectedProfile: profile,
    },
  };

  const payload = {
    ...viewModel,
    ...publicContract,
  };

  return NextResponse.json(
    payload,
    { status: 200 },
  );
}
