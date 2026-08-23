import type { User } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function inferDisplayName(user: User) {
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Usuario"
  );
}

function inferAvatar(user: User) {
  return user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
}

export async function bootstrapUserProfile(user: User) {
  const admin = getSupabaseAdminClient();

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        auth_user_id: user.id,
        full_name: inferDisplayName(user),
        email: user.email ?? null,
        avatar_url: inferAvatar(user),
      },
      {
        onConflict: "auth_user_id",
      },
    )
    .select("id")
    .single();

  if (profileError || !profile) {
    throw profileError ?? new Error("Profile bootstrap failed.");
  }

  const { data: learningProfile, error: learningProfileLookupError } = await admin
    .from("learning_profiles")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (learningProfileLookupError) {
    throw learningProfileLookupError;
  }

  if (!learningProfile) {
    const { error: learningProfileCreateError } = await admin
      .from("learning_profiles")
      .insert({
        profile_id: profile.id,
        country_context: "colombia",
        preferred_feedback_style: "socratic",
        active_goal: "Completar onboarding inicial",
        active_areas: [],
        onboarding_completed: false,
      });

    if (learningProfileCreateError) {
      throw learningProfileCreateError;
    }
  }

  return {
    profileId: profile.id,
    bootstrapComplete: true,
  };
}
