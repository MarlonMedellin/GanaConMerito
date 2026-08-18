import { requireAuthenticatedProfile, requireOwnedSession } from "@/lib/supabase/guards";
import {
  buildDashboardSummaryMetrics,
  emptyDashboardSummaryMetrics,
  type DashboardTopicBreakdownRow,
} from "@/lib/dashboard/summary-metrics";
import type { DashboardSummaryResponse } from "@/types/evaluation";

interface SessionTurnRow {
  id: string;
  item_id: string | null;
  turn_number: number;
  created_at?: string | null;
}

interface EvaluationEventRow {
  session_turn_id: string;
  is_correct: boolean;
  reasoning_score: number | string;
  estimated_theta_delta: number | string;
  created_at?: string | null;
}

interface ItemBankRow {
  id: string;
  area: string | null;
  competency: string | null;
  difficulty: number | string | null;
}


async function getCurrentUserTopicStats(): Promise<DashboardTopicBreakdownRow[]> {
  const auth = await requireAuthenticatedProfile();
  if (!auth.ok) return [];

  const { data } = await auth.supabase
    .from("user_topic_stats")
    .select(
      "area, competency, attempts, correct_count, avg_reasoning_score, avg_difficulty, estimated_level, percentile_segment, updated_at",
    )
    .eq("profile_id", auth.profile.id)
    .order("estimated_level", { ascending: false });

  return (data ?? []) as DashboardTopicBreakdownRow[];
}

async function getSessionTopicStats(sessionId: string): Promise<DashboardTopicBreakdownRow[]> {
  const auth = await requireOwnedSession({ sessionId });

  if (!auth.ok) {
    return [];
  }

  const { supabase } = auth;
  const { data: turns, error: turnsError } = await supabase
    .from("session_turns")
    .select("id, item_id, turn_number, created_at")
    .eq("session_id", sessionId)
    .order("turn_number", { ascending: true });

  if (turnsError || !turns || turns.length === 0) {
    return [];
  }

  const turnRows = (turns ?? []) as SessionTurnRow[];
  const turnIds = turnRows.map((turn) => turn.id);
  const itemIds = [...new Set(turnRows.map((turn) => turn.item_id).filter((itemId): itemId is string => Boolean(itemId)))];

  const [{ data: events, error: eventsError }, { data: items, error: itemsError }] = await Promise.all([
    supabase
      .from("evaluation_events")
      .select("session_turn_id, is_correct, reasoning_score, estimated_theta_delta, created_at")
      .in("session_turn_id", turnIds),
    itemIds.length > 0
      ? supabase.from("item_bank").select("id, area, competency, difficulty").in("id", itemIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (eventsError || itemsError) {
    return [];
  }

  const eventByTurnId = new Map(
    ((events ?? []) as EvaluationEventRow[]).map((event) => [event.session_turn_id, event]),
  );
  const itemById = new Map(((items ?? []) as ItemBankRow[]).map((item) => [item.id, item]));
  const aggregate = new Map<string, DashboardTopicBreakdownRow>();

  for (const turn of turnRows) {
    const event = eventByTurnId.get(turn.id);
    const item = turn.item_id ? itemById.get(turn.item_id) : null;
    const area = item?.area ?? "Sin área";
    const competency = item?.competency ?? "Sin competencia";
    const key = `${area}::${competency}`;
    const difficulty = Number(item?.difficulty ?? 0);
    const reasoningScore = Number(event?.reasoning_score ?? 0);
    const thetaDelta = Number(event?.estimated_theta_delta ?? 0);

    const current = aggregate.get(key);
    if (!current) {
      aggregate.set(key, {
        area,
        competency,
        attempts: 1,
        correct_count: event?.is_correct ? 1 : 0,
        avg_reasoning_score: Number(reasoningScore.toFixed(2)),
        avg_difficulty: Number(difficulty.toFixed(2)),
        estimated_level: Number(thetaDelta.toFixed(3)),
        updated_at: event?.created_at ?? turn.created_at ?? null,
      });
      continue;
    }

    const nextAttempts = current.attempts + 1;
    current.correct_count += event?.is_correct ? 1 : 0;
    current.avg_reasoning_score = Number(
      (((current.avg_reasoning_score * current.attempts) + reasoningScore) / nextAttempts).toFixed(2),
    );
    current.avg_difficulty = Number(
      (((current.avg_difficulty * current.attempts) + difficulty) / nextAttempts).toFixed(2),
    );
    current.estimated_level = Number((current.estimated_level + thetaDelta).toFixed(3));
    current.attempts = nextAttempts;
    current.updated_at = event?.created_at ?? turn.created_at ?? current.updated_at ?? null;
  }

  return [...aggregate.values()].sort((a, b) => {
    const levelDiff = Number(b.estimated_level) - Number(a.estimated_level);
    if (levelDiff !== 0) return levelDiff;
    return b.attempts - a.attempts;
  });
}

export async function getDashboardSummaryForCurrentUser(sessionId?: string): Promise<DashboardSummaryResponse> {
  const historicalStats = await getCurrentUserTopicStats();
  const currentSessionStats = sessionId ? await getSessionTopicStats(sessionId) : [];

  return {
    historical: historicalStats.length > 0 ? buildDashboardSummaryMetrics(historicalStats) : emptyDashboardSummaryMetrics(),
    currentSession: sessionId ? (currentSessionStats.length > 0 ? buildDashboardSummaryMetrics(currentSessionStats) : emptyDashboardSummaryMetrics()) : null,
  };
}

export async function getDashboardTopicBreakdownForCurrentUser(sessionId?: string) {
  const historical = await getCurrentUserTopicStats();
  const currentSession = sessionId ? await getSessionTopicStats(sessionId) : [];

  return {
    historical,
    currentSession: sessionId ? currentSession : [],
  };
}
