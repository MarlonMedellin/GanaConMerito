const TECHNICAL_LABEL_DICTIONARY: Record<string, string> = {
  gestion: "Gestión",
  pedagogia: "Pedagogía",
  matematicas: "Matemáticas",
  ciudadanas: "Ciudadanas",
  normatividad: "Normatividad",
  lectura_de_indicadores: "Lectura de indicadores",
  gestion_academica: "Gestión académica",
  planeacion_curricular: "Planeación curricular",
  decision_pedagogica: "Decisión pedagógica",
  gestion_educativa: "Gestión educativa",
};

function normalizeWhitespace(value: string) {
  return value.replace(/[\s_-]+/g, " ").trim();
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

  return capitalizeSentence(normalizeWhitespace(value));
}

export function formatAreaCompetency(area?: string | null, competency?: string | null): string {
  return `${formatTechnicalLabel(area)} · ${formatTechnicalLabel(competency)}`;
}
