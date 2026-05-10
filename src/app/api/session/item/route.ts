import { NextResponse } from "next/server";
import { applyActiveItemBankFilters, runWithActiveItemBankFallback } from "../../../../lib/supabase/active-item-bank";
import { requireOwnedSession } from "../../../../lib/supabase/guards";
import type { PracticeQuestionViewModel } from "../../../../types/session";

interface SessionItemRecord {
  id: string;
  title: string | null;
  area: string | null;
  subarea: string | null;
  competency: string | null;
  difficulty: number | null;
  stem: string | null;
  correct_option: string | null;
  explanation: string | null;
  source_type: string | null;
  source_path: string | null;
  tags: string[] | null;
}

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

  const { supabase } = auth;
  const { data: item, error: itemError } = await runWithActiveItemBankFallback<SessionItemRecord>((source) =>
    applyActiveItemBankFilters(
      supabase
        .from(source)
        .select("id, title, area, subarea, competency, difficulty, stem, correct_option, explanation, source_type, source_path, tags")
        .eq("id", itemId),
      source,
    ).single(),
  );

  if (itemError || !item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const { data: options, error: optionsError } = await supabase
    .from("item_options")
    .select("option_key, option_text")
    .eq("item_id", itemId)
    .order("option_key", { ascending: true });

  if (optionsError) {
    return NextResponse.json({ error: "Options not found" }, { status: 404 });
  }

  const topicLabel = [item.area, item.subarea, item.competency].filter(Boolean).join(" · ");
  const payload: PracticeQuestionViewModel = {
    id: item.id,
    title: item.title ?? "Pregunta sin título",
    area: item.area ?? "general",
    subarea: item.subarea ?? undefined,
    competency: item.competency ?? "competencia_no_especificada",
    stem: item.stem ?? "",
    options: options.map((option) => ({ key: option.option_key as "A" | "B" | "C" | "D", text: option.option_text })),
    topicLabel: topicLabel || undefined,
    expectedUserTask: "Leer el enunciado, comparar opciones y seleccionar la alternativa más consistente.",
    cognitiveIntent: "Aplicar criterio disciplinar y justificar el descarte de distractores.",
    difficulty: item.difficulty ?? undefined,
    tags: item.tags ?? undefined,
    misconceptionHints: ["Evita responder por intuición; contrasta cada opción con el enunciado."],
    rationale: item.explanation ?? undefined,
    sourceTruthStatus: item.source_type === "official_source" ? "source_verified" : "synthesized_governed_unverified",
  };

  return NextResponse.json(
    payload,
    { status: 200 },
  );
}
