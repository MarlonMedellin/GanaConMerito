import type { SupabaseClient } from "@supabase/supabase-js";
import { isLearningProfileOnboardingComplete } from "@/lib/onboarding/status";

export async function getAuthenticatedLandingPath(
  supabase: SupabaseClient,
  authUserId: string,
): Promise<"/onboarding" | "/practice"> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .single();

  if (!profile) {
    return "/onboarding";
  }

  const { data: learningProfile } = await supabase
    .from("learning_profiles")
    .select("onboarding_completed, active_areas, target_profile_code")
    .eq("profile_id", profile.id)
    .single();

  return isLearningProfileOnboardingComplete(learningProfile) ? "/practice" : "/onboarding";
}
