export type ItemArea =
  | "matematicas"
  | "pedagogia"
  | "normatividad"
  | "gestion"
  | "lectura_critica"
  | "competencias_ciudadanas";

export type ItemType = "multiple_choice";

export type OptionKey = "A" | "B" | "C" | "D";

export const TARGET_ROLES = ["docente"] as const;
export type TargetRole = (typeof TARGET_ROLES)[number];

export const TARGET_POSITIONS = [
  "rector_director_rural",
  "coordinador",
  "docente_aula_preescolar",
  "docente_aula_basica_primaria",
  "docente_aula_secundaria_media",
  "docente_orientador",
] as const;
export type TargetPosition = (typeof TARGET_POSITIONS)[number];

export const APPLICANT_PROFILES = [
  "directivo_docente",
  "docente_de_aula",
  "docente_orientador",
] as const;
export type ApplicantProfile = (typeof APPLICANT_PROFILES)[number];

export interface ItemOption {
  key: OptionKey;
  text: string;
}

export interface ContentItem {
  id: string;
  slug: string;
  title: string;
  area: ItemArea;
  subarea?: string;
  examType: string;
  competency: string;
  difficulty: number;
  targetLevel?: string;
  targetRole?: TargetRole;
  targetPosition?: TargetPosition;
  applicantProfile?: ApplicantProfile;
  tags?: string[];
  itemType: ItemType;
  stem: string;
  options: ItemOption[];
  correctOption: OptionKey;
  explanation: string;
  normativeRefs: string[];
  published: boolean;
  version: number;
  editorialMetadata?: Record<string, unknown>;
}

export interface ParsedContentSummary {
  id: string;
  slug: string;
  title: string;
  area: string;
  competency: string;
  difficulty: number;
  correctOption: OptionKey;
  optionCount: number;
  targetPosition?: string;
}

export interface ValidateContentRequest {
  rawMarkdown: string;
}

export interface ValidateContentResponse {
  ok: boolean;
  errors: string[];
  warnings: string[];
  parsed?: ParsedContentSummary;
}

export interface UploadContentRequest {
  rawMarkdown: string;
}

export interface UploadContentResponse {
  ok: boolean;
  itemId?: string;
  version?: number;
  errors: string[];
}
