import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { requireAuthenticatedProfile } from "@/lib/supabase/guards";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const auth = await requireAuthenticatedProfile();
  if (!auth.ok) {
    redirect("/login");
  }

  const { supabase, profile } = auth;
  const { data: learningProfile } = await supabase
    .from("learning_profiles")
    .select(
      "target_profile_code, target_opec_id, active_goal, preferred_feedback_style, active_areas, onboarding_completed",
    )
    .eq("profile_id", profile.id)
    .single();

  const [{ data: targetProfiles }, { data: opecs }] = await Promise.all([supabase
    .from("target_profiles")
    .select("code, name")
    .eq("is_active", true)
    .order("name", { ascending: true }), supabase
    .from("opec_catalog")
    .select("id, profile_code, position_name, external_opec_id")
    .eq("is_active", true)
    .eq("verification_status", "verified")
    .order("position_name", { ascending: true })]);

  return (
    <>
      <section className="page onboard">
        <p className="eyebrow">PERFIL DE PREPARACIÓN</p>
        <h1>Primero, dime a qué mérito apuntas.</h1>
        <p className="lead">
          Una configuración breve debe traducirse inmediatamente en una ruta de práctica.
        </p>
        <OnboardingForm
          initialTargetProfileCode={learningProfile?.target_profile_code ?? targetProfiles?.[0]?.code ?? ""}
          initialTargetOpecId={learningProfile?.target_opec_id ?? ""}
          targetProfiles={targetProfiles ?? []}
          opecs={opecs ?? []}
          initialActiveGoal={learningProfile?.active_goal ?? ""}
          initialPreferredFeedbackStyle={learningProfile?.preferred_feedback_style ?? "socratic"}
          initialActiveAreas={learningProfile?.active_areas ?? []}
          existing={Boolean(learningProfile?.onboarding_completed)}
        />
      </section>
    </>
  );
}
