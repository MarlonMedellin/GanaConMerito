import type {
  PracticeQuestionOptionViewModel,
  PracticeQuestionViewModel,
} from "@/types/session";

export interface SafePracticeItemRecord {
  id: string;
  title: string | null;
  area: string | null;
  subarea: string | null;
  competency: string | null;
  difficulty: number | null;
  stem: string | null;
  source_type: string | null;
  tags: string[] | null;
}

export function buildPracticeQuestionViewModel(
  item: SafePracticeItemRecord,
  options: PracticeQuestionOptionViewModel[],
): PracticeQuestionViewModel {
  const topicLabel = [item.area, item.subarea, item.competency].filter(Boolean).join(" · ");

  return {
    id: item.id,
    title: item.title ?? "Pregunta sin título",
    area: item.area ?? "general",
    subarea: item.subarea ?? undefined,
    competency: item.competency ?? "competencia_no_especificada",
    stem: item.stem ?? "",
    options,
    topicLabel: topicLabel || undefined,
    expectedUserTask: "Leer el enunciado, comparar opciones y seleccionar la alternativa más consistente.",
    cognitiveIntent: "Aplicar criterio disciplinar y justificar el descarte de distractores.",
    difficulty: item.difficulty ?? undefined,
    tags: item.tags ?? undefined,
    misconceptionHints: ["Evita responder por intuición; contrasta cada opción con el enunciado."],
    sourceTruthStatus: item.source_type === "official_source"
      ? "source_verified"
      : "synthesized_governed_unverified",
  };
}
