import { redirect } from "next/navigation";
import { PracticeSession } from "@/components/practice/practice-session";
import { isLearningProfileOnboardingComplete } from "@/lib/onboarding/status";
import { requireAuthenticatedProfile } from "@/lib/supabase/guards";
import {
  getCanarySessionTargetingContext,
  getCanaryTargetingSelection,
  isCanaryTargetingEnabled,
} from "@/lib/targeting/canary-targeting-server";

export default async function PracticePage() {
  const auth = await requireAuthenticatedProfile();
  if (!auth.ok) {
    redirect("/login");
  }

  const { supabase, profile } = auth;
  const { data: learningProfile } = await supabase
    .from("learning_profiles")
    .select("onboarding_completed, active_areas, professional_profile_id")
    .eq("profile_id", profile.id)
    .single();

  if (!isLearningProfileOnboardingComplete(learningProfile)) {
    redirect("/onboarding");
  }

  if (isCanaryTargetingEnabled()) {
    const [configuredTargeting, sessionTargeting] = await Promise.all([
      getCanaryTargetingSelection(),
      getCanarySessionTargetingContext(),
    ]);
    const canaryTargeting = configuredTargeting ?? sessionTargeting?.selection ?? null;
    if (!canaryTargeting) {
      redirect("/onboarding");
    }

    const { data: selectedProfile } = await supabase
      .from("professional_profiles")
      .select("code")
      .eq("id", learningProfile?.professional_profile_id)
      .maybeSingle();

    if (!selectedProfile || selectedProfile.code !== canaryTargeting.professionalProfileCode) {
      redirect("/onboarding");
    }
  }

  return (
    <>
      <section className="page-header practice-header" style={{ paddingBottom: 0 }}>
        <p className="eyebrow">Práctica</p>
        <h1 className="display-title">Pregunta, decide y revisa feedback.</h1>
      </section>
      <PracticeSession />
    </>
  );
}
