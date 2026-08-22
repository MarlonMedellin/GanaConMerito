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
  const payload = buildPracticeQuestionViewModel(item, item.options);

  return NextResponse.json(
    payload,
    { status: 200 },
  );
}
