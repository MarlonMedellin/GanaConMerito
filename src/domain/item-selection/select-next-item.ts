import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { V4QuestionRepository } from "@/lib/question-bank/v4-question-repository";

interface SelectNextItemParams {
  professionalProfileId?: string | null;
  activeArea?: string;
  activeCompetency?: string;
  canaryOpecId?: string;
  excludeItemIds?: string[];
  profileIdForRotation?: string;
  sessionIdForRotation?: string;
}

export interface SelectionScope {
  activeArea?: string;
  activeCompetency?: string;
  opecId?: string | null;
}

const CANDIDATE_LIMIT = 20;
const RECENT_HISTORY_LIMIT = 5;

function hashString(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function buildRotationSeed(params: SelectNextItemParams) {
  return [
    params.profileIdForRotation ?? "anon",
    params.sessionIdForRotation ?? "session",
    params.canaryOpecId ?? "any-opec",
    params.activeArea ?? "any-area",
    params.activeCompetency ?? "any-competency",
  ].join("|");
}

export function pickDeterministicCandidate<T extends { id: string }>(candidates: T[], seed: string) {
  if (candidates.length === 0) {
    return null;
  }

  const sortedCandidates = [...candidates].sort((left, right) => left.id.localeCompare(right.id));
  const startIndex = hashString(seed) % sortedCandidates.length;
  return sortedCandidates[startIndex] ?? null;
}

async function resolveRecentItemIds(profileIdForRotation?: string) {
  if (!profileIdForRotation) {
    return [];
  }

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("session_turns")
    .select(`
      item_id,
      sessions!inner(profile_id)
    `)
    .eq("sessions.profile_id", profileIdForRotation)
    .not("item_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(RECENT_HISTORY_LIMIT);

  if (error) {
    throw error;
  }

  return Array.from(new Set((data ?? []).map((row) => row.item_id).filter(Boolean)));
}

async function runSelectionAttempt(params: SelectNextItemParams, scope: SelectionScope) {
  const repository = new V4QuestionRepository();
  const candidates = await repository.listCandidates({
    area: scope.activeArea,
    competency: scope.activeCompetency,
    opecId: scope.opecId,
    excludeItemIds: params.excludeItemIds,
    limit: CANDIDATE_LIMIT,
  });
  if (candidates.length === 0) {
    return null;
  }

  const recentItemIds = await resolveRecentItemIds(params.profileIdForRotation);
  const recentSet = new Set(recentItemIds);
  const withoutRecent = candidates.filter((candidate) => !recentSet.has(candidate.id));
  const pool = withoutRecent.length > 0 ? withoutRecent : candidates;

  return pickDeterministicCandidate(pool, buildRotationSeed(params));
}

export function buildSelectionScopes(params: Pick<SelectNextItemParams, "activeArea" | "activeCompetency" | "canaryOpecId">): SelectionScope[] {
  const contentScopes: SelectionScope[] = [];

  if (params.activeArea && params.activeCompetency) {
    contentScopes.push({ activeArea: params.activeArea, activeCompetency: params.activeCompetency });
  }

  if (params.activeArea) {
    contentScopes.push({ activeArea: params.activeArea });
  }

  contentScopes.push({});

  const uniqueContentScopes = contentScopes.filter(
    (scope, index, allScopes) =>
      allScopes.findIndex(
        (candidate) =>
          candidate.activeArea === scope.activeArea && candidate.activeCompetency === scope.activeCompetency,
      ) === index,
  );

  if (!params.canaryOpecId) {
    return uniqueContentScopes;
  }

  return [params.canaryOpecId, null].flatMap((opecId) =>
    uniqueContentScopes.map((scope) => ({ ...scope, opecId })),
  );
}

export async function selectNextItem(params: SelectNextItemParams) {
  for (const scope of buildSelectionScopes(params)) {
    const nextItem = await runSelectionAttempt(params, scope);

    if (nextItem) {
      return nextItem;
    }
  }

  return null;
}
