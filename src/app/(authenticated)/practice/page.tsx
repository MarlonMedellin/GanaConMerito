import Link from "next/link";
import { redirect } from "next/navigation";
import { PracticeSession } from "@/components/practice/practice-session";
import { isLearningProfileOnboardingComplete } from "@/lib/onboarding/status";
import { requireAuthenticatedUser } from "@/lib/supabase/guards";

export default async function PracticePage() {
  const { supabase, user } = await requireAuthenticatedUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  const { data: learningProfile } = await supabase
    .from("learning_profiles")
    .select("onboarding_completed, active_areas")
    .eq("profile_id", profile.id)
    .single();

  if (!isLearningProfileOnboardingComplete(learningProfile)) {
    redirect("/onboarding");
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
