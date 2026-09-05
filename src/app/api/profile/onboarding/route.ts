import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuthenticatedProfile } from "../../../../lib/supabase/guards";

const onboardingSchema = z.object({
  targetProfileCode: z.string().trim().min(1),
  targetOpecId: z.string().uuid().nullable().optional(),
  activeGoal: z.string().trim().min(1, "La meta activa es obligatoria.").max(240),
  activeAreas: z
    .array(z.string().trim().min(1))
    .max(20)
    .default([])
    .transform((areas) => Array.from(new Set(areas.map((area) => area.trim()).filter(Boolean)))),
  preferredFeedbackStyle: z.enum(["socratic", "direct", "brief"]).default("socratic"),
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

  const { data: targetProfile, error: targetProfileError } = await supabase
    .from("target_profiles")
    .select("code")
    .eq("code", parsed.data.targetProfileCode)
    .eq("is_active", true)
    .single();

  if (targetProfileError || !targetProfile) {
    return NextResponse.json({ error: "Target profile not found" }, { status: 400 });
  }
  if (parsed.data.targetOpecId) {
    const { data: opec, error: opecError } = await supabase
      .from("opec_catalog")
      .select("id")
      .eq("id", parsed.data.targetOpecId)
      .eq("profile_code", parsed.data.targetProfileCode)
      .eq("verification_status", "verified")
      .eq("is_active", true)
      .maybeSingle();
    if (opecError || !opec) return NextResponse.json({ error: "OPEC does not belong to the selected profile" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("learning_profiles")
    .update({
      target_profile_code: parsed.data.targetProfileCode,
      target_opec_id: parsed.data.targetOpecId ?? null,
      active_goal: parsed.data.activeGoal,
      active_areas: parsed.data.activeAreas,
      preferred_feedback_style: parsed.data.preferredFeedbackStyle,
      onboarding_completed: true,
    })
    .eq("profile_id", profile.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  revalidatePath("/home");
  revalidatePath("/onboarding");
  revalidatePath("/practice");
  revalidatePath("/dashboard");

  return NextResponse.json({ ok: true }, { status: 200 });
}
