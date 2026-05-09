export type TargetPosition =
  | "docente_aula"
  | "docente_orientador"
  | "docente_lider"
  | "coordinador"
  | "rector"
  | "directivo_docente"
  | "sin_posicion_objetivo";

export type ItemDifficulty = "baja" | "media" | "alta";

export type EditorialStatus = "draft" | "review" | "approved" | "retired";

export type ItemOptionKey = "A" | "B" | "C" | "D";

export interface TechnicalRiskMetadata {
  isAmbiguous?: boolean;
  hasDoubleKeyRisk?: boolean;
  notes?: string[];
}

export interface RichItemMetadata {
  id: string;
  slug?: string;
  tipo_item?: string;
  nivel_educativo?: string;
  area?: string;
  subarea?: string;
  competencia?: string;
  afirmacion?: string;
  evidencia?: string;
  nivel_cognitivo?: string;
  dificultad?: ItemDifficulty | string;
  contexto?: string;
  justificacion_distractores?: Record<string, string>;
  riesgos_tecnicos?: TechnicalRiskMetadata | string[] | string;
  estado?: EditorialStatus | string;
  version?: string;
  targetRole?: string;
  targetPosition?: TargetPosition | string;
  applicantProfile?: string;
  tags?: string[];
}
