export type TargetPosition =
  | "docente_aula"
  | "docente_orientador"
  | "docente_lider"
  | "directivo_docente"
  | "coordinador"
  | "rector"
  | "sin_especificar";

export type ItemDifficulty = "baja" | "media" | "alta" | "mixta" | "sin_especificar";

export type EditorialStatus = "draft" | "review" | "approved" | "deprecated" | "archived";

export type ItemOptionKey = "A" | "B" | "C" | "D" | "E";

export interface TechnicalRiskMetadata {
  ambiguity?: boolean;
  possibleDoubleKey?: boolean;
  outdatedNormativeReference?: boolean;
  weakDistractorDesign?: boolean;
  notes?: string[];
}

export interface RichItemMetadata {
  id: string;
  slug: string;
  tipo_item: string;
  nivel_educativo: string;
  area: string;
  subarea: string;
  competencia: string;
  afirmacion: string;
  evidencia: string;
  nivel_cognitivo: string;
  dificultad: ItemDifficulty;
  contexto: string;
  enunciado: string;
  opciones: Array<{ key: ItemOptionKey; text: string }>;
  respuesta_correcta: ItemOptionKey;
  justificacion_clave: string;
  justificacion_distractores?: Partial<Record<ItemOptionKey, string>>;
  riesgos_tecnicos?: string[] | TechnicalRiskMetadata;
  estado: EditorialStatus;
  version: string;
  targetRole?: string;
  targetPosition?: TargetPosition;
  applicantProfile?: string;
  tags?: string[];
}
