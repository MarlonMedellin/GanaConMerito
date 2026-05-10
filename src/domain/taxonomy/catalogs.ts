export const CANONICAL_TAXONOMY = {
  area: ["pedagogia", "gestion_directiva", "convivencia", "inclusion", "evaluacion"],
  subarea: ["curriculo", "didactica", "planeacion", "liderazgo", "seguimiento"],
  competency: ["analisis_pedagogico", "toma_decisiones", "gestion_aula", "evaluacion_formativa"],
  nivel_educativo: ["preescolar", "basica_primaria", "basica_secundaria", "media", "superior"],
  tipo_item: ["caso", "seleccion_multiple", "situacional"],
  nivel_cognitivo: ["recordar", "comprender", "aplicar", "analizar", "evaluar"],
  dificultad: ["baja", "media", "alta"],
  targetPosition: ["docente", "directivo_docente", "coordinador"],
  targetRole: ["aula", "institucional", "orientacion"],
  applicantProfile: ["novato", "intermedio", "experto"],
} as const;

export const TAXONOMY_ALIASES: Record<string, string> = {
  pedagogía: "pedagogia",
  gestion: "gestion_directiva",
  gestión: "gestion_directiva",
  eval_formativa: "evaluacion_formativa",
  multiple_choice: "seleccion_multiple",
  fácil: "baja",
  dificil: "alta",
  difícil: "alta",
  directivo: "directivo_docente",
  docente: "aula",
  rector_director_rural: "directivo_docente",
  docente_aula_preescolar: "docente",
  docente_aula_basica_primaria: "docente",
  docente_aula_secundaria_media: "docente",
  docente_orientador: "docente",
};

export const TAXONOMY_DEPRECATED: Record<string, string> = {
  primaria_basica: "basica_primaria",
  secundaria_basica: "basica_secundaria",
  seleccion_multiple_con_unica_respuesta: "seleccion_multiple",
};

export const TAXONOMY_FORBIDDEN = new Set(["otro", "misc", "random", "test", "na", "n/a"]);

export const TAG_REGISTRY = {
  pedagogical_strategy: ["andamiaje", "pregunta_guiada", "contraste_opciones"],
  misconception: ["confunde_objetivo", "ignora_contexto", "respuesta_intuitiva"],
  cognitive_process: ["inferencia", "comparacion", "priorizacion"],
  content_topic: ["evaluacion_formativa", "gestion_aula", "inclusion"],
  risk_flag: ["source_unverified", "ambiguous_stem", "weak_distractors"],
  profile_context: ["docente_novato", "directivo_experto", "rural_contexto"],
} as const;

export const TAG_ALIASES: Record<string, string> = {
  scaffolding: "andamiaje",
  guided_question: "pregunta_guiada",
  option_compare: "contraste_opciones",
  weak_source: "source_unverified",
};

export const TAG_DEPRECATED: Record<string, string> = {
  evaluacion: "evaluacion_formativa",
  gestion_de_aula: "gestion_aula",
  fuente_debil: "source_unverified",
  distractores_debiles: "weak_distractors",
};

export const TAG_FORBIDDEN = new Set(["whatever", "tmp", "debug", "untagged"]);

export type TaxonomyKey = keyof typeof CANONICAL_TAXONOMY;
export type TagCategory = keyof typeof TAG_REGISTRY;
