import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const ACTIVE_PILOT_STATES = ["pilot_loaded", "pilot_running", "pilot_completed"];
const OPTION_KEYS = ["A", "B", "C", "D"] as const;

function isOptionKey(value: unknown): value is (typeof OPTION_KEYS)[number] {
  return typeof value === "string" && OPTION_KEYS.includes(value as (typeof OPTION_KEYS)[number]);
}

interface V4EditorialMetadata {
  context?: string;
  explanations?: Partial<Record<"A" | "B" | "C" | "D", string>>;
  hint?: string;
  learningNote?: string;
  source?: { reference?: string };
}

interface V4ItemRow {
  id: string;
  title: string | null;
  area: string | null;
  topic_code: string | null;
  competency: string | null;
  difficulty: number | string | null;
  stem: string | null;
  question_type: string | null;
  cognitive_level: string | null;
  source_reference: string | null;
  source_type: string | null;
  source_path: string | null;
  editorial_scope: string | null;
  tags: string[] | null;
  context?: string | null;
  hint?: string | null;
  correct_option?: string | null;
  explanation?: string | null;
  editorial_metadata: V4EditorialMetadata | null;
}

export interface V4QuestionCandidate {
  id: string;
  area: string | null;
  competency: string | null;
  difficulty: number | string | null;
}

export interface V4PracticeQuestionRecord {
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
  sourceReference: string | null;
  sourceType: string | null;
  sourcePath: string | null;
  scope: string | null;
  hint: string | null;
  tags: string[] | null;
  options: Array<{ key: "A" | "B" | "C" | "D"; text: string }>;
}

export interface V4AnsweredQuestionRecord {
  id: string;
  correctOption: "A" | "B" | "C" | "D";
  difficulty: number;
  area: string | null;
  competency: string | null;
  explanations: Partial<Record<"A" | "B" | "C" | "D", string>>;
  learningNote?: string;
  sourceReference?: string;
}

function applyActiveV4Filters(query: any) {
  return query
    .eq("bank_version", "v4")
    .eq("status", "published")
    .eq("is_published", true)
    .eq("is_active", true)
    .eq("approval_status", "approved")
    .in("pilot_status", ACTIVE_PILOT_STATES);
}

export class V4QuestionRepository {
  private readonly client = getSupabaseAdminClient();

  async listCandidates(params: {
    area?: string;
    competency?: string;
    opecId?: string | null;
    excludeItemIds?: string[];
    limit: number;
  }): Promise<V4QuestionCandidate[]> {
    let query = this.client
      .from("v_question_bank_v4_active")
      .select("id, area, competency, difficulty")
      .order("difficulty", { ascending: true })
      .order("id", { ascending: true });
    if (params.area) query = query.eq("area", params.area);
    if (params.competency) query = query.eq("competency", params.competency);
    if (params.opecId !== undefined) {
      query = params.opecId === null ? query.is("opec_id", null) : query.eq("opec_id", params.opecId);
    }
    if (params.excludeItemIds?.length) {
      query = query.not("id", "in", `(${params.excludeItemIds.map((id) => `"${id}"`).join(",")})`);
    }
    const { data, error } = await query.limit(params.limit);
    if (error) throw error;
    return (data ?? []) as V4QuestionCandidate[];
  }

  async getPracticeQuestion(itemId: string): Promise<V4PracticeQuestionRecord | null> {
    const { data, error } = await this.client
      .from("v_question_bank_v4_active")
      .select("id, title, area, topic_code, competency, difficulty, context, stem, question_type, cognitive_level, source_reference, source_type, source_path, editorial_scope, hint, tags")
      .eq("id", itemId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = data as V4ItemRow;
    const options = await this.getOptions(itemId);
    if (options.length !== OPTION_KEYS.length || options.some((option, index) => option.key !== OPTION_KEYS[index])) {
      throw new Error(`Active V4 item ${itemId} does not have the canonical A-D option set`);
    }
    return {
      id: row.id,
      title: row.title,
      area: row.area,
      topic: row.topic_code,
      competency: row.competency,
      difficulty: row.difficulty === null ? null : Number(row.difficulty),
      context: row.context ?? null,
      stem: row.stem,
      questionType: row.question_type,
      cognitiveLevel: row.cognitive_level,
      sourceReference: row.source_reference,
      sourceType: row.source_type,
      sourcePath: row.source_path,
      scope: row.editorial_scope,
      hint: row.hint ?? null,
      tags: row.tags,
      options,
    };
  }

  async getAnsweredQuestion(itemId: string): Promise<V4AnsweredQuestionRecord | null> {
    const { data, error } = await applyActiveV4Filters(
      this.client
        .from("item_bank")
        .select("id, area, competency, difficulty, correct_option, explanation, source_reference, editorial_metadata")
        .eq("id", itemId),
    ).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = data as V4ItemRow;
    if (!isOptionKey(row.correct_option)) {
      throw new Error(`Active V4 item ${itemId} has an invalid correct option`);
    }
    const correctOption = row.correct_option;
    const explanations = { ...(row.editorial_metadata?.explanations ?? {}) };
    if (!explanations[correctOption] && row.explanation) explanations[correctOption] = row.explanation;
    return {
      id: row.id,
      correctOption,
      difficulty: Number(row.difficulty ?? 0.5),
      area: row.area,
      competency: row.competency,
      explanations,
      learningNote: row.editorial_metadata?.learningNote,
      sourceReference: row.source_reference ?? row.editorial_metadata?.source?.reference,
    };
  }

  private async getOptions(itemId: string) {
    const { data, error } = await this.client
      .from("item_options")
      .select("option_key, option_text")
      .eq("item_id", itemId)
      .order("option_key", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((option) => ({
      key: option.option_key as "A" | "B" | "C" | "D",
      text: option.option_text,
    }));
  }
}
