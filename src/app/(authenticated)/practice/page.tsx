import { redirect } from "next/navigation";
import { PracticeSession } from "@/components/practice/practice-session";
import { isLearningProfileOnboardingComplete } from "@/lib/onboarding/status";
import { requireAuthenticatedProfile } from "@/lib/supabase/guards";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const auth = await requireAuthenticatedProfile();
  if (!auth.ok) {
    redirect("/onboarding");
  }

  const { supabase, profile } = auth;
  const { data: learningProfile } = await supabase
    .from("learning_profiles")
    .select("onboarding_completed, active_areas, target_profile_code")
    .eq("profile_id", profile.id)
    .single();

  if (!isLearningProfileOnboardingComplete(learningProfile)) {
    redirect("/onboarding");
  }

  return (
    <PracticeSession />
  );
}
