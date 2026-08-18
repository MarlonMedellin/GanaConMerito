import Link from "next/link";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { isLearningProfileOnboardingComplete } from "@/lib/onboarding/status";
import { requireAuthenticatedProfile } from "@/lib/supabase/guards";

export default async function OnboardingPage() {
  const auth = await requireAuthenticatedProfile();
  if (!auth.ok) {
    redirect("/login");
  }

  const { supabase, profile } = auth;
  const { data: learningProfile } = await supabase
    .from("learning_profiles")
    .select(
      "target_role, exam_type, professional_profile_id, active_goal, preferred_feedback_style, active_areas, onboarding_completed",
    )
    .eq("profile_id", profile.id)
    .single();

  const { data: professionalProfiles } = await supabase
    .from("professional_profiles")
    .select("id, code, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (isLearningProfileOnboardingComplete(learningProfile)) {
    redirect("/practice");
  }

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Onboarding</p>
        <h1 className="display-title">Configura una base corta, útil y sin ansiedad.</h1>
        <p className="body-lg">
          Define perfil, meta activa y áreas prioritarias. El objetivo no es llenar formularios: es dejar lista la práctica real.
        </p>
        <div className="page-actions">
          <Link href="/home" className="subtle">← Volver a inicio</Link>
        </div>
      </section>

      <OnboardingForm
        initialTargetRole={learningProfile?.target_role ?? "docente"}
        initialExamType={learningProfile?.exam_type ?? "docente"}
        initialProfessionalProfileId={learningProfile?.professional_profile_id ?? professionalProfiles?.[0]?.id ?? ""}
        professionalProfiles={(professionalProfiles ?? []).map((profile) => ({
          id: profile.id,
          code: profile.code,
          name: profile.name,
        }))}
        initialActiveGoal={learningProfile?.active_goal ?? ""}
        initialPreferredFeedbackStyle={learningProfile?.preferred_feedback_style ?? "socratic"}
        initialActiveAreas={learningProfile?.active_areas ?? []}
      />
    </>
  );
}
