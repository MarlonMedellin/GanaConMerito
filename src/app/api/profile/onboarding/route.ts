import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthenticatedProfile } from "../../../../lib/supabase/guards";

const onboardingSchema = z.object({
  targetRole: z.literal("docente"),
  examType: z.literal("docente"),
  professionalProfileId: z.string().uuid(),
  activeGoal: z.string().trim().min(1, "La meta activa es obligatoria.").max(240),
  activeAreas: z
    .array(z.string().trim().min(1))
    .min(1, "Debes indicar al menos un área activa.")
    .max(20)
    .transform((areas) => Array.from(new Set(areas.map((area) => area.trim()).filter(Boolean)))),
  preferredFeedbackStyle: z.enum(["socratic"]).default("socratic"),
});

export async function POST(request: Request) {
  const auth = await requireAuthenticatedProfile();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { supabase, profile } = auth;
  const json = await request.json();
  const parsed = onboardingSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((issue) => issue.message).join(" | ") || "Datos de onboarding inválidos." },
      { status: 400 },
    );
  }

  const { data: professionalProfile, error: professionalProfileError } = await supabase
    .from("professional_profiles")
    .select("id")
    .eq("id", parsed.data.professionalProfileId)
    .eq("is_active", true)
    .single();

  if (professionalProfileError || !professionalProfile) {
    return NextResponse.json({ error: "Professional profile not found" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("learning_profiles")
    .update({
      target_role: parsed.data.targetRole,
      exam_type: parsed.data.examType,
      professional_profile_id: parsed.data.professionalProfileId,
      active_goal: parsed.data.activeGoal,
      active_areas: parsed.data.activeAreas,
      preferred_feedback_style: parsed.data.preferredFeedbackStyle,
      onboarding_completed: parsed.data.activeAreas.length > 0,
    })
    .eq("profile_id", profile.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
