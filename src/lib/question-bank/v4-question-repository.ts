import { getSupabaseAdminClient } from "@/lib/supabase/admin";

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
  topic: string | null;
  competency: string | null;
  difficulty: number | string | null;
  stem: string | null;
  question_type: string | null;
  cognitive_level: string | null;
  source_reference?: string | null;
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

export class V4QuestionRepository {
  private readonly client = getSupabaseAdminClient();

  async listCandidates(params: {
    area?: string;
    competency?: string;
    targetProfileCode?: string | null;
    targetOpecId?: string | null;
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
    const targetIds = await this.resolveTargetQuestionIds(params.targetProfileCode, params.targetOpecId);
    if (targetIds) {
      if (targetIds.length === 0) return [];
      query = query.in("id", targetIds);
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
      .select("id, area, topic, competency, difficulty, context, stem, question_type, cognitive_level, source_type, source_path, editorial_scope, hint")
      .eq("id", itemId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = data as unknown as V4ItemRow;
    const options = await this.getOptions(itemId);
    if (options.length !== OPTION_KEYS.length || options.some((option, index) => option.key !== OPTION_KEYS[index])) {
      throw new Error(`Active V4 item ${itemId} does not have the canonical A-D option set`);
    }
    return {
      id: row.id,
      title: null,
      area: row.area,
      topic: row.topic,
      competency: row.competency,
      difficulty: row.difficulty === null ? null : Number(row.difficulty),
      context: row.context ?? null,
      stem: row.stem,
      questionType: row.question_type,
      cognitiveLevel: row.cognitive_level,
      sourceReference: null,
      sourceType: row.source_type,
      sourcePath: row.source_path,
      scope: row.editorial_scope,
      hint: row.hint ?? null,
      tags: null,
      options,
    };
  }

  async getAnsweredQuestion(itemId: string): Promise<V4AnsweredQuestionRecord | null> {
    const { data, error } = await this.client
      .from("v_question_bank_v4_answered")
      .select("id, area, competency, difficulty, correct_option, explanations, learning_note, source_reference")
      .eq("id", itemId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = data as unknown as V4ItemRow;
    if (!isOptionKey(row.correct_option)) {
      throw new Error(`Active V4 item ${itemId} has an invalid correct option`);
    }
    const correctOption = row.correct_option;
    const explanations = { ...((data as any).explanations ?? {}) };
    return {
      id: row.id,
      correctOption,
      difficulty: Number(row.difficulty ?? 0.5),
      area: row.area,
      competency: row.competency,
      explanations,
      learningNote: (data as any).learning_note ?? undefined,
      sourceReference: row.source_reference ?? undefined,
    };
  }

  private async getOptions(itemId: string) {
    const { data, error } = await this.client
      .from("question_options")
      .select("option_key, option_text")
      .eq("question_id", itemId)
      .order("option_key", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((option) => ({
      key: option.option_key as "A" | "B" | "C" | "D",
      text: option.option_text,
    }));
  }

  private async resolveTargetQuestionIds(targetProfileCode?: string | null, targetOpecId?: string | null) {
    if (!targetProfileCode && !targetOpecId) return null;
    let profileCode = targetProfileCode ?? null;
    let familyCode: string | null = null;
    if (targetOpecId) {
      const { data, error } = await this.client
        .from("opec_catalog")
        .select("profile_code, family_code")
        .eq("id", targetOpecId)
        .eq("is_active", true)
        .eq("verification_status", "verified")
        .maybeSingle();
      if (error) throw error;
      if (!data) return [];
      profileCode = data.profile_code;
      familyCode = data.family_code;
    } else if (profileCode) {
      const { data, error } = await this.client.from("target_profiles").select("family_code").eq("code", profileCode).maybeSingle();
      if (error) throw error;
      if (!data) return [];
      familyCode = data.family_code;
    }
    const [family, profile, opec] = await Promise.all([
      familyCode ? this.client.from("item_target_families").select("question_id").eq("family_code", familyCode) : Promise.resolve({ data: [] }),
      profileCode ? this.client.from("item_target_profiles").select("question_id").eq("profile_code", profileCode) : Promise.resolve({ data: [] }),
      targetOpecId ? this.client.from("item_opec_targets").select("question_id").eq("opec_id", targetOpecId) : Promise.resolve({ data: [] }),
    ]);
    return [...new Set([...(family.data ?? []), ...(profile.data ?? []), ...(opec.data ?? [])].map((row: any) => row.question_id))];
  }
}
