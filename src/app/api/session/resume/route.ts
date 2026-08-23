import { NextResponse } from "next/server";
import { selectNextItem } from "@/domain/item-selection/select-next-item";
import { V4QuestionRepository } from "@/lib/question-bank/v4-question-repository";
import { requireAuthenticatedProfile } from "@/lib/supabase/guards";

const TERMINAL_STATES = new Set(["session_close", "expired", "error"]);

export async function GET() {
  const auth = await requireAuthenticatedProfile();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { supabase, profile } = auth;

  const { data: learningProfile, error: learningProfileError } = await supabase
    .from("learning_profiles")
    .select("target_profile_code, target_opec_id")
    .eq("profile_id", profile.id)
    .single();

  if (learningProfileError || !learningProfile) {
    return NextResponse.json({ error: "Learning profile not found" }, { status: 404 });
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, mode, current_state, status, created_at, target_profile_code, target_opec_id")
    .eq("profile_id", profile.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sessionError) {
    return NextResponse.json({ error: "Could not inspect active sessions" }, { status: 500 });
  }

  if (!session || TERMINAL_STATES.has(session.current_state)) {
    return NextResponse.json({ session: null }, { status: 200 });
  }

  if (
    session.target_profile_code !== learningProfile.target_profile_code ||
    session.target_opec_id !== learningProfile.target_opec_id
  ) {
    return NextResponse.json(
      { error: "Active session targeting no longer matches the current learning profile" },
      { status: 409 },
    );
  }

  const { data: turns, error: turnsError } = await supabase
    .from("session_turns")
    .select("question_id, turn_number")
    .eq("session_id", session.id)
    .order("turn_number", { ascending: true });

  if (turnsError) {
    return NextResponse.json({ error: "Could not inspect session turns" }, { status: 500 });
  }

  const seenItemIds = (turns ?? [])
    .map((turn) => turn.question_id)
    .filter((questionId): questionId is string => Boolean(questionId));

  let activeArea: string | undefined;
  let activeCompetency: string | undefined;

  if (seenItemIds.length > 0) {
    const repository = new V4QuestionRepository();
    const lastAnswered = await repository.getAnsweredQuestion(seenItemIds[seenItemIds.length - 1]);
    activeArea = lastAnswered?.area ?? undefined;
    activeCompetency = lastAnswered?.competency ?? undefined;
  }

  const nextItem = await selectNextItem({
    targetProfileCode: session.target_profile_code,
    targetOpecId: session.target_opec_id,
    profileIdForRotation: profile.id,
    sessionIdForRotation: seenItemIds.length > 0 ? session.id : undefined,
    activeArea,
    activeCompetency,
    excludeItemIds: seenItemIds,
  });

  return NextResponse.json(
    {
      session: {
        sessionId: session.id,
        currentState: session.current_state,
        mode: session.mode,
        currentItemId: nextItem?.id,
        hintLevel: 0,
        resumed: true,
        inventory: !nextItem
          ? {
              status: "empty" as const,
              reason: "no_active_v4_items" as const,
              alternatives: [
                "Revisar el inventario activo compatible con el targeting de la sesión",
                "Iniciar una nueva sesión cuando exista inventario disponible",
              ],
            }
          : undefined,
      },
    },
    { status: 200 },
  );
}
