import { NextResponse } from "next/server";
import { selectNextItem } from "../../../../domain/item-selection/select-next-item";
import { isLearningProfileOnboardingComplete } from "../../../../lib/onboarding/status";
import { requireAuthenticatedProfile } from "../../../../lib/supabase/guards";
import { startSessionSchema } from "../../../../lib/validation/session";
import type { StartSessionResponse, SessionState } from "../../../../types/session";

export async function POST(request: Request) {
  const json = await request.json();
  const parsedBody = startSessionSchema.safeParse(json);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues.map((issue) => issue.message).join(" | ") },
      { status: 400 },
    );
  }

  const auth = await requireAuthenticatedProfile();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { supabase, profile } = auth;
  const body = parsedBody.data;

  const { data: learningProfile, error: learningProfileError } = await supabase
    .from("learning_profiles")
    .select("onboarding_completed, professional_profile_id, active_areas")
    .eq("profile_id", profile.id)
    .single();

  if (learningProfileError || !learningProfile) {
    return NextResponse.json({ error: "Learning profile not found" }, { status: 404 });
  }

  const nextItem = await selectNextItem({
    professionalProfileId: learningProfile.professional_profile_id,
    profileIdForRotation: profile.id,
    activeArea: body.area,
    activeCompetency: body.competency,
  });

  const onboardingCompleted = isLearningProfileOnboardingComplete(learningProfile);

  let currentState: SessionState = "onboarding";
  if (onboardingCompleted) {
    currentState = nextItem ? "practice" : "diagnostic";
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      profile_id: profile.id,
      mode: body.mode,
      current_state: currentState,
      status: "active",
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Could not create session" }, { status: 500 });
  }

  const response: StartSessionResponse = {
    sessionId: session.id,
    currentState,
    mode: body.mode,
    currentItemId: nextItem?.id,
    hintLevel: 0,
    activeArea: body.area,
    activeCompetency: body.competency,
    inventory: onboardingCompleted && !nextItem
      ? {
          status: "empty",
          reason: "no_active_v4_items",
          alternatives: [
            "Revisar los filtros de área y competencia",
            "Intentar de nuevo cuando exista una cohorte V4 activa",
          ],
        }
      : undefined,
  };

  return NextResponse.json(response, { status: 200 });
}
