import matter from "gray-matter";
import type { ContentItem, ItemOption, OptionKey, ParsedContentSummary } from "../../types/content";
import { validateOptions } from "./validate-item";

export interface ContentValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  parsed?: ParsedContentSummary;
  item?: ContentItem;
}

function getSection(source: string, heading: string) {
  const pattern = new RegExp(`##\\s+${heading}\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, "i");
  const match = source.match(pattern);
  return match?.[1]?.trim() ?? "";
}

function parseOptions(section: string): ItemOption[] {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.match(/^-\s*([A-D])\.\s*(.+)$/i))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      key: match[1].toUpperCase() as OptionKey,
      text: match[2].trim(),
    }));
}

function parseStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.map((entry) => String(entry));
}

export function parseMarkdownItem(rawMarkdown: string): ContentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!rawMarkdown.trim()) {
    return { ok: false, errors: ["rawMarkdown es obligatorio."], warnings };
  }

  const { data, content } = matter(rawMarkdown);

  const stem = getSection(content, "Enunciado");
  const optionsSection = getSection(content, "Opciones");
  const correctOption = getSection(content, "RespuestaCorrecta").trim().toUpperCase() as OptionKey;
  const explanation = getSection(content, "Explicacion");

  const requiredFields = [
    "id",
    "slug",
    "title",
    "area",
    "examType",
    "competency",
    "difficulty",
    "itemType",
    "published",
    "version",
  ];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      errors.push(`Falta campo obligatorio en frontmatter: ${field}`);
    }
  }

  if (typeof data.difficulty !== "number" || data.difficulty < 0 || data.difficulty > 1) {
    errors.push("difficulty debe ser numérico y estar entre 0 y 1.");
  }

  if (data.itemType && data.itemType !== "multiple_choice") {
    errors.push("itemType inválido. Solo se admite multiple_choice en este MVP.");
  }

  if (!stem) {
    errors.push("Falta la sección Enunciado.");
  }

  if (!optionsSection) {
    errors.push("Falta la sección Opciones.");
  }

  if (!correctOption) {
    errors.push("Falta la sección RespuestaCorrecta.");
  }

  if (!explanation) {
    errors.push("Falta la sección Explicacion.");
  }

  const options = parseOptions(optionsSection);
  const optionValidation = validateOptions(options);
  errors.push(...optionValidation.errors);
  warnings.push(...optionValidation.warnings);

  if (correctOption && !options.find((option) => option.key === correctOption)) {
    errors.push("correctOption debe existir dentro de las opciones declaradas.");
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
      warnings,
      parsed: data.slug
        ? {
            id: String(data.id ?? ""),
            slug: String(data.slug ?? ""),
            title: String(data.title ?? ""),
            area: String(data.area ?? ""),
            competency: String(data.competency ?? ""),
            difficulty: Number(data.difficulty ?? 0),
            correctOption: (correctOption || "A") as OptionKey,
            optionCount: options.length,
            targetPosition: data.targetPosition ? String(data.targetPosition) : undefined,
          }
        : undefined,
    };
  }

  const item: ContentItem = {
    id: String(data.id),
    slug: String(data.slug),
    title: String(data.title),
    area: data.area,
    subarea: data.subarea ? String(data.subarea) : undefined,
    examType: String(data.examType),
    competency: String(data.competency),
    difficulty: Number(data.difficulty),
    targetLevel: data.targetLevel ? String(data.targetLevel) : undefined,
    targetRole: data.targetRole ? String(data.targetRole) : undefined,
    targetPosition: data.targetPosition ? String(data.targetPosition) : undefined,
    applicantProfile: data.applicantProfile ? String(data.applicantProfile) : undefined,
    tags: parseStringArray(data.tags),
    itemType: "multiple_choice",
    stem,
    options,
    correctOption,
    explanation,
    normativeRefs: Array.isArray(data.normativeRefs)
      ? data.normativeRefs.map((value: unknown) => String(value))
      : [],
    published: Boolean(data.published),
    version: Number(data.version),
  };

  return {
    ok: true,
    errors,
    warnings,
    parsed: {
      id: item.id,
      slug: item.slug,
      title: item.title,
      area: item.area,
      competency: item.competency,
      difficulty: item.difficulty,
      correctOption: item.correctOption,
      optionCount: item.options.length,
      targetPosition: item.targetPosition,
    },
    item,
  };
}
