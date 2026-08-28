const TECHNICAL_LABEL_DICTIONARY: Record<string, string> = {
  gestion: "Gestión",
  pedagogia: "Pedagogía",
  matematicas: "Matemáticas",
  ciudadanas: "Ciudadanas",
  normatividad: "Normatividad",
  lectura_de_indicadores: "Lectura de indicadores",
};

function normalizeWhitespace(value: string) {
  return value.replace(/[\s_-]+/g, " ").trim();
}

function applySpanishAccentHints(value: string) {
  return value
    .replace(/\bgestion\b/g, "gestión")
    .replace(/\bplaneacion\b/g, "planeación")
    .replace(/\bdecision\b/g, "decisión")
    .replace(/\bpedagogica\b/g, "pedagógica")
    .replace(/\bmatematicas\b/g, "matemáticas");
}

function capitalizeSentence(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function formatTechnicalLabel(value?: string | null): string {
  if (!value || !value.trim()) {
    return "Sin clasificar";
  }

  const normalizedKey = value.trim().toLowerCase();
  const dictionaryValue = TECHNICAL_LABEL_DICTIONARY[normalizedKey];

  if (dictionaryValue) {
    return dictionaryValue;
  }

  return capitalizeSentence(applySpanishAccentHints(normalizeWhitespace(value).toLowerCase()));
}

export function formatAreaCompetency(area?: string | null, competency?: string | null): string {
  return `${formatTechnicalLabel(area)} · ${formatTechnicalLabel(competency)}`;
}
