import Link from "next/link";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { isLearningProfileOnboardingComplete } from "@/lib/onboarding/status";
import { requireAuthenticatedProfile } from "@/lib/supabase/guards";
import {
  getCanaryOpecCatalog,
  getCanaryTargetingSelection,
  isCanaryTargetingEnabled,
} from "@/lib/targeting/canary-targeting-server";

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

  const canaryTargetingEnabled = isCanaryTargetingEnabled();
  const canaryOpecOptions = getCanaryOpecCatalog();
  const canaryTargetingSelection = await getCanaryTargetingSelection();
  const onboardingComplete = isLearningProfileOnboardingComplete(learningProfile);
  const allowedCanaryProfileCodes = new Set(canaryOpecOptions.map((option) => option.professionalProfileCode));
  const visibleProfessionalProfiles = canaryTargetingEnabled
    ? (professionalProfiles ?? []).filter((professionalProfile) => allowedCanaryProfileCodes.has(professionalProfile.code))
    : (professionalProfiles ?? []);
  const currentProfileStillAvailable = visibleProfessionalProfiles.some(
    (professionalProfile) => professionalProfile.id === learningProfile?.professional_profile_id,
  );
  const initialProfessionalProfileId = currentProfileStillAvailable
    ? learningProfile?.professional_profile_id ?? ""
    : visibleProfessionalProfiles[0]?.id ?? "";

  if (onboardingComplete && (!canaryTargetingEnabled || canaryTargetingSelection)) {
    redirect("/practice");
  }

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Onboarding</p>
        <h1 className="display-title">Configura una base corta, útil y sin ansiedad.</h1>
        <p className="body-lg">
          {canaryTargetingEnabled
            ? "Define tu perfil reusable, el cargo oficial, la OPEC concreta y tus áreas prioritarias para dejar lista la práctica controlada."
            : "Define perfil, meta activa y áreas prioritarias. El objetivo no es llenar formularios: es dejar lista la práctica real."}
        </p>
        <div className="page-actions">
          <Link href="/home" className="subtle">← Volver a inicio</Link>
        </div>
      </section>

      <OnboardingForm
        initialTargetRole={learningProfile?.target_role ?? "docente"}
        initialExamType={learningProfile?.exam_type ?? "docente"}
        initialProfessionalProfileId={initialProfessionalProfileId}
        professionalProfiles={visibleProfessionalProfiles.map((professionalProfile) => ({
          id: professionalProfile.id,
          code: professionalProfile.code,
          name: professionalProfile.name,
        }))}
        initialActiveGoal={learningProfile?.active_goal ?? ""}
        initialPreferredFeedbackStyle={learningProfile?.preferred_feedback_style ?? "socratic"}
        initialActiveAreas={learningProfile?.active_areas ?? []}
        canaryTargetingEnabled={canaryTargetingEnabled}
        canaryOpecOptions={canaryOpecOptions}
        initialCanaryOpecKey={canaryTargetingSelection?.opecKey ?? ""}
      />
    </>
  );
}
