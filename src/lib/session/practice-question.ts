import type {
  PracticeQuestionOptionViewModel,
  PracticeQuestionViewModel,
} from "@/types/session";

export interface SafePracticeItemRecord {
  id: string;
  title: string | null;
  area: string | null;
  topic: string | null;
  competency: string | null;
  difficulty: number | null;
  context: string | null;
  stem: string | null;
  questionType: string | null;
  cognitiveLevel: string | null;
  sourceType: string | null;
  tags: string[] | null;
}

export function buildPracticeQuestionViewModel(
  item: SafePracticeItemRecord,
  options: PracticeQuestionOptionViewModel[],
): PracticeQuestionViewModel {
  const topicLabel = [item.area, item.topic, item.competency].filter(Boolean).join(" · ");

  return {
    id: item.id,
    title: item.title ?? "Pregunta sin título",
    area: item.area ?? "general",
    topic: item.topic ?? undefined,
    context: item.context ?? undefined,
    questionType: item.questionType ?? undefined,
    cognitiveLevel: item.cognitiveLevel ?? undefined,
    competency: item.competency ?? "competencia_no_especificada",
    stem: item.stem ?? "",
    options,
    topicLabel: topicLabel || undefined,
    expectedUserTask: "Leer el enunciado, comparar opciones y seleccionar la alternativa más consistente.",
    cognitiveIntent: "Aplicar criterio disciplinar y justificar el descarte de distractores.",
    difficulty: item.difficulty ?? undefined,
    tags: item.tags ?? undefined,
    misconceptionHints: ["Evita responder por intuición; contrasta cada opción con el enunciado."],
    sourceTruthStatus: item.sourceType === "official_source"
      ? "source_verified"
      : "synthesized_governed_unverified",
  };
}
