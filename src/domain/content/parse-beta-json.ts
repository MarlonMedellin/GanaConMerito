import {
  type ContentItem,
  type ItemArea,
  type ItemOption,
  type OptionKey,
  type ParsedContentSummary,
} from "../../types/content";
import { validateOptions } from "./validate-item";
import type { ContentValidationResult } from "./parse-md";

const VALID_AREAS = [
  "matematicas",
  "pedagogia",
  "normatividad",
  "gestion",
  "lectura_critica",
  "competencias_ciudadanas",
] as const;

const DIFFICULTY_BY_LABEL: Record<string, number> = {
  baja: 0.25,
  facil: 0.25,
  fácil: 0.25,
  media: 0.5,
  moderada: 0.5,
  alta: 0.75,
  dificil: 0.75,
  difícil: 0.75,
};

type BetaJsonItem = {
  id?: unknown;
  id_item?: unknown;
  area?: unknown;
  area_canonica_beta?: unknown;
  subarea?: unknown;
  tema?: unknown;
  competencia?: unknown;
  competency?: unknown;
  dificultad?: unknown;
  dificultad_estimada?: unknown;
  contexto?: unknown;
  enunciado?: unknown;
  opciones?: unknown;
  respuestaCorrecta?: unknown;
  respuesta_correcta?: unknown;
  clave?: unknown;
  explicacionGeneral?: unknown;
  explicacion?: unknown;
  justificacionGeneral?: unknown;
  justificacionClave?: unknown;
  justificacion_clave?: unknown;
  normativaRefs?: unknown;
  estado_beta?: unknown;
  estado?: unknown;
  perfil_sugerido_beta?: unknown;
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseDifficulty(value: unknown) {
  if (typeof value === "number") {
    return Math.max(0, Math.min(1, value));
  }

  const label = asString(value).toLowerCase();
  return DIFFICULTY_BY_LABEL[label] ?? 0.5;
}

function parseOptions(value: unknown): ItemOption[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  return Object.entries(value as Record<string, unknown>)
    .map(([key, text]) => ({
      key: key.toUpperCase() as OptionKey,
      text: asString(text),
    }))
    .filter((option) => ["A", "B", "C", "D"].includes(option.key));
}

function parseNormativeRefs(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => asString(entry)).filter(Boolean);
}

function buildExplanation(payload: BetaJsonItem) {
  return [
    asString(payload.explicacionGeneral),
    asString(payload.explicacion),
    asString(payload.justificacionGeneral),
    asString(payload.justificacionClave),
    asString(payload.justificacion_clave),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function parseBetaJsonItem(rawJson: string): ContentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let payload: BetaJsonItem;

  try {
    payload = JSON.parse(rawJson) as BetaJsonItem;
  } catch {
    return { ok: false, errors: ["JSON beta inválido."], warnings };
  }

  const id = asString(payload.id_item) || asString(payload.id);
  const slug = slugify(id);
  const area = asString(payload.area_canonica_beta) || asString(payload.area);
  const competency = asString(payload.competency) || asString(payload.competencia) || asString(payload.tema);
  const context = asString(payload.contexto);
  const question = asString(payload.enunciado);
  const stem = [context, question].filter(Boolean).join("\n\n");
  const options = parseOptions(payload.opciones);
  const correctOption = (
    asString(payload.respuestaCorrecta) ||
    asString(payload.respuesta_correcta) ||
    asString(payload.clave)
  ).toUpperCase() as OptionKey;
  const explanation = buildExplanation(payload);

  if (!id) errors.push("Falta id_item/id.");
  if (!VALID_AREAS.includes(area as ItemArea)) errors.push(`area inválida o faltante: ${area || "missing"}.`);
  if (!competency) errors.push("Falta competency/competencia/tema.");
  if (!stem) errors.push("Falta contexto/enunciado.");
  if (!correctOption) errors.push("Falta respuestaCorrecta/clave.");
  if (!explanation) errors.push("Falta explicación/justificación.");

  const optionValidation = validateOptions(options);
  errors.push(...optionValidation.errors);
  warnings.push(...optionValidation.warnings);

  if (correctOption && !options.find((option) => option.key === correctOption)) {
    errors.push("correctOption debe existir dentro de las opciones declaradas.");
  }

  const parsed: ParsedContentSummary = {
    id,
    slug,
    title: question.slice(0, 80) || id,
    area,
    competency,
    difficulty: parseDifficulty(payload.dificultad ?? payload.dificultad_estimada),
    correctOption: correctOption || "A",
    optionCount: options.length,
  };

  if (errors.length > 0) {
    return { ok: false, errors, warnings, parsed };
  }

  const item: ContentItem = {
    id,
    slug,
    title: parsed.title,
    area: area as ItemArea,
    subarea: asString(payload.subarea) || asString(payload.tema) || undefined,
    examType: "cnsc_docente_beta",
    competency,
    difficulty: parsed.difficulty,
    itemType: "multiple_choice",
    stem,
    options,
    correctOption,
    explanation,
    normativeRefs: parseNormativeRefs(payload.normativaRefs),
    published: payload.estado_beta === "PILOTAJE_V1" || payload.estado === "LISTO_PARA_BANCO" || payload.estado === "BANCO_OPERACIONAL",
    version: 1,
  };

  return { ok: true, errors, warnings, parsed, item };
}
