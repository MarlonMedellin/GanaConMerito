export type ItemArea =
  | "matematicas"
  | "pedagogia"
  | "normatividad"
  | "gestion"
  | "lectura_critica"
  | "competencias_ciudadanas";

export type ItemType = "multiple_choice";

export type OptionKey = "A" | "B" | "C" | "D";

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
  targetRole?: string;
  targetPosition?: string;
  applicantProfile?: string;
  tags?: string[];
  itemType: ItemType;
  stem: string;
  options: ItemOption[];
  correctOption: OptionKey;
  explanation: string;
  normativeRefs: string[];
  published: boolean;
  version: number;
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
