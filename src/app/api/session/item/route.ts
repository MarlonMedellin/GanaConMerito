import { NextResponse } from "next/server";
import { buildPracticeQuestionViewModel, type SafePracticeItemRecord } from "../../../../lib/session/practice-question";
import { applyActiveItemBankFilters, runWithActiveItemBankFallback } from "../../../../lib/supabase/active-item-bank";
import { getSupabaseAdminClient } from "../../../../lib/supabase/admin";
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

  const admin = getSupabaseAdminClient();
  const { data: item, error: itemError } = await runWithActiveItemBankFallback<SafePracticeItemRecord>((source) =>
    applyActiveItemBankFilters(
      admin
        .from(source)
        .select("id, title, area, subarea, competency, difficulty, stem, source_type, tags")
        .eq("id", itemId),
      source,
    ).single(),
  );

  if (itemError || !item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const { data: options, error: optionsError } = await admin
    .from("item_options")
    .select("option_key, option_text")
    .eq("item_id", itemId)
    .order("option_key", { ascending: true });

  if (optionsError) {
    return NextResponse.json({ error: "Options not found" }, { status: 404 });
  }

  const payload = buildPracticeQuestionViewModel(
    item,
    options.map((option) => ({
      key: option.option_key as "A" | "B" | "C" | "D",
      text: option.option_text,
    })),
  );

  return NextResponse.json(
    payload,
    { status: 200 },
  );
}
