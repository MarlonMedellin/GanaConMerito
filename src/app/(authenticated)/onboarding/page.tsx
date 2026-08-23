import Link from "next/link";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { isLearningProfileOnboardingComplete } from "@/lib/onboarding/status";
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

  if (isLearningProfileOnboardingComplete(learningProfile)) {
    redirect("/practice");
  }

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Onboarding</p>
        <h1 className="display-title">Configura una base corta para iniciar la práctica.</h1>
        <p className="body-lg">
          Define el perfil y la meta de trabajo. Las áreas que declares son solo una referencia en esta Canary y no filtran las preguntas.
        </p>
        <div className="page-actions">
          <Link href="/home" className="subtle">← Volver a inicio</Link>
        </div>
      </section>

      <OnboardingForm
        initialTargetProfileCode={learningProfile?.target_profile_code ?? targetProfiles?.[0]?.code ?? ""}
        initialTargetOpecId={learningProfile?.target_opec_id ?? ""}
        targetProfiles={targetProfiles ?? []}
        opecs={opecs ?? []}
        initialActiveGoal={learningProfile?.active_goal ?? ""}
        initialPreferredFeedbackStyle={learningProfile?.preferred_feedback_style ?? "socratic"}
        initialActiveAreas={learningProfile?.active_areas ?? []}
      />
    </>
  );
}
