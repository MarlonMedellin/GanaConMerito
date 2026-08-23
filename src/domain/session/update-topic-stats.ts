import { getSupabaseAdminClient } from "@/lib/supabase/admin";

interface UpdateTopicStatsParams {
  profileId: string;
  area: string;
  competency: string;
  isCorrect: boolean;
  reasoningScore: number;
  difficulty: number;
  estimatedThetaDelta: number;
}

export async function updateUserTopicStats(params: UpdateTopicStatsParams) {
  const admin = getSupabaseAdminClient();

  const { data: existing } = await admin
    .from("user_topic_stats")
    .select("attempts, correct_count, avg_reasoning_score, avg_difficulty, estimated_level")
    .eq("profile_id", params.profileId)
    .eq("domain", params.area)
    .eq("competency", params.competency)
    .maybeSingle();

  if (!existing) {
    const { error } = await admin.from("user_topic_stats").insert({
      profile_id: params.profileId,
      domain: params.area,
      competency: params.competency,
      attempts: 1,
      correct_count: params.isCorrect ? 1 : 0,
      avg_reasoning_score: params.reasoningScore,
      avg_difficulty: params.difficulty,
      estimated_level: params.estimatedThetaDelta,
    });

    if (error) throw error;
    return;
  }

  const nextAttempts = existing.attempts + 1;
  const nextCorrectCount = existing.correct_count + (params.isCorrect ? 1 : 0);
  const nextAvgReasoningScore =
    (existing.avg_reasoning_score * existing.attempts + params.reasoningScore) / nextAttempts;
  const nextAvgDifficulty =
    (existing.avg_difficulty * existing.attempts + params.difficulty) / nextAttempts;
  const nextEstimatedLevel = existing.estimated_level + params.estimatedThetaDelta;

  const { error } = await admin
    .from("user_topic_stats")
    .update({
      attempts: nextAttempts,
      correct_count: nextCorrectCount,
      avg_reasoning_score: Number(nextAvgReasoningScore.toFixed(2)),
      avg_difficulty: Number(nextAvgDifficulty.toFixed(2)),
      estimated_level: Number(nextEstimatedLevel.toFixed(3)),
    })
    .eq("profile_id", params.profileId)
    .eq("domain", params.area)
    .eq("competency", params.competency);

  if (error) throw error;
}
